import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatVoiceInputProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  language?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const ChatVoiceInput: React.FC<ChatVoiceInputProps> = ({
  onTranscript,
  onError,
  className,
  disabled = false,
  language = "en-US",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef<any>(null);
  const volumeRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);

        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
          setTranscript("");
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        const errorMessage = getErrorMessage(event.error);
        onError?.(errorMessage);
        toast.error(errorMessage);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setVolume(0);
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [language, onTranscript, onError]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "no-speech":
        return "No speech detected. Please try again.";
      case "audio-capture":
        return "Microphone not available. Please check permissions.";
      case "not-allowed":
        return "Microphone permission denied. Please allow access.";
      case "network":
        return "Network error occurred. Please check connection.";
      default:
        return "Speech recognition failed. Please try again.";
    }
  };

  // Simulate volume detection (in real implementation, you'd use Web Audio API)
  const simulateVolumeDetection = () => {
    if (isRecording) {
      volumeRef.current = Math.random() * 100;
      setVolume(volumeRef.current);
      animationRef.current = requestAnimationFrame(simulateVolumeDetection);
    }
  };

  const startRecording = async () => {
    if (!isSupported || disabled) return;

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      setIsRecording(true);
      setTranscript("");
      recognitionRef.current?.start();
      simulateVolumeDetection();
      toast.success("Voice recording started");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(
        "Failed to start recording. Please check microphone permissions.",
      );
      onError?.("Failed to start recording");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
    setVolume(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    toast.success("Voice recording stopped");
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className={cn("h-8 w-8 p-0", className)}
        title="Speech recognition not supported in this browser"
      >
        <MicOff className="h-4 w-4 text-gray-400" />
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Voice Input Button */}
      <Button
        variant={isRecording ? "destructive" : "ghost"}
        size="sm"
        onClick={toggleRecording}
        disabled={disabled}
        className={cn(
          "h-8 w-8 p-0 transition-all duration-200",
          isRecording && "animate-pulse",
        )}
        title={isRecording ? "Stop recording" : "Start voice input"}
      >
        {isRecording ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Volume Indicator */}
      {isRecording && (
        <div className="flex items-center gap-1">
          {volume > 10 ? (
            <Volume2 className="h-3 w-3 text-green-500" />
          ) : (
            <VolumeX className="h-3 w-3 text-gray-400" />
          )}

          {/* Volume Bars */}
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 bg-gray-300 rounded-full transition-all duration-100",
                  i === 0 && "h-2",
                  i === 1 && "h-3",
                  i === 2 && "h-4",
                  i === 3 && "h-3",
                  i === 4 && "h-2",
                  volume > (i + 1) * 20 && "bg-green-500",
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Live Transcript Preview */}
      {isRecording && transcript && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white border rounded-lg shadow-lg text-sm text-gray-600 max-w-xs">
          <p className="font-medium text-gray-800 mb-1">Listening...</p>
          <p className="text-xs">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default ChatVoiceInput;
