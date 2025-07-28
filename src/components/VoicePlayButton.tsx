"use client";

import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Button } from "@heroui/react";
import {
  AudioLinesIcon,
  CircleStopIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";

type VoicePlayButtonProps = {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "bordered" | "light";
};

export const VoicePlayButton = ({
  text,
  className,
  size = "sm",
  variant = "light",
}: VoicePlayButtonProps) => {
  const { state, speak, pause, resume, stop } = useTextToSpeech();

  const handlePlay = () => {
    if (!state.isPlaying) {
      speak(text);
    } else if (state.isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const getPlayIcon = () => {
    if (state.isLoading) {
      return <AudioLinesIcon className="w-4 h-4 animate-pulse" />;
    }

    if (state.isPlaying && !state.isPaused) {
      return <PauseIcon className="w-4 h-4 text-amber-600" />;
    }

    return <PlayIcon className="w-4 h-4 text-amber-600" />;
  };

  const isCurrentText = state.currentText === text;

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
