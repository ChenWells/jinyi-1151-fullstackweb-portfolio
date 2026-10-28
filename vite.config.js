import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' 讓 GitHub Pages 的任何 repo 子路徑都能正常載入資源
export default defineConfig({
  plugins: [react()],
  base: './',
});
