import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SettingsContextType {
  fallDetectionEnabled: boolean;
  setFallDetectionEnabled: (val: boolean) => void;
  voiceActivationEnabled: boolean;
  setVoiceActivationEnabled: (val: boolean) => void;
  voiceTriggerWord: string;
  setVoiceTriggerWord: (word: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [fallDetectionEnabled, setFallDetectionEnabled] = useState(false);
  const [voiceActivationEnabled, setVoiceActivationEnabled] = useState(false);
  const [voiceTriggerWord, setVoiceTriggerWord] = useState('help me');

  return (
    <SettingsContext.Provider 
      value={{
        fallDetectionEnabled, setFallDetectionEnabled,
        voiceActivationEnabled, setVoiceActivationEnabled,
        voiceTriggerWord, setVoiceTriggerWord
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
