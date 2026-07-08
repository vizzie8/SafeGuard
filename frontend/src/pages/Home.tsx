import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, MapPin, Mic, Activity, X } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useFallDetection } from '../hooks/useFallDetection';
import { useSettings } from '../context/SettingsContext';

const Home = () => {
  const [sosActive, setSosActive] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const { 
    fallDetectionEnabled, setFallDetectionEnabled,
    voiceActivationEnabled, setVoiceActivationEnabled,
    voiceTriggerWord
  } = useSettings();

  const handleSosTrigger = useCallback(() => {
    if (sosActive) return;
    setSosActive(true);
    setTimeout(() => {
      setSosActive(false);
      setActiveModal('SOS Triggered Successfully! Help is on the way.');
    }, 2000);
  }, [sosActive]);

  const { isListening, setIsListening, error: voiceError } = useVoiceRecognition(voiceTriggerWord, handleSosTrigger);
  const { location, isTracking, setIsTracking, error: locationError } = useLocationTracking();
  const { isMonitoring, setIsMonitoring, error: fallError } = useFallDetection(handleSosTrigger);

  // Sync Global Settings with Hardware Hooks
  useEffect(() => { setIsListening(voiceActivationEnabled); }, [voiceActivationEnabled, setIsListening]);
  useEffect(() => { setIsMonitoring(fallDetectionEnabled); }, [fallDetectionEnabled, setIsMonitoring]);

  const toggleLocation = () => setIsTracking(!isTracking);
  const toggleVoice = () => setVoiceActivationEnabled(!voiceActivationEnabled);
  const toggleFall = () => setFallDetectionEnabled(!fallDetectionEnabled);

  const actions = [
    { 
      icon: <MapPin className="h-6 w-6" />, 
      label: 'Location Tracking', 
      color: 'from-blue-500 to-cyan-500', 
      active: isTracking,
      toggle: toggleLocation,
      subtext: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Click to enable'
    },
    { 
      icon: <Mic className="h-6 w-6" />, 
      label: 'Voice Command', 
      color: 'from-purple-500 to-pink-500', 
      active: isListening,
      toggle: toggleVoice,
      subtext: isListening ? 'Listening for "help me"...' : 'Click to enable'
    },
    { 
      icon: <Activity className="h-6 w-6" />, 
      label: 'Fall Detection', 
      color: 'from-orange-500 to-red-500', 
      active: isMonitoring,
      toggle: toggleFall,
      subtext: isMonitoring ? 'Monitoring impact...' : 'Click to enable'
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0c]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0c] to-[#0a0a0c] -z-10" />
      
      {/* Main SOS Button */}
      <div className="relative mb-20 mt-10">
        <motion.div
          animate={sosActive ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : { scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: sosActive ? 0.5 : 2, ease: "easeInOut" }}
          className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSosTrigger}
          disabled={sosActive}
          className={`relative w-64 h-64 rounded-full flex flex-col items-center justify-center border-4 ${sosActive ? 'bg-red-600 border-red-400' : 'bg-gradient-to-br from-red-500 to-red-700 border-red-500/30'} shadow-[0_0_50px_rgba(239,68,68,0.3)] transition-colors z-10 overflow-hidden group`}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
          <ShieldAlert className="h-20 w-20 text-white mb-4 drop-shadow-lg group-hover:scale-110 transition-transform" />
          <span className="text-3xl font-bold text-white tracking-widest drop-shadow-md">
            {sosActive ? 'SENDING...' : 'S O S'}
          </span>
        </motion.button>
      </div>

      {/* Hardware Status / Errors */}
      {(voiceError || locationError || fallError) && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm max-w-2xl text-center">
          <p>{voiceError}</p>
          <p>{locationError}</p>
          <p>{fallError}</p>
        </div>
      )}

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {actions.map((action, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={action.toggle}
            className={`bg-gray-900/50 backdrop-blur-xl border ${action.active ? 'border-purple-500' : 'border-gray-800'} rounded-3xl p-6 flex flex-col items-center text-center group hover:bg-gray-800/50 transition-all`}
          >
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white mb-4 shadow-lg ${action.active ? 'animate-pulse' : ''}`}>
              {action.icon}
            </div>
            <h3 className="text-gray-200 font-medium">{action.label}</h3>
            <p className="text-gray-500 text-sm mt-2">{action.subtext}</p>
          </motion.button>
        ))}
      </div>

      {/* Info Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 p-6 rounded-3xl shadow-2xl relative z-10 w-full max-w-sm text-center"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
              <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-white mb-2">{activeModal}</h2>
              <p className="text-gray-400 text-sm mb-6">Action successfully registered by the SafeGuard system.</p>
              <button onClick={() => setActiveModal(null)} className="w-full bg-white text-black font-semibold rounded-xl px-4 py-3">Dismiss</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
