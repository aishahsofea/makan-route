import { useCallback, useState } from "react";

export type AudioQueueItem = {
  id: string;
  text: string;
  priority: "low" | "normal" | "high";
  messageId?: string;
};

export type AudioQueueState = {
  queue: AudioQueueItem[];
  currentItem: AudioQueueItem | null;
  isProcessing: boolean;
};

export const useAudioQueue = () => {
  const [state, setState] = useState<AudioQueueState>({
    queue: [],
    currentItem: null,
    isProcessing: false,
  });

  const addToQueue = useCallback((item: AudioQueueItem) => {
    setState((prev) => ({
      ...prev,
      queue: [...prev.queue, item].sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
    }));
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      queue: prev.queue.filter((item) => item.id !== id),
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setState((prev) => ({ ...prev, queue: [] }));
  }, []);

  const processNext = useCallback(() => {
    setState((prev) => {
      if (prev.queue.length === 0 || prev.isProcessing) {
        return prev;
      }

      const [nextItem, ...remainingQueue] = prev.queue;

      return {
        ...prev,
        queue: remainingQueue,
        currentItem: nextItem,
        isProcessing: true,
      };
    });
  }, []);

  const finishCurrent = useCallback(() => {
    setState((prev) => ({ ...prev, currentItem: null, isProcessing: false }));
  }, []);

  const getCurrentPosition = useCallback(
    (id: string) => {
      return state.queue.findIndex((item) => item.id === id) + 1;
    },
    [state.queue]
  );

  return {
    state,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processNext,
    finishCurrent,
    getCurrentPosition,
  };
};
