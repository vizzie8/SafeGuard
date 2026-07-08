import React, { useState } from 'react';
import { Shield, Bell, Settings, User, X, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { jsPDF } from 'jspdf';

const Navbar = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { 
    fallDetectionEnabled, setFallDetectionEnabled,
    voiceActivationEnabled, setVoiceActivationEnabled,
    voiceTriggerWord, setVoiceTriggerWord
  } = useSettings();

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('SafeGuard Monthly Report', 20, 20);
    doc.setFontSize(14);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    doc.setFontSize(12);
    doc.text('--- System Settings ---', 20, 50);
    doc.text(`Fall Detection: ${fallDetectionEnabled ? 'Enabled' : 'Disabled'}`, 20, 60);
    doc.text(`Voice Activation: ${voiceActivationEnabled ? 'Enabled' : 'Disabled'} (Phrase: "${voiceTriggerWord}")`, 20, 70);
    
    doc.text('--- Recent Activity ---', 20, 90);
    doc.text('No critical incidents recorded this month.', 20, 100);
    
    doc.save('safeguard-monthly-report.pdf');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-gray-900/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-500" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                SafeGuard
              </span>
            </Link>
            <div className="flex space-x-4 text-gray-300 relative">
              <Link to="/login" className="hover:text-white p-2 transition-colors flex items-center text-xs uppercase tracking-wider font-semibold mr-4">
                Admin Panel
              </Link>
              <button 
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowSettings(false); }}
                className="hover:text-white p-2 transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); setShowProfile(false); }}
                className="hover:text-white p-2 transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
              <button 
                onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); setShowProfile(false); }}
                className="hover:text-white p-2 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-12 top-12 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                      <h3 className="font-semibold text-white">Notifications</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full" />
                        <div>
                          <p className="text-sm text-gray-200">System updated successfully.</p>
                          <span className="text-xs text-gray-500">Just now</span>
                        </div>
                      </div>
                      <div className="flex gap-3 cursor-pointer hover:bg-gray-800 p-2 rounded-xl transition-colors" onClick={handleDownloadPDF}>
                        <FileText className="h-4 w-4 mt-0.5 text-blue-400" />
                        <div>
                          <p className="text-sm text-blue-400">Monthly safety report ready.</p>
                          <span className="text-xs text-gray-500">Click to download PDF</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-24 top-12 w-72 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                      <h3 className="font-semibold text-white">User Profile</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {(() => {
                        const storedUser = localStorage.getItem('user');
                        const user = storedUser ? JSON.parse(storedUser) : null;
                        
                        if (!user) {
                          return <p className="text-sm text-gray-400">Please log in to view profile.</p>;
                        }

                        return (
                          <>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</p>
                              <p className="text-sm text-gray-200 mt-1">{user.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</p>
                              <p className="text-sm text-gray-200 mt-1 font-mono">{user.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Role</p>
                              <p className="text-sm text-purple-400 mt-1 capitalize">{user.role.toLowerCase()}</p>
                            </div>
                            
                            <div className="pt-2 border-t border-gray-800">
                              <Link 
                                to="/dashboard" 
                                onClick={() => setShowProfile(false)}
                                className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 rounded-xl transition-colors"
                              >
                                View Contacts & Heatmap
                              </Link>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 p-6 rounded-3xl shadow-2xl relative z-10 w-full max-w-md"
            >
              <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-light text-white mb-6">Settings</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div>
                    <h4 className="text-gray-200 font-medium text-sm">Fall Detection</h4>
                    <p className="text-gray-500 text-xs mt-1">Automatically trigger SOS</p>
                  </div>
                  <div 
                    onClick={() => setFallDetectionEnabled(!fallDetectionEnabled)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${fallDetectionEnabled ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${fallDetectionEnabled ? 'right-1' : 'left-1 bg-gray-400'}`} />
                  </div>
                </div>
                
                <div className="flex flex-col p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-gray-200 font-medium text-sm">Voice Activation</h4>
                      <p className="text-gray-500 text-xs mt-1">Background mic listening</p>
                    </div>
                    <div 
                      onClick={() => setVoiceActivationEnabled(!voiceActivationEnabled)}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${voiceActivationEnabled ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${voiceActivationEnabled ? 'right-1' : 'left-1 bg-gray-400'}`} />
                    </div>
                  </div>
                  
                  <label className="text-xs text-gray-400 mb-2">Safe Word / Activation Phrase</label>
                  <input 
                    type="text" 
                    value={voiceTriggerWord}
                    onChange={(e) => setVoiceTriggerWord(e.target.value)}
                    disabled={!voiceActivationEnabled}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
