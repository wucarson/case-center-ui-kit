import { defineConfig } from 'tsup';

// react、@wucarson/facet-core 不打包進來（peer／dependency），使用端只會有一份
export default defineConfig({ entry: ['src/index.ts'], format: ['esm'], dts: true, clean: true, target: 'es2022', external: ['react', 'react-dom', /^@wucarson\/facet-/] });
