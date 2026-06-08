import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import * as inferenceService from '../inferenceService';
import { useInferenceStream } from './useInferenceStream';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal ReadableStream that emits the given SSE lines in order,
 * then closes. Each string in `lines` is emitted as a separate read() chunk.
 */
const makeStream = (lines: string[]): ReadableStream<Uint8Array> => {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < lines.length) {
        const line = lines[index];
        index++;
        controller.enqueue(encoder.encode(line));
      } else {
        controller.close();
      }
    },
  });
};

/**
 * Wrap content deltas into SSE data lines and append a [DONE] terminator.
 */
const sseLines = (deltas: string[]): string[] => [
  ...deltas.map(
    (d) => `data: ${JSON.stringify({ choices: [{ delta: { content: d } }] })}\n`
  ),
  'data: [DONE]\n',
];

const mockResponse = (lines: string[]): Response =>
  ({ body: makeStream(lines) }) as unknown as Response;

const mockCallbacks = () => ({
  onChunk: vi.fn(),
  onComplete: vi.fn(),
  onError: vi.fn(),
  onStart: vi.fn(),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useInferenceStream', () => {
  beforeEach(() => {
    vi.spyOn(inferenceService, 'requestInferenceChatCompletion');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('happy path', () => {
    it('calls onStart immediately with a UUID string', async () => {
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockResolvedValue(mockResponse(sseLines(['Hello'])));

      const { result } = renderHook(() => useInferenceStream());
      const cbs = mockCallbacks();

      await result.current.stream([], 'model-a', cbs);

      expect(cbs.onStart).toHaveBeenCalledOnce();
      // Verify the ID is a non-empty string (crypto.randomUUID format)
      const id = cbs.onStart.mock.calls[0][0] as string;
      expect(typeof id).toBe('string');
      expect(id.length).toBe(36);
      expect(id.split('-').length).toBe(5);
    });

    it('calls onComplete with the final parsed content when [DONE] is received', async () => {
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockResolvedValue(mockResponse(sseLines(['Hello', ', ', 'world!'])));

      const { result } = renderHook(() => useInferenceStream());
      const cbs = mockCallbacks();

      await result.current.stream([], 'model-a', cbs);

      expect(cbs.onComplete).toHaveBeenCalledOnce();
      expect(cbs.onComplete.mock.calls[0][1]).toEqual({
        content: 'Hello, world!',
      });
      expect(cbs.onError).not.toHaveBeenCalled();
    });

    it('uses the same ID for onStart, onChunk, and onComplete', async () => {
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockResolvedValue(mockResponse(sseLines(['token'])));

      const { result } = renderHook(() => useInferenceStream());
      const cbs = mockCallbacks();

      await result.current.stream([], 'model-a', cbs);

      const id = cbs.onStart.mock.calls[0][0];
      expect(cbs.onChunk.mock.calls[0][0]).toBe(id);
      expect(cbs.onComplete.mock.calls[0][0]).toBe(id);
    });

    it('correctly parses thinking blocks through to onComplete', async () => {
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockResolvedValue(
        mockResponse(sseLines(['<think>my reasoning</think>', 'The answer.']))
      );

      const { result } = renderHook(() => useInferenceStream());
      const cbs = mockCallbacks();

      await result.current.stream([], 'model-a', cbs);

      expect(cbs.onComplete.mock.calls[0][1]).toEqual({
        content: 'The answer.',
        thinking: 'my reasoning',
      });
    });

    it('ignores SSE lines that do not start with "data: "', async () => {
      const lines = [
        'event: message\n',
        ': keep-alive\n',
        ...sseLines(['hello']),
      ];
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockResolvedValue(mockResponse(lines));

      const { result } = renderHook(() => useInferenceStream());
      const cbs = mockCallbacks();

      await result.current.stream([], 'model-a', cbs);

      expect(cbs.onComplete.mock.calls[0][1]).toEqual({ content: 'hello' });
    });

    it('skips malformed JSON chunks silently without calling onError', async () => {
      const lines = ['data: {this is not json}\n', ...sseLines(['valid'])];
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockResolvedValue(mockResponse(lines));

      const { result } = renderHook(() => useInferenceStream());
      const cbs = mockCallbacks();

      await result.current.stream([], 'model-a', cbs);

      expect(cbs.onError).not.toHaveBeenCalled();
      expect(cbs.onComplete.mock.calls[0][1]).toEqual({ content: 'valid' });
    });

    it('skips delta chunks with empty content without calling onChunk', async () => {
      const lines = [
        `data: ${JSON.stringify({ choices: [{ delta: { content: '' } }] })}\n`,
        ...sseLines(['real content']),
      ];
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockResolvedValue(mockResponse(lines));

      const { result } = renderHook(() => useInferenceStream());
      const cbs = mockCallbacks();

      await result.current.stream([], 'model-a', cbs);

      expect(cbs.onComplete.mock.calls[0][1]).toEqual({
        content: 'real content',
      });
    });

    it('handles partial lines split across read() calls', async () => {
      // Simulate a chunk split mid-line across two reads
      const encoder = new TextEncoder();
      const fullLine = `data: ${JSON.stringify({ choices: [{ delta: { content: 'split' } }] })}\n`;
      const half = Math.floor(fullLine.length / 2);
      const part1 = fullLine.slice(0, half);
      const part2 = fullLine.slice(half) + 'data: [DONE]\n';

      let call = 0;
      const stream = new ReadableStream<Uint8Array>({
        pull(controller) {
          if (call === 0) controller.enqueue(encoder.encode(part1));
          else if (call === 1) controller.enqueue(encoder.encode(part2));
          else controller.close();
          call++;
        },
      });

      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockResolvedValue({ body: stream } as unknown as Response);

      const { result } = renderHook(() => useInferenceStream());
      const cbs = mockCallbacks();

      await result.current.stream([], 'model-a', cbs);

      expect(cbs.onComplete.mock.calls[0][1]).toEqual({ content: 'split' });
    });
  });

  describe('cancellation', () => {
    it('calls onComplete (not onError) with partial content when cancelled', async () => {
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockImplementation((_messages, _model, _stream, signal) => {
        const encoder = new TextEncoder();
        let readCount = 0;
        const stream = new ReadableStream<Uint8Array>({
          pull(controller): Promise<void> | void {
            if (readCount > 0) {
              // Hang until the abort signal fires, then error the stream so
              // reader.read() rejects with an AbortError.
              return new Promise<void>(() => {
                signal?.addEventListener('abort', () => {
                  controller.error(
                    new DOMException(
                      'The user aborted a request.',
                      'AbortError'
                    )
                  );
                });
              });
            }
            readCount++;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ choices: [{ delta: { content: 'partial' } }] })}\n`
              )
            );
          },
        });
        return Promise.resolve({ body: stream } as unknown as Response);
      });

      const { result } = renderHook(() => useInferenceStream());
      const cbs = mockCallbacks();

      const streamPromise = result.current.stream([], 'model-a', cbs);
      // Let the first chunk be read before cancelling.
      await new Promise((resolve) => setTimeout(resolve, 50));
      result.current.cancel();
      await streamPromise;

      expect(cbs.onComplete).toHaveBeenCalledOnce();
      expect(cbs.onError).not.toHaveBeenCalled();
    });

    it('a new stream() call after cancel() works correctly', async () => {
      const encoder = new TextEncoder();

      // First call: a hanging stream that responds to abort
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockImplementationOnce((_messages, _model, _stream, signal) => {
        let readCount = 0;
        const stream = new ReadableStream<Uint8Array>({
          pull(controller): Promise<void> | void {
            if (readCount > 0) {
              return new Promise<void>(() => {
                signal?.addEventListener('abort', () => {
                  controller.error(
                    new DOMException(
                      'The user aborted a request.',
                      'AbortError'
                    )
                  );
                });
              });
            }
            readCount++;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ choices: [{ delta: { content: 'first' } }] })}\n`
              )
            );
          },
        });
        return Promise.resolve({ body: stream } as unknown as Response);
      });

      // Second call: a normal completing stream
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockResolvedValueOnce(mockResponse(sseLines(['second'])));

      const { result } = renderHook(() => useInferenceStream());
      const firstCbs = mockCallbacks();
      const secondCbs = mockCallbacks();

      // Start first stream, cancel it, then immediately start second
      const firstPromise = result.current.stream([], 'model-a', firstCbs);
      await new Promise((resolve) => setTimeout(resolve, 50));
      result.current.cancel();
      await firstPromise;

      await result.current.stream([], 'model-a', secondCbs);

      expect(secondCbs.onComplete.mock.calls[0][1]).toEqual({
        content: 'second',
      });
      expect(secondCbs.onError).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('calls onError when requestInferenceChatCompletion rejects', async () => {
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useInferenceStream());
      const cbs = mockCallbacks();

      await result.current.stream([], 'model-a', cbs);

      expect(cbs.onError).toHaveBeenCalledOnce();
      expect(cbs.onComplete).not.toHaveBeenCalled();
    });

    it('calls onError when response.body is null', async () => {
      vi.mocked(
        inferenceService.requestInferenceChatCompletion
      ).mockResolvedValue({ body: null } as unknown as Response);

      const { result } = renderHook(() => useInferenceStream());
      const cbs = mockCallbacks();

      await result.current.stream([], 'model-a', cbs);

      expect(cbs.onError).toHaveBeenCalledOnce();
      expect(cbs.onComplete).not.toHaveBeenCalled();
    });
  });
});
