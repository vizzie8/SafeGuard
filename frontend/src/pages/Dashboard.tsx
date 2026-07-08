import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, ShieldAlert } from 'lucide-react';
import Heatmap from '../components/Heatmap';

const Dashboard = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser) setUser(JSON.parse(storedUser));
      
      if (token) {
        try {
          const res = await fetch('http://localhost:4000/api/contacts', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setContacts(data);
          }
        } catch (err) {
          console.error('Failed to fetch contacts');
        }
      }
    };
    fetchUserData();
  }, []);

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newContact)
      });
      if (res.ok) {
        const addedContact = await res.json();
        setContacts([...contacts, addedContact]);
        setShowAddModal(false);
        setNewContact({ name: '', phone: '' });
      }
    } catch (err) {
      console.error('Failed to add contact');
    }
  };

  const handleRemoveContact = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setContacts(contacts.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to remove contact');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-gray-100">Welcome back, <span className="font-semibold text-white">{user?.name || 'User'}</span></h1>
            <p className="text-gray-400 mt-2 text-sm">Your personal safety dashboard is active and monitoring.</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span>System Secure</span>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Map / Activity Panel */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium flex items-center"><MapPin className="mr-2 text-purple-400 h-5 w-5"/> Live Location & Risk Heatmap</h2>
                <button className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full transition-colors border border-gray-700">Recenter</button>
              </div>
              <div className="w-full h-[400px] bg-gray-950 rounded-2xl border border-gray-800 relative z-0">
                <Heatmap />
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl"
            >
              <h2 className="text-xl font-medium mb-6 flex items-center"><ShieldAlert className="mr-2 text-red-400 h-5 w-5"/> Recent Incidents</h2>
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-gray-800/30 rounded-2xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                  <div className="bg-red-500/20 p-2 rounded-xl mr-4 border border-red-500/30">
                    <ShieldAlert className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-gray-200 font-medium text-sm">Manual SOS Triggered</h4>
                    <p className="text-gray-500 text-xs mt-1">2 days ago • Coordinates: 18.5204, 73.8567</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar / Contacts */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 backdrop-blur-xl h-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium flex items-center"><Phone className="mr-2 text-pink-400 h-5 w-5"/> Emergency Contacts</h2>
                <button onClick={() => setShowAddModal(true)} className="text-2xl text-gray-500 hover:text-white transition-colors">+</button>
              </div>
              
              <div className="space-y-3">
                {contacts.map(contact => (
                  <div key={contact.id} className="flex justify-between items-center p-4 bg-gray-800/40 rounded-2xl border border-gray-800/80 hover:bg-gray-800/60 transition-colors group">
                    <div>
                      <h4 className="text-gray-200 font-medium text-sm">{contact.name}</h4>
                      <p className="text-gray-500 text-xs mt-1 font-mono">{contact.phone}</p>
                    </div>
                    <button 
                      onClick={() => setContacts(contacts.filter(c => c.id !== contact.id))}
                      className="opacity-0 group-hover:opacity-100 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-full transition-all"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                
                {contacts.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">No contacts added yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl shadow-2xl relative z-10 w-full max-w-sm">
            <h2 className="text-xl font-medium text-white mb-4">Add Emergency Contact</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input type="text" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Phone Number</label>
                <input type="text" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white" placeholder="+1234567890" />
              </div>
              <button 
                onClick={handleAddContact}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-xl py-2 mt-2 transition-colors"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
