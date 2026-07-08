import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const useDummyCredentials = (role: 'USER' | 'ADMIN') => {
    if (role === 'ADMIN') {
      setEmail('admin@safeguard.com');
      setPassword('admin123');
    } else {
      setEmail('user@safeguard.com'); // assuming the user logs in as a regular user
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-teal-500/30 dark:border-orange-500/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(45,212,191,0.2)] dark:shadow-[0_0_40px_rgba(249,115,22,0.2)] relative transition-colors"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/30 dark:bg-black/30 backdrop-blur-xl p-4 rounded-full border border-teal-500/30 dark:border-orange-500/30 shadow-[0_0_20px_rgba(45,212,191,0.2)] dark:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-colors">
          <Shield className="h-10 w-10 text-teal-600 dark:text-orange-500 transition-colors" />
        </div>
        
        <div className="text-center mt-6 mb-8">
          <h2 className="text-2xl font-light text-center text-slate-800 dark:text-white mb-2 transition-colors">Welcome Back</h2>
          <p className="text-slate-500 dark:text-gray-400 text-center text-sm mb-8 transition-colors">Sign in to your SafeGuard account</p>
        
          {error && <div className="bg-red-100 border border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/50 dark:text-red-400 p-3 rounded-xl mb-4 text-sm transition-colors">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 dark:text-gray-400 ml-1 mb-1 text-left transition-colors">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-orange-500 transition-colors shadow-sm dark:shadow-none"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-gray-400 ml-1 mb-1 text-left transition-colors">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-teal-500 dark:focus:border-orange-500 transition-colors shadow-sm dark:shadow-none"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center space-x-2 text-sm text-slate-500 dark:text-gray-400 transition-colors">
                <input type="checkbox" className="rounded border-slate-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-teal-500 dark:text-orange-500 focus:ring-teal-500 dark:focus:ring-orange-500" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-sm text-teal-600 dark:text-orange-500 hover:text-teal-500 dark:hover:text-orange-400 transition-colors">Forgot password?</a>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 dark:from-orange-500 dark:to-amber-500 text-white rounded-xl py-3 font-medium flex items-center justify-center hover:opacity-90 transition-opacity mt-6 shadow-md"
            >
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 flex flex-col space-y-2">
            <button 
              type="button"
              onClick={() => useDummyCredentials('USER')}
              className="text-xs text-slate-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-orange-400 underline decoration-dashed underline-offset-4 transition-colors"
            >
              Use User Dummy Credentials
            </button>
            <button 
              type="button"
              onClick={() => useDummyCredentials('ADMIN')}
              className="text-xs text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-amber-400 underline decoration-dashed underline-offset-4 transition-colors"
            >
              Use Admin Dummy Credentials
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-gray-500 mt-8 transition-colors">
            Don't have an account?{' '}
            <Link to="/register" className="text-slate-800 dark:text-white hover:text-teal-600 dark:hover:text-orange-400 transition-colors font-medium">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
