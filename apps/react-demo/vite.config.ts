import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './'：build 出來的展示頁可以直接用 file:// 開（比對工具用）
export default defineConfig({ plugins: [react()], base: './', server: { fs: { allow: ['..'] } } });
