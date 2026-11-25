import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 函式庫模式：保留每個元件一個檔案（使用端可以只打包用到的），vue、@case-center/core 不打包進來
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'] },
    rollupOptions: {
      external: ['vue', /^@case-center\//],
      output: { preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' },
    },
    target: 'es2022',
    minify: false,
  },
});
