
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, PenSquare, LogOut, User as UserIcon, Terminal, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 hover:opacity-80 transition-opacity">
          <Terminal size={28} strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DevPulse</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">
            Explore
          </Link>
          
          {user ? (
            <>
              {user.role === 'admin' && (
                 <Link to="/admin" className="flex items-center text-brand-600 hover:text-brand-700 font-medium px-3 py-1 bg-brand-50 dark:bg-brand-900/20 rounded-lg transition-colors">
                    <Shield size={16} className="mr-1.5" />
                    Admin Panel
                 </Link>
              )}
              
              <Link to="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/create" className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-full font-medium transition-all transform hover:scale-105">
                <PenSquare size={18} />
                <span>Write</span>
              </Link>
              <div className="relative group ml-4">
                <button className="flex items-center space-x-2 focus:outline-none">
                  {user.avatar ? (
                     <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border-2 border-brand-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                      <UserIcon size={18} />
                    </div>
                  )}
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        {user.role === 'admin' && <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 rounded uppercase font-bold">Admin</span>}
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 rounded-b-xl">
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium">
                Sign in
              </Link>
              <Link to="/register" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-full font-medium hover:opacity-90 transition-opacity">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600 dark:text-slate-300">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-4">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 dark:text-slate-300 font-medium">Explore</Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-brand-600 font-bold">Admin Panel</Link>
              )}
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 dark:text-slate-300 font-medium">Dashboard</Link>
              <Link to="/create" onClick={() => setIsMenuOpen(false)} className="block text-brand-600 dark:text-brand-400 font-medium">Write a Post</Link>
              <button onClick={handleLogout} className="block text-red-600 font-medium">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 dark:text-slate-300 font-medium">Sign in</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block text-brand-600 dark:text-brand-400 font-medium">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
