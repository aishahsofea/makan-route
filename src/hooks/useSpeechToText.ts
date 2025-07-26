import { useState } from "react";

export const useSpeechToText = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const result = await response.json();

      if (result.success) {
        return result.text;
      } else {
        throw new Error(result.error || "Transcription failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Transcription failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    isTranscribing,
    error,
    transcribeAudio,
  };
};
