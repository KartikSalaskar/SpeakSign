import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Camera, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ISLConvert = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recognizedText, setRecognizedText] = useState("Waiting...");
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start Camera
  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Camera blocked. Please allow permissions or close other apps.");
    }
  };

  // Capture & Send
  const handleCapture = async () => {
    if (!videoRef.current || !isStreaming) return;
    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, 'capture.jpg');

        try {
          // Call Node.js Backend
          const response = await fetch('http://localhost:5000/api/recognize', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error("Server Error");

          const data = await response.json();
          setRecognizedText(data.prediction || "Unknown");
          setConfidence(data.confidence ? Math.round(data.confidence) : 0);
        } catch (err) {
          console.error(err);
          setRecognizedText("Error");
          setError("Backend not connected. Is 'node server.js' running?");
        } finally {
          setIsProcessing(false);
        }
      }, 'image/jpeg');
    } catch (err) {
      console.error("Capture failed:", err);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">ISL to Text Converter</h1>
            
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /><span>{error}</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Camera Feed */}
              <Card className="p-4 bg-black/5 border-2 border-dashed border-gray-300 min-h-[300px] flex flex-col justify-between">
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-4">
                  <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" playsInline muted />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCapture} disabled={isProcessing || !isStreaming} className="flex-1 h-12 text-lg gap-2">
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Camera />}
                    {isProcessing ? "Analyzing..." : "Capture Sign"}
                  </Button>
                  <Button onClick={startCamera} variant="outline" size="icon" className="h-12 w-12"><RefreshCw /></Button>
                </div>
              </Card>

              {/* Result Box */}
              <Card className="p-8 flex flex-col items-center justify-center text-center space-y-6 bg-blue-50 border-blue-100">
                <div>
                  <h2 className="text-sm text-gray-500 font-semibold uppercase">Detected Sign</h2>
                  <div className="text-7xl font-black text-blue-600 mt-2">{recognizedText}</div>
                </div>
                <div className="w-full space-y-2">
                   <div className="flex justify-between text-xs font-medium text-gray-500"><span>Confidence</span><span>{confidence}%</span></div>
                   <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${confidence}%` }} />
                   </div>
                </div>
              </Card>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </main>
      </div>
    </div>
  );
};

export default ISLConvert;