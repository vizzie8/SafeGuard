import React, { createContext, useState, useContext, useEffect } from 'react';

interface SettingsContextType {
  fallDetectionEnabled: boolean;
  setFallDetectionEnabled: (val: boolean) => void;
  voiceActivationEnabled: boolean;
  setVoiceActivationEnabled: (val: boolean) => void;
  voiceTriggerWord: string;
  setVoiceTriggerWord: (word: string) => void;
  voiceSensitivity: number;
  setVoiceSensitivity: (val: number) => void;
  videoStreamingEnabled: boolean;
  setVideoStreamingEnabled: (val: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (val: 'light' | 'dark') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fallDetectionEnabled, setFallDetectionEnabled] = useState(false);
  const [voiceActivationEnabled, setVoiceActivationEnabled] = useState(false);
  const [voiceTriggerWord, setVoiceTriggerWord] = useState('help me');
  const [voiceSensitivity, setVoiceSensitivity] = useState(50);
  const [videoStreamingEnabled, setVideoStreamingEnabled] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <SettingsContext.Provider 
      value={{
        fallDetectionEnabled, setFallDetectionEnabled,
        voiceActivationEnabled, setVoiceActivationEnabled,
        voiceTriggerWord, setVoiceTriggerWord,
        voiceSensitivity, setVoiceSensitivity,
        videoStreamingEnabled, setVideoStreamingEnabled,
        theme, setTheme
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
