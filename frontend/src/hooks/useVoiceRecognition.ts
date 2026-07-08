import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

export const useVoiceRecognition = (triggerWord: string, onSOSDetected: () => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { voiceSensitivity } = useSettings();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

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

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
      } catch (err) {
        console.error("Microphone access denied or error:", err);
        setError("Microphone access is required for decibel detection.");
      }
    };

    const checkVolume = () => {
      if (!analyserRef.current || !dataArrayRef.current) return 0;
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
      
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }
      return sum / dataArrayRef.current.length; // Average volume (0-255)
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      
      const words = triggerWord.toLowerCase().split(',').map(w => w.trim());
      const match = words.some(word => transcript.includes(word));
      
      if (match || transcript.includes('sos') || transcript.includes('emergency')) {
        const currentVolume = checkVolume();
        
        // voiceSensitivity is 1-100. Let's map it roughly to a volume threshold.
        // A threshold of 50 might require an average byte freq of 50.
        // A threshold of 100 might require average byte freq of 120.
        const requiredVolume = (voiceSensitivity / 100) * 120;
        
        console.log(`SOS Phrase Detected! Volume: ${currentVolume.toFixed(2)}, Required: ${requiredVolume.toFixed(2)}`);
        
        if (currentVolume >= requiredVolume) {
          console.log("SOS Phrase Detected via Audio and Volume passed threshold!");
          onSOSDetected();
          recognition.stop();
        } else {
          console.log("Phrase detected, but voice wasn't loud enough. Ignoring.");
        }
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
      setupAudio().then(() => recognition.start());
    } else {
      recognition.stop();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }

    return () => {
      recognition.stop();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isListening, triggerWord, voiceSensitivity, onSOSDetected]);

  return { isListening, setIsListening, error };
};
