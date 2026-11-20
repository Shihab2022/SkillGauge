"use client";

import { useEffect, useRef } from "react";

interface AudioWaveVisualizerProps {
  analyser?: AnalyserNode | null;
  micLevel?: number;
  isActive?: boolean;
  className?: string;
  height?: number;
  barCount?: number;
  barColor?: string;
}

export function AudioWaveVisualizer({
  analyser,
  micLevel = 0,
  isActive = true,
  className = "",
  height = 36,
  barCount = 28,
  barColor = "rgb(14, 165, 233)", // sky-500
}: AudioWaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      phase += 0.08;

      let currentLevel = micLevel;
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        // Average low-to-mid speech frequencies
        let sum = 0;
        const speechBins = Math.min(dataArray.length, 64);
        for (let i = 0; i < speechBins; i++) {
          sum += dataArray[i];
        }
        currentLevel = Math.min(1, (sum / speechBins / 255) * 2.2);
      }

      const totalBars = barCount;
      const spacing = 3;
      const barWidth = Math.max(2, (width - (totalBars - 1) * spacing) / totalBars);

      for (let i = 0; i < totalBars; i++) {
        // Calculate dynamic height based on frequency data or micLevel + sinusoidal ripple
        let barHeightRatio = 0.08; // subtle resting height

        if (isActive && currentLevel > 0.02) {
          if (analyser && dataArray) {
            const binIdx = Math.floor((i / totalBars) * Math.min(dataArray.length, 96));
            const binVal = dataArray[binIdx] / 255;
            barHeightRatio = Math.max(0.08, binVal * 0.95);
          } else {
            const wave = Math.sin(phase + i * 0.45) * 0.3 + 0.7;
            barHeightRatio = Math.max(0.08, currentLevel * wave);
          }
        } else if (isActive) {
          // Idle ambient gentle wave
          barHeightRatio = 0.06 + Math.sin(phase + i * 0.3) * 0.04;
        }

        const barHeight = Math.max(3, barHeightRatio * (h - 4));
        const x = i * (barWidth + spacing);
        const y = (h - barHeight) / 2;

        // Gradient styling
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (currentLevel > 0.08) {
          grad.addColorStop(0, "rgba(56, 189, 248, 0.95)"); // light cyan/sky
          grad.addColorStop(1, "rgba(14, 116, 144, 0.85)"); // cyan-700
        } else {
          grad.addColorStop(0, "rgba(148, 163, 184, 0.4)");
          grad.addColorStop(1, "rgba(100, 116, 139, 0.25)");
        }

        ctx.fillStyle = grad;
        // Rounded bar
        ctx.beginPath();
        const r = Math.min(barWidth / 2, 2.5);
        ctx.roundRect ? ctx.roundRect(x, y, barWidth, barHeight, r) : ctx.rect(x, y, barWidth, barHeight);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [analyser, micLevel, isActive, barCount, barColor]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={height}
      className={`block w-full max-w-full rounded-md ${className}`}
      style={{ height: `${height}px` }}
    />
  );
}
