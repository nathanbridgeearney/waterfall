import { useRef, useState, useEffect } from "react";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Start camera");
  const [showCamera, setShowCamera] = useState(true);

  const startCamera = async () => {
    try {
      setStatus("Starting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      const video = videoRef.current;
      const analysisCanvas = analysisCanvasRef.current;
      const displayCanvas = displayCanvasRef.current;

      if (!video || !analysisCanvas || !displayCanvas) {
        setStatus("Camera unavailable");
        return;
      }

      video.srcObject = stream;

      video.onloadedmetadata = async () => {
        await video.play();

        analysisCanvas.width = 320;
        analysisCanvas.height = 180;

        displayCanvas.width = window.innerWidth;
        displayCanvas.height = window.innerHeight;

        setReady(true);
        setStatus("Camera active");
      };
    } catch (error) {
      console.error("Camera error:", error);
      setStatus("Retry camera");
    }
  };

  useEffect(() => {
    if (!ready) return;

    const video = videoRef.current;
    const analysisCanvas = analysisCanvasRef.current;
    const displayCanvas = displayCanvasRef.current;

    if (!video || !analysisCanvas || !displayCanvas) return;

    const analysisContext = analysisCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    const displayContext = displayCanvas.getContext("2d");

    if (!analysisContext || !displayContext) return;

    const drawFrame = () => {
      analysisContext.drawImage(
        video,
        0,
        0,
        analysisCanvas.width,
        analysisCanvas.height,
      );

      displayContext.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

      if (showCamera) {
        // Development mode: draw the camera onto the visible canvas.
        displayContext.drawImage(
          video,
          0,
          0,
          displayCanvas.width,
          displayCanvas.height,
        );
      } else {
        // Final mode: do not show the camera.
        displayContext.fillStyle = "#18181b";
        displayContext.fillRect(
          0,
          0,
          displayCanvas.width,
          displayCanvas.height,
        );
      }

      frameRef.current = requestAnimationFrame(drawFrame);
    };

    frameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [ready, showCamera]);

  useEffect(() => {
    const resizeDisplayCanvas = () => {
      const displayCanvas = displayCanvasRef.current;

      if (!displayCanvas) return;

      displayCanvas.width = window.innerWidth;
      displayCanvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeDisplayCanvas);

    return () => {
      window.removeEventListener("resize", resizeDisplayCanvas);

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      // Stop the camera when the component is removed.
      const stream = videoRef.current?.srcObject;

      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <main className="fixed inset-0 overflow-hidden bg-zinc-950 text-white">
      <video ref={videoRef} className="hidden" playsInline muted />

      <canvas ref={analysisCanvasRef} className="hidden" />

      <canvas ref={displayCanvasRef} className="fixed inset-0 h-full w-full" />

      <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-2">
        <button
          type="button"
          onClick={startCamera}
          disabled={ready || status === "Starting camera..."}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status}
        </button>

        <button
          type="button"
          onClick={() => setShowCamera((current) => !current)}
          disabled={!ready}
          className="rounded-lg bg-zinc-700 px-4 py-2 text-sm transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showCamera ? "Hide camera" : "Show camera"}
        </button>
      </div>
    </main>
  );
}
