import { createChatCompletion } from '@linode/api-v4';
import { useProfile } from '@linode/queries';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getExtraPresets, isMSWEnabled } from 'src/dev-tools/utils';

import { useInferenceStream } from '../hooks/useInferenceStream';
import { requestInferenceChatCompletion } from '../inferenceService';
import { getOrCreatePlaygroundKey } from '../playgroundKeyService';
import {
  type Message,
  type MessageMetadata,
  ModelPlaygroundInputContext,
  ModelPlaygroundModelContext,
  ModelPlaygroundOptionsContext,
  ModelPlaygroundOutputContext,
} from './ModelPlaygroundContext';
import { mapSettingsToApiOptions } from './types';
import { parseThinking } from './utils';

const MOCK_PROVIDER = 'google';

interface Props {
  children: React.ReactNode;
}

export const ModelPlaygroundProvider = ({ children }: Props) => {
  const search = useSearch({ strict: false }) as { model?: string };
  const modelFromUrl = search.model;
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<null | string>(
    null
  );
  const [selectedModel, setSelectedModel] = useState(modelFromUrl ?? '');

  const { settings } = useContext(ModelPlaygroundOptionsContext);

  const onModelChange = useCallback(
    (model: string) => {
      setSelectedModel(model);
      navigate({
        search: (prev) => ({ ...prev, model }),
        to: '/inference-platform/model-playground',
      });
    },
    [navigate]
  );

  const { cancel, stream } = useInferenceStream();
  const nonStreamAbortRef = useRef<AbortController | null>(null);

  // Abort any in-flight request if the user navigates away from the playground.
  useEffect(() => {
    return () => {
      cancel();
      nonStreamAbortRef.current?.abort();
    };
  }, [cancel]);

  // Refs keep onSend stable to avoid consumer rerenders during streaming
  const inputValueRef = useRef(inputValue);
  const isLoadingRef = useRef(isLoading);
  const messagesRef = useRef(messages);
  const selectedModelRef = useRef(selectedModel);
  const settingsRef = useRef(settings);

  inputValueRef.current = inputValue;
  isLoadingRef.current = isLoading;
  messagesRef.current = messages;
  selectedModelRef.current = selectedModel;
  settingsRef.current = settings;

  const applyStreamStart = useCallback((id: string, startedAt: number) => {
    setMessages((prev) => [
      ...prev,
      { content: '', id, role: 'assistant', startedAt },
    ]);
    setStreamingMessageId(id);
  }, []);

  const applyStreamChunk = useCallback(
    (
      id: string,
      parsed: { content: string; thinking?: string },
      timeToFirstTokenMs?: number
    ) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                ...parsed,
                ...(timeToFirstTokenMs !== undefined && { timeToFirstTokenMs }),
              }
            : m
        )
      );
    },
    []
  );

  const applyStreamComplete = useCallback(
    (
      id: string,
      final: { content: string; thinking?: string },
      metadata?: MessageMetadata
    ) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, ...final, ...(metadata && { metadata }) } : m
        )
      );
      setStreamingMessageId(null);
      setIsLoading(false);
    },
    []
  );

  const applyStreamError = useCallback((id: string) => {
    // If the stream fails before completion, remove the empty placeholder row
    // so users do not see a stuck assistant bubble.
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setStreamingMessageId(null);
    setIsLoading(false);
  }, []);

  const onSend = useCallback(async () => {
    const trimmed = inputValueRef.current.trim();
    if (!trimmed || isLoadingRef.current || !selectedModelRef.current) return;

    const userMessage: Message = {
      content: trimmed,
      id: crypto.randomUUID(),
      role: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const conversationMessages = [...messagesRef.current, userMessage].map(
      ({ content, role }) => ({ content, role })
    );

    if (
      !isMSWEnabled ||
      !getExtraPresets().includes('inferencePlatform:chat-completions')
    ) {
      // Get or create a playground API key for authentication
      let apiKey: string;
      try {
        if (!profile?.username) {
          // Cannot create playground key without a valid username
          setIsLoading(false);
          return;
        }
        apiKey = await getOrCreatePlaygroundKey(profile.username);
      } catch {
        // TODO: Handle API key creation failure
        setIsLoading(false);
        return;
      }

      // Streaming path
      if (settingsRef.current.stream) {
        await stream(
          conversationMessages,
          selectedModelRef.current,
          apiKey,
          {
            onChunk: applyStreamChunk,
            onComplete: applyStreamComplete,
            onError: applyStreamError,
            onStart: applyStreamStart,
          },
          settingsRef.current
        );
        return;
      }

      // Non-streaming path
      const assistantId = crypto.randomUUID();
      const startTime = Date.now();
      applyStreamStart(assistantId, startTime);
      const nonStreamAbort = new AbortController();
      nonStreamAbortRef.current = nonStreamAbort;
      try {
        const apiOptions = mapSettingsToApiOptions(settingsRef.current);
        const requestMessages = settingsRef.current.systemPrompt
          ? [
              {
                content: settingsRef.current.systemPrompt,
                role: 'system' as const,
              },
              ...conversationMessages,
            ]
          : conversationMessages;

        const response = await requestInferenceChatCompletion(
          requestMessages,
          selectedModelRef.current,
          apiKey,
          apiOptions,
          nonStreamAbort.signal
        );

        const data = await response.json();
        const durationMs = Date.now() - startTime;
        const raw = data.choices?.[0]?.message?.content ?? '';
        const rawReasoning = data.choices?.[0]?.message?.reasoning ?? '';
        const completionTokens: number | undefined =
          data.usage?.completion_tokens ?? undefined;
        const promptTokens: number | undefined =
          data.usage?.prompt_tokens ?? undefined;
        const { content: assistantContent, thinking } = rawReasoning
          ? { content: raw, thinking: rawReasoning }
          : parseThinking(raw);

        applyStreamComplete(
          assistantId,
          { content: assistantContent, thinking },
          {
            completionTokens,
            durationMs,
            promptTokens,
          }
        );
      } catch {
        if (nonStreamAbort.signal.aborted) {
          applyStreamComplete(
            assistantId,
            { content: '' },
            {
              cancelled: true,
              durationMs: Date.now() - startTime,
            }
          );
        } else {
          // No response if the inference endpoint is unreachable.
          // TODO: Error handling in future Jira case: HELIX-39
          applyStreamError(assistantId);
        }
      } finally {
        nonStreamAbortRef.current = null;
      }
      return;
    }

    // MSW mock path
    try {
      const response = await createChatCompletion({
        messages: conversationMessages,
        model: selectedModelRef.current,
        provider: MOCK_PROVIDER,
      });
      const raw = response.choices[0]?.message.content ?? '';
      const { content: assistantContent, thinking } = parseThinking(raw);
      setMessages((prev) => [
        ...prev,
        {
          content: assistantContent,
          id: crypto.randomUUID(),
          role: 'assistant',
          thinking,
        },
      ]);
    } catch {
      // No response when MSW is not active or the API is unavailable.
      // TODO: Error handling in future Jira case: HELIX-39
    } finally {
      setIsLoading(false);
    }
  }, [
    applyStreamChunk,
    applyStreamComplete,
    applyStreamError,
    applyStreamStart,
    profile?.username,
    stream,
  ]);

  const inputContextValue = useMemo(
    () => ({
      inputValue,
      isLoading,
      onCancel: () => {
        cancel();
        nonStreamAbortRef.current?.abort();
      },
      onInputChange: setInputValue,
      onSend,
    }),
    [cancel, inputValue, isLoading, onSend]
  );

  const modelContextValue = useMemo(
    () => ({
      onModelChange,
      selectedModel,
    }),
    [onModelChange, selectedModel]
  );

  const outputContextValue = useMemo(
    () => ({
      isLoading,
      messages,
      streamingMessageId,
    }),
    [isLoading, messages, streamingMessageId]
  );

  return (
    <ModelPlaygroundInputContext.Provider value={inputContextValue}>
      <ModelPlaygroundModelContext.Provider value={modelContextValue}>
        <ModelPlaygroundOutputContext.Provider value={outputContextValue}>
          {children}
        </ModelPlaygroundOutputContext.Provider>
      </ModelPlaygroundModelContext.Provider>
    </ModelPlaygroundInputContext.Provider>
  );
};
