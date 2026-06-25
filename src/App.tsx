import {
  useRef,
  useState,
  useEffect
} from 'react'


export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState('Click to start')

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStatus('Camera started')
      }
    }catch{
      setStatus('Error starting camera')
    }
  }


return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4 p-4">
      <p className="text-sm text-white/50">{status}</p>
      <button
        onClick={startCamera}
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm transition-colors"
      >
        Start camera
      </button>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-xl border border-white/10 w-full max-w-2xl"
      />
    </div>
  )

}
