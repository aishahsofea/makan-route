import { useCallback, useRef, useState } from "react";

export type VoiceRecordingState = {
  isRecording: boolean;
  isProcessing: boolean;
  audioBlob: Blob | null;
  duration: number;
  error: string | null;
};

export const useVoiceRecording = () => {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    audioBlob: null,
    duration: 0,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

        setState((prev) => ({
          ...prev,
          audioBlob,
          isRecording: false,
          duration: 0,
        }));
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setState((prev) => ({ ...prev, isRecording: true }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to access microphone. Please check permissions.",
        isRecording: false,
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [state.isRecording]);

  const resetRecording = useCallback(() => {
    setState({
      isRecording: false,
      isProcessing: false,
      audioBlob: null,
      duration: 0,
      error: null,
    });
    chunksRef.current = [];
  }, []);

  return {
    ...state,
    stream: streamRef.current,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
