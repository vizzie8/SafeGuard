import React, { useState } from 'react';
import { Shield, Bell, Settings, User, X, FileText, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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
    voiceTriggerWord, setVoiceTriggerWord,
    voiceSensitivity, setVoiceSensitivity,
    theme, setTheme
  } = useSettings();
  
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

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
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-teal-600 dark:text-purple-500 transition-colors duration-300" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-500 dark:from-purple-400 dark:to-pink-500 transition-colors duration-300">
                SafeGuard
              </span>
            </Link>
            {!isAuthPage && (
              <div className="flex space-x-4 text-slate-600 dark:text-gray-300 relative items-center">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition-colors mr-2"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-500" />}
                </button>
                <Link to="/login" className="hover:text-slate-900 dark:hover:text-white p-2 transition-colors flex items-center text-xs uppercase tracking-wider font-semibold mr-2">
                  Admin Panel
                </Link>
                <button 
                  onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowSettings(false); }}
                  className="hover:text-slate-900 dark:hover:text-white p-2 transition-colors"
                >
                  <User className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); setShowProfile(false); }}
                  className="hover:text-slate-900 dark:hover:text-white p-2 transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                <button 
                  onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); setShowProfile(false); }}
                  className="hover:text-slate-900 dark:hover:text-white p-2 transition-colors"
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
                    className="absolute right-12 top-12 w-80 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden z-50 transition-colors"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full" />
                        <div>
                          <p className="text-sm text-slate-700 dark:text-gray-200">System updated successfully.</p>
                          <span className="text-xs text-slate-400 dark:text-gray-500">Just now</span>
                        </div>
                      </div>
                      <div className="flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800 p-2 rounded-xl transition-colors" onClick={handleDownloadPDF}>
                        <FileText className="h-4 w-4 mt-0.5 text-teal-600 dark:text-blue-400" />
                        <div>
                          <p className="text-sm text-teal-600 dark:text-blue-400">Monthly safety report ready.</p>
                          <span className="text-xs text-slate-400 dark:text-gray-500">Click to download PDF</span>
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
                    className="absolute right-24 top-12 w-72 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden z-50 transition-colors"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900 dark:text-white">User Profile</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {(() => {
                        const storedUser = localStorage.getItem('user');
                        const user = storedUser ? JSON.parse(storedUser) : null;
                        
                        if (!user) {
                          return <p className="text-sm text-slate-500 dark:text-gray-400">Please log in to view profile.</p>;
                        }

                        return (
                          <>
                            <div>
                              <p className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-wider font-semibold">Name</p>
                              <p className="text-sm text-slate-800 dark:text-gray-200 mt-1">{user.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-wider font-semibold">Email</p>
                              <p className="text-sm text-slate-800 dark:text-gray-200 mt-1 font-mono">{user.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 dark:text-gray-500 uppercase tracking-wider font-semibold">Role</p>
                              <p className="text-sm text-teal-600 dark:text-purple-400 mt-1 capitalize">{user.role.toLowerCase()}</p>
                            </div>
                            
                            <div className="pt-2 border-t border-slate-100 dark:border-gray-800">
                              <Link 
                                to="/dashboard" 
                                onClick={() => setShowProfile(false)}
                                className="block w-full text-center bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-800 dark:text-white text-sm py-2 rounded-xl transition-colors"
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
            )}
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
              className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-800 p-6 rounded-3xl shadow-2xl relative z-10 w-full max-w-md transition-colors"
            >
              <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-light text-slate-800 dark:text-white mb-6">Settings</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl shadow-sm dark:shadow-none border border-white dark:border-gray-700/50">
                  <div>
                    <h4 className="text-slate-800 dark:text-gray-200 font-medium text-sm">Fall Detection</h4>
                    <p className="text-slate-500 dark:text-gray-500 text-xs mt-1">Automatically trigger SOS</p>
                  </div>
                  <div 
                    onClick={() => setFallDetectionEnabled(!fallDetectionEnabled)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors shadow-inner flex items-center px-1 ${fallDetectionEnabled ? 'bg-teal-500 dark:bg-orange-500' : 'bg-slate-200 dark:bg-gray-700'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-md ${fallDetectionEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
                
                <div className="flex flex-col p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl shadow-sm dark:shadow-none border border-white dark:border-gray-700/50">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-slate-800 dark:text-gray-200 font-medium text-sm">Voice Activation</h4>
                      <p className="text-slate-500 dark:text-gray-500 text-xs mt-1">Background mic listening</p>
                    </div>
                    <div 
                      onClick={() => setVoiceActivationEnabled(!voiceActivationEnabled)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors shadow-inner flex items-center px-1 ${voiceActivationEnabled ? 'bg-teal-500 dark:bg-orange-500' : 'bg-slate-200 dark:bg-gray-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-md ${voiceActivationEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                  
                  <label className="text-xs text-slate-500 dark:text-gray-400 mb-2 mt-4 block">Safe Word / Activation Phrase</label>
                  <input 
                    type="text" 
                    value={voiceTriggerWord}
                    onChange={(e) => setVoiceTriggerWord(e.target.value)}
                    disabled={!voiceActivationEnabled}
                    className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl px-3 py-2 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-teal-500 dark:focus:border-orange-500 disabled:opacity-50 transition-colors"
                  />
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-500 dark:text-gray-400">Decibel Threshold (Loudness)</label>
                      <span className="text-xs font-mono text-teal-600 dark:text-orange-400">{voiceSensitivity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={voiceSensitivity}
                      onChange={(e) => setVoiceSensitivity(Number(e.target.value))}
                      disabled={!voiceActivationEnabled}
                      className="w-full accent-teal-500 dark:accent-orange-500 disabled:opacity-50"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">High threshold requires you to shout for SOS to trigger.</p>
                  </div>
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
