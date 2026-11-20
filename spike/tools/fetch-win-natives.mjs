// Garante o binário nativo do koffi para Windows x64 (npm só instala o da plataforma atual).
// Necessário ao gerar o build de Windows a partir de Linux/macOS.
import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const v = JSON.parse(fs.readFileSync('node_modules/koffi/package.json', 'utf8')).version;
const dst = path.join('node_modules', '@koromix', 'koffi-win32-x64');
if (fs.existsSync(path.join(dst, 'package.json'))) { console.log('koffi-win32-x64 já presente'); process.exit(0); }
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'koffi-'));
execSync(`npm pack @koromix/koffi-win32-x64@${v}`, { cwd: tmp, stdio: 'inherit' });
fs.mkdirSync(dst, { recursive: true });
execSync(`tar xzf "${path.join(tmp, `koromix-koffi-win32-x64-${v}.tgz`)}" -C "${dst}" --strip-components=1`);
console.log('koffi-win32-x64', v, 'instalado em', dst);
