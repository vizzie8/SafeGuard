import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import { SettingsProvider } from './context/SettingsContext';
import { ParticleWaveBackground } from './components/ParticleWaveBackground';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
          <ParticleWaveBackground />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;
