import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from https://oilyjohn.github.io/sw-sf-companion/
export default defineConfig({
  plugins: [react()],
  base: '/sw-sf-companion/',
});
