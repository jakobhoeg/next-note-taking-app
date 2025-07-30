import { useEffect, useRef, useState, startTransition } from "react";
// If you have a local useElementWidth hook, import it. Otherwise, use a fallback.
// import { useElementWidth } from "@/hooks/use-element-width";

// Fallback for useElementWidth if not present
function useElementWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    function update() {
      if (ref.current) setWidth(ref.current.offsetWidth);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref]);
  return width;
}

import { clsx } from "clsx";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface AudioWaveformProps {
  analyserNode: AnalyserNode | null;
  isPaused: boolean;
}

export function AudioWaveform({ analyserNode, isPaused }: AudioWaveformProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const barsContainerRef = useRef<HTMLDivElement | null>(null);

  const MAX_BARS = 60;
  const resolution = 32; // ms
  const scalingFactor = 300;

  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    if (!analyserNode) {
      setBars(Array(MAX_BARS).fill(-1));
      return;
    }
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const captureAmplitude = () => {
      analyserNode.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const sample = (dataArray[i] - 128) / 128;
        sum += sample * sample;
      }
      const rms = Math.sqrt(sum / bufferLength);
      startTransition(() => {
        setBars((prev) => {
          const newBars = [...prev, rms];
          const slicedBars = newBars.slice(-MAX_BARS);
          if (slicedBars.length < MAX_BARS) {
            return [
              ...Array(MAX_BARS - slicedBars.length).fill(-1),
              ...slicedBars,
            ];
          }
          return slicedBars;
        });
      });
    };

    intervalRef.current = setInterval(captureAmplitude, resolution);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [MAX_BARS, analyserNode]);

  return (
    <div
      className="mt-4 flex h-8 items-center gap-[1px] md:mt-5 max-w-[200px] w-full"
      ref={barsContainerRef}
    >
      {bars.map((amplitude, index) => (
        <div
          key={index}
          className={clsx(
            "w-[2px]",
            isPaused
              ? "bg-gray-300"
              : amplitude >= 0
                ? "bg-gray-600"
                : "bg-gray-200"
          )}
          style={{
            height: `${clamp(amplitude * scalingFactor, 2, 32)}px`,
          }}
        />
      ))}
    </div>
  );
}
