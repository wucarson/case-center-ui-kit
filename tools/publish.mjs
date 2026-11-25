// 發佈 6 個 Facet 套件到 GitHub Packages（CI 的 release 流程呼叫；先 npm run build:packages）。
// 已經發佈過的版本會跳過，所以重跑不會出錯。Angular 從 ng-packagr 的 dist 發佈。
// 印出「New tag: 名稱@版本」，changesets/action 會照這個建立 git tag 與 GitHub Release。
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// 依賴順序：core、tokens、styles 先發，框架套件才裝得到
const DIRS = ['packages/core', 'packages/tokens', 'packages/styles', 'packages/react', 'packages/vue', 'packages/angular/dist'];
const dry = process.argv.includes('--dry-run');

for (const dir of DIRS) {
  const cwd = path.join(root, dir);
  const { name, version } = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
  let exists = false;
  try { exists = execSync(`npm view ${name}@${version} version`, { cwd, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim() === version; } catch {}
  if (exists) { console.log(`略過 ${name}@${version}（已發佈）`); continue; }
  execSync(`npm publish${dry ? ' --dry-run' : ''}`, { cwd, stdio: 'inherit' });
  if (dry) continue;
  // changesets/action 讀到「New tag:」會推送這個標籤並建立 GitHub Release，所以標籤要先在本機建好
  execSync(`git tag "${name}@${version}"`, { cwd: root, stdio: 'inherit' });
  console.log(`New tag: ${name}@${version}`);
}
