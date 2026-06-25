import { useRef, useState, useEffect } from "react";

interface WallColour {
  r: number;
  g: number;
  b: number;
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const [status, setStatus] = useState("Click to start");
  const [ready, setReady] = useState(false);
  const [wallColour, setWallColour] = useState<WallColour | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        setReady(true);
        setStatus("");
      };
    } catch {
      setStatus("Error starting camera");
    }
  };

  const getWallColour = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const { width: W, height: H } = canvas;

    const imageData = ctx.getImageData(0, 0, W, H).data;

    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;

    const step = 4;

    for (let y = Math.floor(H * 0.2); y < Math.floor(H * 0.8); y += step) {
      for (let x = Math.floor(W * 0.2); x < Math.floor(W * 0.8); x += step) {
        const i = (y * W + x) * 4;

        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        n++;
      }
    }

    if (n === 0) {
      setStatus("No pixels sampled");
      return;
    }

    const colour = {
      r: Math.round(r / n),
      g: Math.round(g / n),
      b: Math.round(b / n),
    };

    setWallColour(colour);
  };

  useEffect(() => {
    if (!ready) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(frameRef.current);
  }, [ready]);

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white">
      <video ref={videoRef} className="hidden" playsInline />
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <p className="text-sm text-white/50">{status}</p>

        <div className="flex gap-2">
          <button
            onClick={startCamera}
            disabled={ready}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
          >
            {ready ? "Camera active" : "Start camera"}
          </button>

          <button
            onClick={getWallColour}
            disabled={!ready}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
          >
            {wallColour
              ? `RGB: ${wallColour.r}, ${wallColour.g}, ${wallColour.b}`
              : "Sample wall"}
          </button>
        </div>
      </div>
    </div>
  );
}
