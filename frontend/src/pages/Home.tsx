import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, MapPin, Mic, Activity, X, Video } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useFallDetection } from '../hooks/useFallDetection';
import { useSettings } from '../context/SettingsContext';
import { useWebRTCStream } from '../hooks/useWebRTCStream';

const Home = () => {
  const [sosActive, setSosActive] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const { 
    fallDetectionEnabled, setFallDetectionEnabled,
    voiceActivationEnabled, setVoiceActivationEnabled,
    voiceTriggerWord,
    videoStreamingEnabled, setVideoStreamingEnabled
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
  const { streamError } = useWebRTCStream(sosActive && videoStreamingEnabled);

  // Sync Global Settings with Hardware Hooks
  useEffect(() => { setIsListening(voiceActivationEnabled); }, [voiceActivationEnabled, setIsListening]);
  useEffect(() => { setIsMonitoring(fallDetectionEnabled); }, [fallDetectionEnabled, setIsMonitoring]);

  // Pre-request camera permissions when Live Video is toggled on
  useEffect(() => {
    if (videoStreamingEnabled) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          // Immediately stop tracks to turn off the camera indicator
          // We just wanted the browser to save the permission
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
          console.error("Camera permission denied or error:", err);
          setVideoStreamingEnabled(false);
          setActiveModal("Camera permissions are required to enable Live Video. Please allow access in your browser.");
        });
    }
  }, [videoStreamingEnabled, setVideoStreamingEnabled]);

  const toggleLocation = () => setIsTracking(!isTracking);
  const toggleVoice = () => setVoiceActivationEnabled(!voiceActivationEnabled);
  const toggleFall = () => setFallDetectionEnabled(!fallDetectionEnabled);
  const toggleVideo = () => setVideoStreamingEnabled(!videoStreamingEnabled);

  const actions = [
    { 
      icon: <MapPin className="h-6 w-6" />, 
      label: 'Location Tracking', 
      color: 'from-teal-400 to-blue-400 dark:from-orange-500 dark:to-amber-500', 
      active: isTracking,
      toggle: toggleLocation,
      subtext: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Click to enable'
    },
    { 
      icon: <Mic className="h-6 w-6" />, 
      label: 'Voice Command', 
      color: 'from-teal-400 to-emerald-400 dark:from-amber-400 dark:to-orange-500', 
      active: isListening,
      toggle: toggleVoice,
      subtext: isListening ? 'Listening for "help me"...' : 'Click to enable'
    },
    { 
      icon: <Activity className="h-6 w-6" />, 
      label: 'Fall Detection', 
      color: 'from-blue-400 to-indigo-400 dark:from-orange-600 dark:to-red-500', 
      active: isMonitoring,
      toggle: toggleFall,
      subtext: isMonitoring ? 'Monitoring impact...' : 'Click to enable'
    },
    {
      icon: <Video className="h-6 w-6" />,
      label: 'Live Video',
      color: 'from-teal-500 to-cyan-500 dark:from-amber-500 dark:to-orange-600',
      active: videoStreamingEnabled,
      toggle: toggleVideo,
      subtext: videoStreamingEnabled ? 'Ready to stream on SOS' : 'Click to enable'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      
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
          className={`relative w-64 h-64 rounded-full flex flex-col items-center justify-center border-4 ${sosActive ? 'bg-red-500 border-red-300 dark:bg-red-600 dark:border-orange-400' : 'bg-gradient-to-br from-red-400 to-red-600 dark:from-orange-500 dark:to-red-700 border-white/50 dark:border-orange-500/30'} shadow-[0_0_50px_rgba(239,68,68,0.2)] dark:shadow-[0_0_60px_rgba(249,115,22,0.3)] transition-all duration-300 z-10 overflow-hidden group`}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 dark:opacity-20 mix-blend-overlay" />
          <ShieldAlert className="h-20 w-20 text-white mb-4 drop-shadow-lg group-hover:scale-110 transition-transform" />
          <span className="text-3xl font-bold text-white tracking-widest drop-shadow-md">
            {sosActive ? 'SENDING...' : 'S O S'}
          </span>
        </motion.button>
      </div>

      {/* Hardware Status / Errors */}
      {(voiceError || locationError || fallError || streamError) && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm max-w-2xl text-center">
          {voiceError && <p>{voiceError}</p>}
          {locationError && <p>{locationError}</p>}
          {fallError && <p>{fallError}</p>}
          {streamError && <p>{streamError}</p>}
        </div>
      )}

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {actions.map((action, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={action.toggle}
            className={`bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-lg border ${action.active ? 'border-teal-400 dark:border-orange-500 shadow-[0_0_30px_rgba(45,212,191,0.4)] dark:shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'border-teal-500/30 dark:border-orange-500/30 hover:border-teal-500/60 dark:hover:border-orange-500/60 hover:bg-white/20 dark:hover:bg-black/40'} rounded-2xl p-6 flex flex-col items-center text-center group transition-all duration-300`}
          >
            <div className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white mb-4 shadow-lg ${action.active ? 'animate-pulse' : ''}`}>
              {action.icon}
            </div>
            <h3 className="text-slate-800 dark:text-gray-200 font-medium transition-colors">{action.label}</h3>
            <p className="text-slate-500 dark:text-gray-500 text-sm mt-2 transition-colors">{action.subtext}</p>
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
              className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-teal-500/30 dark:border-orange-500/30 p-6 rounded-2xl shadow-[0_0_40px_rgba(45,212,191,0.2)] dark:shadow-[0_0_40px_rgba(249,115,22,0.2)] relative z-10 w-full max-w-sm text-center"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
              <ShieldAlert className="h-12 w-12 text-teal-500 dark:text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-2">{activeModal}</h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">Action successfully registered by the SafeGuard system.</p>
              <button onClick={() => setActiveModal(null)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black font-semibold rounded-xl px-4 py-3 transition-colors">Dismiss</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
