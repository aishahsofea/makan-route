"use client";

import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { Button } from "@heroui/react";
import { Loader2, Mic, MicOff } from "lucide-react";
import { useEffect } from "react";

type VoiceRecordButtonProps = {
  onTranscription: (text: string) => void;
  isDisabled?: boolean;
  onRecordingStateChange?: (isRecording: boolean, stream?: MediaStream | null) => void;
};

export const VoiceRecordButton = ({
  onTranscription,
  isDisabled,
  onRecordingStateChange,
}: VoiceRecordButtonProps) => {
  const {
    isRecording,
    audioBlob,
    duration,
    stream,
    error: recordingError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecording();

  const {
    transcribeAudio,
    isTranscribing,
    error: transcriptionError,
  } = useSpeechToText();

  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleTranscription();
    }
  }, [audioBlob, isRecording]);

  useEffect(() => {
    onRecordingStateChange?.(isRecording, stream);
  }, [isRecording, stream, onRecordingStateChange]);

  const handleTranscription = async () => {
    if (!audioBlob) return;

    const text = await transcribeAudio(audioBlob);

    if (text) {
      onTranscription(text.trim());
      resetRecording();
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isProcessing = isTranscribing;
  const hasError = recordingError || transcriptionError;

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onPress={handleToggleRecording}
        isDisabled={isDisabled || isProcessing}
        variant={isRecording ? "solid" : "flat"}
        color={isRecording ? "danger" : "primary"}
        isIconOnly
        size="sm"
        className={`transition-all duration-200 ${
          isRecording ? "bg-red-500 hover:bg-red-600" : ""
        }`}
      >
        {isProcessing && <Loader2 size={16} className="animate-spin" />}
        {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
      </Button>

      {isRecording && (
        <div className="text-xs text-gray-500 min-w-[3rem] text-center">
          {formatDuration(duration)}
        </div>
      )}

      {isProcessing && (
        <div className="text-xs text-blue-500">Transcribing...</div>
      )}

      {hasError && (
        <div className="text-xs text-red-500 max-w-[8rem] text-center">
          {recordingError || transcriptionError}
        </div>
      )}
    </div>
  );
};
