"use client";
import { useEffect, useRef } from "react";

type AudioVisualizerProps = {
  isRecording: boolean;
  stream?: MediaStream;
  className?: string;
  height?: number;
  barCount?: number;
  color?: string;
};

export const AudioVisualizer = ({
  isRecording,
  stream,
  className = "",
  height = 100,
  barCount = 50,
  color = "#3B82F6",
}: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const amplitudeHistory = useRef<number[]>([]);

  useEffect(() => {
    if (!stream || !isRecording) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      return;
    }

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyzer = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyzer.fftSize = 512;
    analyzer.smoothingTimeConstant = 0.8;
    source.connect(analyzer);
    analyzerRef.current = analyzer;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio * 0.8;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Calculate how many bars we need to fill the canvas width
    const barWidth = 2;
    const barSpacing = 1;
    const totalBarWidth = barWidth + barSpacing;
    const actualBarCount = Math.ceil(canvas.offsetWidth / totalBarWidth);
    const effectiveBarCount = Math.max(barCount, actualBarCount);

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const animate = () => {
      analyzer.getByteFrequencyData(dataArray);

      // Calculate average amplitude
      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedAmplitude = (average / 255) * 1.2;

      // Add to history and maintain size
      amplitudeHistory.current.push(normalizedAmplitude);
      if (amplitudeHistory.current.length > effectiveBarCount) {
        amplitudeHistory.current.shift();
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.offsetWidth, height);

      // Draw waveform bars from right to left
      ctx.fillStyle = color;

      // Fill the entire canvas width with bars
      for (let i = 0; i < effectiveBarCount; i++) {
        // Get amplitude from newest to oldest (right to left)
        const dataIndex = amplitudeHistory.current.length - 1 - i;
        const amplitude =
          dataIndex >= 0 ? amplitudeHistory.current[dataIndex] : 0;
        const barHeight = Math.max(2, amplitude * height * 0.8);
        const x = canvas.offsetWidth - (i + 1) * totalBarWidth;
        const y = (height - barHeight) / 2;

        // Draw rounded rectangle
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isRecording, stream, height, barCount, color]);

  if (!isRecording) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="flex items-center space-x-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-gray-400 rounded-full animate-pulse"
              style={{
                height: Math.random() * 16 + 4,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height }}
    />
  );
};
