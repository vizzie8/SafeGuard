import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0a0c]">
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
