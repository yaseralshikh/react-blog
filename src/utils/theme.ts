export type ThemeMode = 'light' | 'dark';

export const setThemeClass = (mode: ThemeMode) => {
  const root = document.documentElement;
  const body = document.body;
  root.classList.remove('dark', 'light');
  body.classList.remove('dark', 'light');
  if (mode === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
  } else {
    root.classList.add('light');
    body.classList.add('light');
  }
};
