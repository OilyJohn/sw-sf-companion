// Colour theme, saved on this device. 'default' is the yellow-on-black look.
export const THEMES = [
  { id: 'default', label: 'Classic Yellow', bar: '#050505' },
  { id: 'hologram', label: 'Hologram', bar: '#010816' },
  { id: 'saber-red', label: 'Lightsaber: Red', bar: '#000000' },
  { id: 'saber-blue', label: 'Lightsaber: Blue', bar: '#000000' },
  { id: 'saber-green', label: 'Lightsaber: Green', bar: '#000000' },
  { id: 'saber-purple', label: 'Lightsaber: Purple', bar: '#000000' },
];
const KEY = 'sf-theme';

export function getTheme() {
  try { return THEMES.some(t => t.id === localStorage.getItem(KEY)) ? localStorage.getItem(KEY) : 'default'; } catch { return 'default'; }
}

export function applyTheme(id) {
  const theme = THEMES.find(t => t.id === id) ?? THEMES[0];
  if (theme.id === 'default') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme.id;
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', theme.bar);
  try { localStorage.setItem(KEY, theme.id); } catch { /* private mode: theme just won't persist */ }
}
