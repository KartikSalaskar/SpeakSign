import { Camera, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WebcamBoxProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCapture: () => void;
}

const WebcamBox = ({
  videoRef,
  isActive,
  onStartCamera,
  onStopCamera,
  onCapture,
}: WebcamBoxProps) => {
  return (
    <Card className="p-6 space-y-4 shadow-medium animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Camera Feed</h2>
        <div className="flex gap-2">
          {!isActive ? (
            <Button
              onClick={onStartCamera}
              className="gap-2"
              size="sm"
            >
              <Video className="h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <Button
              onClick={onStopCamera}
              variant="destructive"
              className="gap-2"
              size="sm"
            >
              <VideoOff className="h-4 w-4" />
              Stop Camera
            </Button>
          )}
        </div>
      </div>

      <div className="relative bg-muted rounded-xl overflow-hidden aspect-video">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Video className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-sm">Camera is off</p>
          </div>
        )}
      </div>

      {isActive && (
        <div className="flex justify-center">
          <Button
            onClick={onCapture}
            size="lg"
            className="rounded-full h-14 w-14 p-0 shadow-strong"
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>
      )}
    </Card>
  );
};

export default WebcamBox;
