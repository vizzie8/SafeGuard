import React, { useState, useEffect } from 'react';
import { Shield, Activity, Users, AlertTriangle, Wifi } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState('');

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
  
  const COLORS = ['#A855F7', '#EC4899', '#3B82F6'];

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
    { label: 'Total Users', value: stats.totalUsers, icon: <Users className="h-6 w-6 text-blue-400" /> },
    { label: 'Active Alerts', value: stats.activeAlerts, icon: <AlertTriangle className="h-6 w-6 text-red-400" /> },
    { label: 'System Health', value: `${stats.systemHealth}%`, icon: <Activity className="h-6 w-6 text-emerald-400" /> },
    { label: 'SafeGuard Nodes', value: stats.nodes || 84, icon: <Shield className="h-6 w-6 text-purple-400" /> }
  ] : [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0c] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-end border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-light">System <span className="font-semibold">Admin Panel</span></h1>
            <p className="text-gray-400 mt-2 text-sm">Monitor system health, active alerts, and global node status.</p>
          </div>
          <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === 'overview' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('logs')} 
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === 'logs' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
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
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700/50">
                      {stat.icon}
                    </div>
                  </div>
                  <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div 
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm"
                >
                  <h3 className="text-lg font-medium mb-4">Incident Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
                        <Line type="monotone" dataKey="incidents" stroke="#A855F7" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm"
                >
                  <h3 className="text-lg font-medium mb-4">Incident Distribution</h3>
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
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl h-fit"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium flex items-center"><Wifi className="mr-2 text-purple-400 h-5 w-5"/> Live Security Feed</h2>
                  <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium tracking-wide">SYSTEM SECURE</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {liveFeed.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 bg-gray-800/20 p-4 rounded-xl border border-gray-800/40">
                      <div className={`mt-0.5 w-2 h-2 rounded-full ${item.type === 'system' ? 'bg-purple-400' : item.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                      <div>
                        <p className="text-sm text-gray-200">{item.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.time}</p>
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
            className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-sm"
          >
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-medium">Recent Global Incidents</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-800/40 text-gray-400 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">Incident ID</th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Time</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {logs.map((inc) => (
                    <tr key={inc.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-purple-400">{inc.id}</td>
                      <td className="px-6 py-4 text-sm">{inc.user}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="flex items-center">
                          <AlertTriangle className={`w-4 h-4 mr-2 ${inc.type.includes('SOS') ? 'text-red-400' : 'text-orange-400'}`} />
                          {inc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-400">{inc.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(inc.time).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          inc.status === 'Active' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
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
