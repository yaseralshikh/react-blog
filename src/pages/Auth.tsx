
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/mockDb';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from '../components/Toast';

interface AuthPageProps {
  mode: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const user = await db.login(email, password);
        if (user) {
          login(user);
          toast.success(`Welcome back, ${user.name}!`);
          navigate('/dashboard');
        } else {
          setError('Invalid email or password');
          toast.error('Invalid email or password');
        }
      } else {
        // Register
        try {
          const newUser = await db.register(name, email, password);
          login(newUser);
          toast.success('Account created successfully');
          navigate('/dashboard');
        } catch (err: any) {
           setError(err.message || 'Registration failed');
           toast.error(err.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "appearance-none block w-full pl-10 pr-3 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/90 dark:bg-transparent py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
       {/* Background Blobs */}
       <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
       <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full space-y-8 bg-white/95 dark:bg-slate-800/85 p-10 rounded-3xl shadow-2xl relative z-10 border border-slate-100 dark:border-slate-600/70 backdrop-blur">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {mode === 'login' ? 'Enter your details to access your account' : 'Start your blogging journey today'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3 rounded-lg text-sm text-center font-medium border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClasses}
                  placeholder="Full Name"
                />
              </div>
            )}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-500/30 disabled:opacity-70"
            >
              {isLoading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Create Account'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => navigate(mode === 'login' ? '/register' : '/login')} 
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
