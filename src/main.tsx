import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setThemeClass, type ThemeMode } from './utils/theme'

// Apply saved or system theme before React renders to avoid flicker
const initializeTheme = () => {
  const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('devpulse_theme')) as ThemeMode | null;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const mode: ThemeMode = stored || (prefersDark ? 'dark' : 'light');
  setThemeClass(mode);
  if (!stored) {
    localStorage.setItem('devpulse_theme', mode);
  }
  return mode;
};

initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
