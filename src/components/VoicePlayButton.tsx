"use client";

import { TextToSpeechState, useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Button } from "@heroui/react";
import {
  AudioLinesIcon,
  CircleStopIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";

type VoicePlayButtonProps = {
  messageId: string;
  text: string;
  className?: string;
  autoPlayTTSState: TextToSpeechState;
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "bordered" | "light";
};

export const VoicePlayButton = ({
  messageId,
  text,
  className,
  autoPlayTTSState,
  size = "sm",
  variant = "light",
}: VoicePlayButtonProps) => {
  const { state, speak, pause, resume, stop } = useTextToSpeech();

  const isCurrentMessage = autoPlayTTSState.currentMessage?.id === messageId;

  const isPlaying =
    state.isPlaying || (autoPlayTTSState.isPlaying && isCurrentMessage);
  const isPaused =
    state.isPaused || (autoPlayTTSState.isPaused && isCurrentMessage);
  const isLoading =
    state.isLoading || (autoPlayTTSState.isLoading && isCurrentMessage);

  console.log({ text, autoPlayTTSState });

  const handlePlay = () => {
    if (!state.isPlaying) {
      speak({ id: messageId, text, priority: "normal", messageId });
    } else if (state.isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const getPlayIcon = () => {
    if (isLoading) {
      return <AudioLinesIcon className="w-4 h-4 animate-pulse" />;
    }

    if (isPlaying && !isPaused) {
      return <PauseIcon className="w-4 h-4 text-amber-600" />;
    }

    return <PlayIcon className="w-4 h-4 text-amber-600" />;
  };

  const isCurrentText = state.currentMessage?.id === messageId;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        size={size}
        variant={variant}
        isIconOnly
        onPress={handlePlay}
        isDisabled={!text.trim()}
        className={isCurrentText && state.isPlaying ? "text-primary" : ""}
        aria-label={
          state.isPlaying && !state.isPaused ? "Pause speech" : "Play speech"
        }
      >
        {getPlayIcon()}
      </Button>

      {isCurrentText && state.isPlaying && (
        <Button
          size={size}
          variant={variant}
          isIconOnly
          onPress={stop}
          aria-label="Pause speech"
        >
          <CircleStopIcon className="w-4 h-4 text-amber-600" />
        </Button>
      )}
    </div>
  );
};
