import React, { useState, useEffect, useRef } from 'react';
import { Shield, Activity, Users, AlertTriangle, Wifi, Video, VideoOff } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { useWebRTCAdmin } from '../hooks/useWebRTCAdmin';
import { useSettings } from '../context/SettingsContext';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { remoteStream, isStreaming } = useWebRTCAdmin();
  const { theme } = useSettings();

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const [liveFeed] = useState([
    { id: 1, text: 'SafeGuard background service active', time: 'Just now', type: 'system' },
    { id: 2, text: 'Location tracker synced successfully', time: '2 mins ago', type: 'success' },
    { id: 3, text: 'No anomalies detected in device motion', time: '1 hour ago', type: 'info' }
  ]);

  const chartData = [
    { name: 'Mon', incidents: 4 },
    { name: 'Tue', incidents: 3 },
    { name: 'Wed', incidents: 2 },
    { name: 'Thu', incidents: 6 },
    { name: 'Fri', incidents: 1 },
    { name: 'Sat', incidents: 5 },
    { name: 'Sun', incidents: 3 },
  ];

  const pieData = [
    { name: 'Voice SOS', value: 40 },
    { name: 'Manual SOS', value: 30 },
    { name: 'Fall Detected', value: 30 },
  ];
  
  const COLORS = theme === 'dark' ? ['#F97316', '#F59E0B', '#EF4444'] : ['#5E8B7E', '#A7C7E7', '#3B82F6'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Unauthorized');
        
        const [statsRes, logsRes] = await Promise.all([
          fetch('http://localhost:4000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:4000/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!statsRes.ok || !logsRes.ok) throw new Error('Failed to fetch admin data');

        setStats(await statsRes.json());
        setLogs(await logsRes.json());
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users className="h-6 w-6 text-teal-600 dark:text-blue-400" /> },
    { label: 'Active Alerts', value: stats.activeAlerts, icon: <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" /> },
    { label: 'System Health', value: `${stats.systemHealth}%`, icon: <Activity className="h-6 w-6 text-emerald-500 dark:text-emerald-400" /> },
    { label: 'SafeGuard Nodes', value: stats.nodes || 84, icon: <Shield className="h-6 w-6 text-blue-500 dark:text-orange-400" /> }
  ] : [];

  return (
    <div className="min-h-[calc(100vh-4rem)] transition-colors duration-500 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-gray-800 pb-6 transition-colors">
          <div>
            <h1 className="text-3xl font-light text-slate-800 dark:text-white transition-colors">System <span className="font-semibold">Admin Panel</span></h1>
            <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm transition-colors">Monitor system health, active alerts, and global node status.</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-gray-900 rounded-xl p-1 border border-slate-200 dark:border-gray-800 transition-colors">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === 'overview' ? 'bg-teal-500 dark:bg-orange-500 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('logs')} 
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === 'logs' ? 'bg-teal-500 dark:bg-orange-500 text-white shadow-sm' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              System Logs
            </button>
          </div>
        </div>

        {error && <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20">{error}</div>}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="bg-white/10 dark:bg-black/20 border border-teal-500/30 dark:border-orange-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(45,212,191,0.15)] dark:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-colors hover:bg-white/20 dark:hover:bg-black/40"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 dark:bg-gray-800/80 p-3 rounded-xl border border-slate-200 dark:border-gray-700/50 transition-colors">
                      {stat.icon}
                    </div>
                  </div>
                  <h3 className="text-slate-500 dark:text-gray-400 text-sm transition-colors">{stat.label}</h3>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1 transition-colors">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div 
                  className="bg-white/10 dark:bg-black/20 border border-teal-500/30 dark:border-orange-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(45,212,191,0.15)] dark:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-colors"
                >
                  <h3 className="text-lg font-medium mb-4 text-slate-800 dark:text-white transition-colors">Incident Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E2E8F0'} />
                        <XAxis dataKey="name" stroke={theme === 'dark' ? '#9CA3AF' : '#64748B'} />
                        <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#64748B'} />
                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: theme === 'dark' ? '#374151' : '#E2E8F0', color: theme === 'dark' ? '#FFF' : '#000' }} />
                        <Line type="monotone" dataKey="incidents" stroke={theme === 'dark' ? '#F97316' : '#5E8B7E'} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white/10 dark:bg-black/20 border border-teal-500/30 dark:border-orange-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(45,212,191,0.15)] dark:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-colors"
                >
                  <h3 className="text-lg font-medium mb-4 text-slate-800 dark:text-white transition-colors">Incident Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF', borderColor: theme === 'dark' ? '#374151' : '#E2E8F0', color: theme === 'dark' ? '#FFF' : '#000' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                className="bg-white/10 dark:bg-black/20 border border-teal-500/30 dark:border-orange-500/30 rounded-2xl p-6 backdrop-blur-xl h-fit shadow-[0_0_30px_rgba(45,212,191,0.15)] dark:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-colors hover:bg-white/20 dark:hover:bg-black/40"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium flex items-center text-slate-800 dark:text-white transition-colors"><Wifi className="mr-2 text-teal-500 dark:text-orange-400 h-5 w-5"/> Live Security Feed</h2>
                  <div className="flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">SYSTEM SECURE</span>
                  </div>
                </div>
                
                {/* WebRTC Video Container */}
                <div className="mb-6 w-full h-48 bg-slate-900 rounded-xl overflow-hidden relative border border-slate-300 dark:border-gray-800 shadow-inner">
                  {isStreaming ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted // Muted to prevent feedback if testing on same machine
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                      <VideoOff className="h-8 w-8 mb-2 opacity-50" />
                      <span className="text-xs tracking-wider uppercase font-medium">No Active SOS Streams</span>
                    </div>
                  )}
                  {isStreaming && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md animate-pulse flex items-center shadow-lg">
                      <Video className="w-3 h-3 mr-1" />
                      LIVE SOS
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {liveFeed.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 bg-slate-50 dark:bg-gray-800/20 p-4 rounded-xl border border-slate-200 dark:border-gray-800/40 transition-colors">
                      <div className={`mt-0.5 w-2 h-2 rounded-full ${item.type === 'system' ? 'bg-teal-500 dark:bg-orange-400' : item.type === 'success' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-blue-500 dark:bg-blue-400'}`} />
                      <div>
                        <p className="text-sm text-slate-700 dark:text-gray-200 transition-colors">{item.text}</p>
                        <p className="text-xs text-slate-400 dark:text-gray-500 mt-1 transition-colors">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 dark:bg-black/20 border border-teal-500/30 dark:border-orange-500/30 rounded-2xl overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(45,212,191,0.15)] dark:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-colors"
          >
            <div className="p-6 border-b border-slate-200 dark:border-gray-800 transition-colors">
              <h2 className="text-xl font-medium text-slate-800 dark:text-white transition-colors">Recent Global Incidents</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-gray-800/40 text-slate-500 dark:text-gray-400 text-sm transition-colors">
                  <tr>
                    <th className="px-6 py-4 font-medium">Incident ID</th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Time</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-800 transition-colors">
                  {logs.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-teal-600 dark:text-orange-400 transition-colors">{inc.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-gray-300 transition-colors">{inc.user}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-gray-300 transition-colors">
                        <span className="flex items-center">
                          <AlertTriangle className={`w-4 h-4 mr-2 ${inc.type.includes('SOS') ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-orange-400'}`} />
                          {inc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-500 dark:text-gray-400 transition-colors">{inc.location}</td>
                      <td className="px-6 py-4 text-sm text-slate-400 dark:text-gray-500 transition-colors">{new Date(inc.time).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          inc.status === 'Active' 
                            ? 'bg-red-100 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 animate-pulse' 
                            : 'bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                        } transition-colors`}>
                          {inc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Admin;
