import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0c]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-pink-900/20 via-[#0a0a0c] to-[#0a0a0c] -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-gray-900/60 backdrop-blur-2xl border border-gray-800 rounded-[2rem] p-8 shadow-2xl relative"
      >
        <div className="text-center mt-6 mb-8">
          <h2 className="text-2xl font-light text-center text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-center text-sm mb-8">Join SafeGuard today</p>
        
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 ml-1 mb-1 text-left">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Alex Doe"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 ml-1 mb-1 text-left">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 ml-1 mb-1 text-left">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-3 font-medium flex items-center justify-center hover:opacity-90 transition-opacity mt-6"
            >
              Sign Up <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:text-pink-400 transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
