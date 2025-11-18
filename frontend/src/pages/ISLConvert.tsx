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

  // --- 1. START CAMERA (Standard HTML5) ---
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
      if (err.name === 'NotAllowedError') {
        setError("⚠️ Permission Denied: Please click the Lock 🔒 icon in URL bar and Allow Camera.");
      } else if (err.name === 'NotReadableError') {
        setError("⚠️ Camera Busy: Please close the Python/Terminal window using the camera.");
      } else {
        setError("⚠️ Camera Error: " + err.message);
      }
    }
  };

  // --- 2. CAPTURE & SEND TO BACKEND ---
  const handleCapture = async () => {
    if (!videoRef.current || !isStreaming) return;
    setIsProcessing(true);

    try {
      // Snap photo to hidden canvas
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to File (Blob)
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('image', blob, 'sign_language.jpg');

        // Send to Node.js Backend
        try {
          const response = await fetch('http://localhost:5000/api/recognize', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error("Server Error");

          const data = await response.json();
          
          // Show Result
          setRecognizedText(data.prediction || "Unknown");
          setConfidence(data.confidence ? Math.round(data.confidence) : 0);
          
        } catch (apiErr) {
          console.error(apiErr);
          setRecognizedText("Connection Error");
          setError("Could not connect to Backend (Port 5000). Is it running?");
        } finally {
          setIsProcessing(false);
        }
      }, 'image/jpeg');

    } catch (err) {
      console.error("Capture Error:", err);
      setIsProcessing(false);
    }
  };

  // Auto-start camera on load
  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup: Stop camera when leaving page
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
            
            {/* Error Banner */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* CAMERA BOX */}
              <Card className="p-4 bg-black/5 border-2 border-dashed border-gray-300 relative min-h-[300px] flex flex-col justify-between">
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-4">
                  <video 
                    ref={videoRef}
                    className="w-full h-full object-cover transform scale-x-[-1]"
                    playsInline muted
                  />
                  {!isStreaming && !error && (
                     <div className="absolute inset-0 flex items-center justify-center text-gray-400">Loading Camera...</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleCapture} 
                    disabled={isProcessing || !isStreaming} 
                    className="flex-1 gap-2 h-12 text-lg"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Camera />}
                    {isProcessing ? "Analyzing..." : "Capture Sign"}
                  </Button>
                  <Button onClick={startCamera} variant="outline" size="icon" className="h-12 w-12">
                    <RefreshCw />
                  </Button>
                </div>
              </Card>

              {/* OUTPUT BOX */}
              <Card className="p-8 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                <div>
                  <h2 className="text-sm uppercase tracking-wider text-gray-500 font-semibold">Detected Sign</h2>
                  <div className="text-7xl font-black text-blue-600 mt-2 break-all">
                    {recognizedText}
                  </div>
                </div>
                
                <div className="w-full space-y-2">
                   <div className="flex justify-between text-xs font-medium text-gray-500">
                      <span>Confidence</span>
                      <span>{confidence}%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${confidence}%` }}
                      />
                   </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Hidden Canvas for Snapshot */}
          <canvas ref={canvasRef} className="hidden" />
        </main>
      </div>
    </div>
  );
};

export default ISLConvert;