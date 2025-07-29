import { useCallback, useEffect, useRef, useState } from "react";
import { AudioQueueItem } from "./useAudioQueue";

export type TextToSpeechState = {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
  currentMessage: AudioQueueItem | null;
};

type VoiceSettings = {
  voice: SpeechSynthesisVoice | null;
  rate: number; // 0.1 to 10
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
};

export const useTextToSpeech = () => {
  const [state, setState] = useState<TextToSpeechState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    error: null,
    currentMessage: null,
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 0.8,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (availableVoices.length > 0 && !voiceSettings.voice) {
        const englishVoice =
          availableVoices.find((voice) => voice.lang.startsWith("en")) ||
          availableVoices[0];
        setVoiceSettings((prev) => ({ ...prev, voice: englishVoice }));
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [voiceSettings.voice]);

  const speak = useCallback(
    (message: AudioQueueItem) => {
      const { text } = message;
      if (!text.trim()) return;

      window.speechSynthesis.cancel(); // Stop any ongoing speech

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        currentMessage: message,
      }));

      const utterance = new SpeechSynthesisUtterance(text);

      if (voiceSettings.voice) utterance.voice = voiceSettings.voice;
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      utterance.onstart = () => {
        setState((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
          isLoading: false,
        }));
      };

      utterance.onend = () => {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          currentMessage: null,
        }));
      };

      utterance.onerror = (event) => {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          isLoading: false,
          error: `Speech synthesis error: ${event.error}`,
          currentMessage: null,
        }));
      };

      utterance.onpause = () => {
        setState((prev) => ({ ...prev, isPaused: true }));
      };

      utterance.onresume = () => {
        setState((prev) => ({ ...prev, isPaused: false }));
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [voiceSettings]
  );

  const pause = useCallback(() => {
    if (state.isPlaying && !state.isPaused) {
      window.speechSynthesis.pause();
    }
  }, [state.isPlaying, state.isPaused]);

  const resume = useCallback(() => {
    if (state.isPlaying && state.isPaused) {
      window.speechSynthesis.resume();
    }
  }, [state.isPlaying, state.isPaused]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentMessage: null,
    }));
  }, []);

  const updateVoiceSettings = useCallback(
    (newSettings: Partial<VoiceSettings>) => {
      setVoiceSettings((prev) => ({
        ...prev,
        ...newSettings,
      }));
    },
    []
  );

  return {
    state,
    voiceSettings,
    voices,
    speak,
    pause,
    resume,
    stop,
    updateVoiceSettings,
  };
};
