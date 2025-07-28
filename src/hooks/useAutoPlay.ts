import { useCallback, useEffect, useState } from "react";
import { useAudioQueue } from "./useAudioQueue";
import { useTextToSpeech } from "./useTextToSpeech";

type AutoPlaySettings = {
  enabled: boolean;
  newMessagesOnly: boolean;
  assistantOnly: boolean;
};

export const useAutoPlay = () => {
  const [settings, setSettings] = useState<AutoPlaySettings>({
    enabled: false,
    newMessagesOnly: true,
    assistantOnly: true,
  });

  const audioQueue = useAudioQueue();
  const tts = useTextToSpeech();

  useEffect(() => {
    // Cancel any ongoing speech when the page reloads
    window.speechSynthesis.cancel();
  }, []);

  // Process queue automatically
  useEffect(() => {
    if (!audioQueue.state.isProcessing && audioQueue.state.queue.length > 0) {
      audioQueue.processNext();
    }
  }, [audioQueue.state.queue.length, audioQueue.state.isProcessing]);

  // Play current item
  useEffect(() => {
    if (audioQueue.state.currentItem && !tts.state.isPlaying) {
      tts.speak(audioQueue.state.currentItem.text);
    }
  }, [audioQueue.state.currentItem]);

  // Finish current item when TTS ends
  useEffect(() => {
    if (
      audioQueue.state.isProcessing &&
      !tts.state.isPlaying &&
      !tts.state.isLoading &&
      audioQueue.state.currentItem
    ) {
      audioQueue.finishCurrent();
    }
  }, [tts.state.isPlaying, tts.state.isLoading, audioQueue.state.isProcessing]);

  const queueMessage = useCallback(
    (
      text: string,
      messageId: string,
      role: "user" | "assistant",
      priority: "low" | "normal" | "high" = "normal"
    ) => {
      if (!settings.enabled) return;
      if (settings.assistantOnly && role !== "assistant") return;

      audioQueue.addToQueue({
        id: messageId,
        text,
        priority,
        messageId,
      });
    },
    [settings, audioQueue]
  );

  const updateSettings = useCallback(
    (newSettings: Partial<AutoPlaySettings>) => {
      setSettings((prev) => ({
        ...prev,
        ...newSettings,
      }));
    },
    []
  );

  return { settings, audioQueue, tts, queueMessage, updateSettings };
};
