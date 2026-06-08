import { createChatCompletion } from '@linode/api-v4';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getExtraPresets, isMSWEnabled } from 'src/dev-tools/utils';

import { useInferenceStream } from '../hooks/useInferenceStream';
import { requestInferenceChatCompletion } from '../inferenceService';
import {
  type Message,
  ModelPlaygroundInputContext,
  ModelPlaygroundModelContext,
  ModelPlaygroundOutputContext,
} from './ModelPlaygroundContext';
import { parseThinking } from './utils';

// Toggle between streaming (SSE) and non-streaming (standard JSON) response mode.
// TODO: Wire this up to a user-facing control once the UI supports it.
const USE_STREAMING = true;

// Placeholder model/provider until these are selectable from the Tuning sidebar.
const MOCK_MODEL = 'gemma-4-31b';
const MOCK_PROVIDER = 'google';

interface Props {
  children: React.ReactNode;
}

export const ModelPlaygroundProvider = ({ children }: Props) => {
  const { model: modelFromUrl } = useSearch({
    from: '/inference-platform/model-playground',
  });
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<null | string>(
    null
  );
  const [selectedModel, setSelectedModel] = useState(modelFromUrl ?? '');

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

  // Abort any in-flight stream if the user navigates away from the playground.
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  // Refs keep onSend stable to avoid consumer rerenders during streaming
  const inputValueRef = useRef(inputValue);
  const isLoadingRef = useRef(isLoading);
  const messagesRef = useRef(messages);
  const selectedModelRef = useRef(selectedModel);

  inputValueRef.current = inputValue;
  isLoadingRef.current = isLoading;
  messagesRef.current = messages;
  selectedModelRef.current = selectedModel;

  const applyStreamStart = useCallback((id: string) => {
    setMessages((prev) => [...prev, { content: '', id, role: 'assistant' }]);
    setStreamingMessageId(id);
  }, []);

  const applyStreamChunk = useCallback(
    (id: string, parsed: { content: string; thinking?: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...parsed } : m))
      );
    },
    []
  );

  const applyStreamComplete = useCallback(
    (id: string, final: { content: string; thinking?: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...final } : m))
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
      if (USE_STREAMING) {
        await stream(conversationMessages, selectedModelRef.current, {
          onChunk: applyStreamChunk,
          onComplete: applyStreamComplete,
          onError: applyStreamError,
          onStart: applyStreamStart,
        });
        return;
      }

      // Non-streaming path
      try {
        const response = await requestInferenceChatCompletion(
          conversationMessages,
          selectedModelRef.current
        );
        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content ?? '';
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
        // No response if the inference endpoint is unreachable.
        // TODO: Error handling in future Jira case: HELIX-39
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // MSW mock path
    try {
      const response = await createChatCompletion({
        messages: conversationMessages,
        model: MOCK_MODEL,
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
    stream,
  ]);

  const inputContextValue = useMemo(
    () => ({
      inputValue,
      isLoading,
      onCancel: cancel,
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
