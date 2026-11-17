import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// base './'：build 出來的展示頁給比對工具用
export default defineConfig({ plugins: [vue()], base: './', server: { fs: { allow: ['..'] } } });
