
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { PostDetail } from './pages/PostDetail';
import { AuthPage } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';
import { AdminDashboard } from './pages/AdminDashboard';
import { ToastContainer } from './components/Toast';

// Scroll to top on route change wrapper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-gradient-to-br dark:from-[#0b1220] dark:via-[#0d1426] dark:to-[#0a0f1c] dark:text-slate-100 transition-colors">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/create" element={<Editor />} />
        <Route path="/edit/:id" element={<Editor />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <ToastContainer position="top-right" theme="colored" closeOnClick newestOnTop pauseOnHover={false} />
      </Router>
    </AuthProvider>
  );
};

export default App;
