// 安裝測試：把 6 個套件打包成安裝檔（npm pack），裝進一個全新的專案，確認「別人裝了能用」。
// 檢查：安裝檔內容（有 dist、沒有原始碼）、執行期能載入、樣式路徑解析得到、React／Vue／Angular 的型別檢查通過。
// 用法：先 npm run build:packages，再 npm run pack:check（在 repo 根目錄）
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-pack-'));
const tgz = path.join(tmp, 'tgz'), app = path.join(tmp, 'app');
fs.mkdirSync(tgz); fs.mkdirSync(app);
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
let bad = 0;
const ok = (cond, msg) => { console.log((cond ? '✓ ' : '✗ ') + msg); if (!cond) bad++; };

// 1. 打包（Angular 從 ng-packagr 的 dist 打包）
const PKGS = { core: 'packages/core', tokens: 'packages/tokens', styles: 'packages/styles', react: 'packages/react', vue: 'packages/vue', angular: 'packages/angular/dist' };
const files = {};
for (const [k, dir] of Object.entries(PKGS)) {
  const [info] = JSON.parse(sh(`npm pack --json --pack-destination "${tgz}"`, path.join(root, dir)));
  files[k] = info.files.map((f) => f.path);
  ok(!files[k].some((f) => f.startsWith('src/')), `${info.name}：${info.files.length} 個檔案、${(info.size / 1024).toFixed(0)} KB，不含原始碼`);
}
ok(files.core.includes('dist/table.d.ts'), 'core 有型別檔');
ok(files.react.includes('dist/index.d.ts') && files.vue.includes('dist/index.d.ts'), 'react、vue 有型別檔');
ok(files.angular.some((f) => f.startsWith('fesm2022/')), 'angular 是 Angular 套件格式（fesm2022）');

// 2. 全新專案安裝（只裝安裝檔與框架本身）
const tarballs = fs.readdirSync(tgz).map((f) => `"${path.join(tgz, f)}"`).join(' ');
fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }));
const ng = JSON.parse(fs.readFileSync(path.join(root, 'packages/angular/package.json'), 'utf8')).devDependencies;
sh(`npm install --no-audit --no-fund --prefer-offline ${tarballs} react@18 react-dom@18 @types/react@18 vue@3 @angular/core@${ng['@angular/core']} @angular/common@${ng['@angular/common']} @angular/platform-browser@${ng['@angular/platform-browser']} rxjs@7 typescript@~6.0.2`, app);
console.log('✓ 全新專案安裝完成');

// 3. 執行期載入（Node 直接 import，驗證 exports 對得上）
const run = (code) => { try { return sh(`node --input-type=module -e "${code}"`, app).trim(); } catch (e) { return 'ERR ' + e.stderr.split('\n')[0]; } };
ok(run("import { sortRows } from '@wucarson/facet-core/table'; console.log(typeof sortRows)") === 'function', 'import @wucarson/facet-core/table');
ok(run("import { tokens } from '@wucarson/facet-tokens'; console.log(typeof tokens.color)") === 'object', 'import @wucarson/facet-tokens');
ok(run("import { createRequire } from 'node:module'; const r = createRequire(process.cwd() + '/'); console.log(r.resolve('@wucarson/facet-styles/components.css').endsWith('components.css'))") === 'true', '解析 @wucarson/facet-styles/components.css');

// 4. 型別檢查：照文件的用法各寫一段
fs.mkdirSync(path.join(app, 'src'));
fs.writeFileSync(path.join(app, 'src/react.tsx'), `import { Button, DataTable, Switch, type TableColumn } from '@wucarson/facet-react';
const cols: TableColumn[] = [];
export const A = () => <><Button variant="outline">取消</Button><Switch checked={true} onChange={() => {}} label="提醒" /><DataTable label="案件" columns={cols} rows={[]} /></>;
`);
fs.writeFileSync(path.join(app, 'src/vue.ts'), `import { defineComponent, h } from 'vue';
import { Button, DataTable } from '@wucarson/facet-vue';
export const A = defineComponent(() => () => [h(Button, { variant: 'outline' }, () => '取消'), h(DataTable, { label: '案件', columns: [], rows: [] })]);
`);
fs.writeFileSync(path.join(app, 'src/angular.ts'), `import { Component } from '@angular/core';
import { Button, DataTable, Switch } from '@wucarson/facet-angular';
@Component({ selector: 'x-a', imports: [Button, DataTable, Switch], template: '' })
export class A {}
`);
fs.writeFileSync(path.join(app, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM'], module: 'ESNext', moduleResolution: 'bundler', jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: false, experimentalDecorators: true, types: [] }, include: ['src'] }));
try { sh('npx tsc -p .', app); ok(true, '型別檢查：React、Vue、Angular 用法都通過'); }
catch (e) { ok(false, '型別檢查失敗：\n' + (e.stdout || e.stderr).split('\n').slice(0, 15).join('\n')); }

console.log(bad ? `\n${bad} 項失敗（暫存資料夾：${tmp}）` : '\n全部通過');
if (!bad) fs.rmSync(tmp, { recursive: true, force: true });
process.exit(bad ? 1 : 0);
