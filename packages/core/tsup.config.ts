import { defineConfig } from 'tsup';

// 每個檔案各自一個入口（@case-center/core/table、/icons…），共用的部分自動拆成 chunk
export default defineConfig({ entry: ['src/*.ts'], format: ['esm'], dts: true, splitting: true, clean: true, target: 'es2022' });
