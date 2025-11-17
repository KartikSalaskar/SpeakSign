import { useState, useEffect } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Loader from './Loader';

interface ISLOutputBoxProps {
  recognizedText?: string;
  confidence?: number;
  isProcessing?: boolean;
}

const ISLOutputBox = ({
  recognizedText = '',
  confidence = 0,
  isProcessing = false,
}: ISLOutputBoxProps) => {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (recognizedText && textIndex < recognizedText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(recognizedText.slice(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    } else if (!recognizedText) {
      setDisplayText('');
      setTextIndex(0);
    }
  }, [recognizedText, textIndex]);

  const handleSave = () => {
    console.log('Saving result:', recognizedText);
    // Placeholder for save logic
  };

  return (
    <Card className="p-6 space-y-4 shadow-medium animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          Recognition Output
        </h2>
        {recognizedText && (
          <Button
            onClick={handleSave}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Result
          </Button>
        )}
      </div>

      <div className="min-h-[200px] bg-muted rounded-xl p-6 flex flex-col justify-center">
        {isProcessing ? (
          <div className="text-center space-y-4">
            <Loader />
            <p className="text-sm text-muted-foreground">Processing sign language...</p>
          </div>
        ) : displayText ? (
          <div className="space-y-4">
            <p className="text-3xl font-bold text-foreground text-center animate-scale-in">
              {displayText}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-semibold text-success">{confidence.toFixed(1)}%</span>
              </div>
              <Progress value={confidence} className="h-2" />
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-lg">Start your camera and capture a sign</p>
            <p className="text-sm mt-2">Recognition results will appear here</p>
          </div>
        )}
      </div>

      {recognizedText && (
        <div className="bg-accent/10 rounded-lg p-4 text-sm">
          <p className="text-accent-foreground">
            <span className="font-semibold">Tip:</span> The higher the confidence percentage, the more accurate the recognition.
          </p>
        </div>
      )}
    </Card>
  );
};

export default ISLOutputBox;
