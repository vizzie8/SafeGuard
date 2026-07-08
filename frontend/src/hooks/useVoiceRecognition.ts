import { useState, useEffect } from 'react';

export const useVoiceRecognition = (triggerWord: string, onSOSDetected: () => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      
      const words = triggerWord.toLowerCase().split(',').map(w => w.trim());
      const match = words.some(word => transcript.includes(word));
      
      if (match || transcript.includes('sos') || transcript.includes('emergency')) {
        console.log("SOS Phrase Detected via Audio:", transcript);
        onSOSDetected();
        recognition.stop();
      }
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) recognition.start();
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, triggerWord, onSOSDetected]);

  return { isListening, setIsListening, error };
};
