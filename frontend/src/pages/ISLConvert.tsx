import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import WebcamBox from '@/components/WebcamBox';
import ISLOutputBox from '@/components/ISLOutputBox';
import ChatbotWidget from '@/components/ChatbotWidget';
import { useWebcamCapture } from '@/hooks/useWebcamCapture';

const ISLConvert = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const { videoRef, isActive, startCamera, stopCamera, captureImage } = useWebcamCapture();

  const handleCapture = async () => {
    const imageData = captureImage();
    if (!imageData) return;

    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockWords = ['Hello', 'Thank You', 'Please', 'Help', 'Water', 'Food', 'Yes', 'No'];
      const randomWord = mockWords[Math.floor(Math.random() * mockWords.length)];
      const randomConfidence = Math.random() * 10 + 88; // 88-98%

      setRecognizedText(randomWord);
      setConfidence(randomConfidence);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="space-y-2 animate-fade-in">
              <h1 className="text-3xl font-bold">ISL to Text Converter</h1>
              <p className="text-muted-foreground">
                Use your webcam to capture sign language and convert it to text instantly.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <WebcamBox
                videoRef={videoRef}
                isActive={isActive}
                onStartCamera={startCamera}
                onStopCamera={stopCamera}
                onCapture={handleCapture}
              />

              <ISLOutputBox
                recognizedText={recognizedText}
                confidence={confidence}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </main>
      </div>

      <ChatbotWidget />
    </div>
  );
};

export default ISLConvert;
