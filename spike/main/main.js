// Spike Fase 0 — processo principal: janela, Steamworks (App ID 480 / Spacewar), resultados em arquivo.
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const APP_ID = 480;
const isWin = process.platform === 'win32';

// Overlay da Steam em Electron: GPU no mesmo processo e sem DirectComposition (Windows),
// e a janela precisa repintar todo quadro (o jogo já faz isso com requestAnimationFrame).
if (isWin) {
  app.commandLine.appendSwitch('in-process-gpu');
  app.commandLine.appendSwitch('disable-direct-composition');
}
app.commandLine.appendSwitch('force_high_performance_gpu');

let win = null;
let steam = null;
const log = [];
const note = (k, ok, detail) => { const e = { t: new Date().toISOString(), k, ok, detail: detail === undefined ? null : detail }; log.push(e); console.log(`[steam] ${k}: ${ok ? 'OK' : 'FALHOU'} ${detail ? JSON.stringify(detail) : ''}`); return e; };

function sdkPath() {
  // Em dev: spike/steamworks_sdk ; empacotado: resources/steamworks_sdk
  const candidates = [path.join(process.resourcesPath || '', 'steamworks_sdk'), path.join(__dirname, '..', 'steamworks_sdk')];
  return candidates.find(p => fs.existsSync(path.join(p, 'redistributable_bin'))) || null;
}

function initSteam() {
  if (steam) return steam;
  let SDK;
  try { SDK = require('steamworks-ffi-node'); } catch (e) { note('require steamworks-ffi-node', false, String(e.message)); return null; }
  const S = (SDK.default || SDK).getInstance ? (SDK.default || SDK) : SDK.SteamworksSDK;
  const inst = S.getInstance();
  const sdk = sdkPath();
  if (!sdk) { note('SDK redistributable_bin', false, 'pasta steamworks_sdk/redistributable_bin não encontrada (baixe o SDK no site de parceiros)'); return null; }
  note('SDK redistributable_bin', true, sdk);
  try { inst.setSdkPath(sdk); } catch (e) { note('setSdkPath', false, String(e.message)); }
  let ok = false;
  try { ok = inst.init({ appId: APP_ID }); } catch (e) { note('init', false, String(e.message)); return null; }
  note('init App ID 480', ok, ok ? inst.getStatus() : 'Steam aberta e logada?');
  if (!ok) return null;
  steam = inst;
  setInterval(() => { try { steam.runCallbacks(); } catch { /* ignora */ } }, 50);
  return steam;
}

async function runSteamTests() {
  log.length = 0;
  const s = initSteam();
  if (!s) return { ok: false, log };
  const step = async (k, fn) => { try { const r = await fn(); return note(k, r !== false && r !== null && r !== undefined, r); } catch (e) { return note(k, false, String(e && e.message || e)); } };
  await step('persona', () => s.friends.getPersonaName());
  await step('idioma da Steam', () => s.getCurrentGameLanguage());
  await step('overlay disponível', () => s.overlay && s.isOverlayAvailable ? s.isOverlayAvailable() : null);
  // Conquista de teste do Spacewar
  const ACH = 'ACH_WIN_ONE_GAME';
  await step('conquista: desbloquear', () => s.achievements.unlockAchievement(ACH));
  await step('conquista: está desbloqueada', () => s.achievements.isAchievementUnlocked(ACH));
  await step('conquista: resetar', () => s.achievements.clearAchievement(ACH));
  await step('conquista: resetada', async () => (await s.achievements.isAchievementUnlocked(ACH)) === false);
  // Steam Cloud
  const payload = JSON.stringify({ spike: true, at: Date.now(), rnd: Math.random() });
  await step('cloud: habilitada conta/app', () => ({ conta: s.cloud.isCloudEnabledForAccount(), app: s.cloud.isCloudEnabledForApp() }));
  await step('cloud: gravar', () => s.cloud.fileWrite('spike_save.json', Buffer.from(payload)));
  await step('cloud: ler e comparar', () => { const r = s.cloud.fileRead('spike_save.json'); const txt = r && r.data ? Buffer.from(r.data).toString() : null; return txt === payload ? { bytes: txt.length } : false; });
  await step('cloud: cota', () => s.cloud.getQuota());
  // Placar
  const lb = await (async () => { try { return await s.leaderboards.findLeaderboard('Feet Traveled'); } catch (e) { return null; } })();
  note('placar: achar "Feet Traveled"', !!lb, lb ? { name: lb.name, entries: lb.entryCount } : null);
  if (lb) {
    const score = 1000 + Math.floor(Math.random() * 9000);
    await step(`placar: enviar ${score}`, () => s.leaderboards.uploadScore(lb.handle, score, 2 /* ForceUpdate */));
    await step('placar: baixar top 5', async () => (await s.leaderboards.downloadLeaderboardEntries(lb.handle, 0 /* Global */, 1, 5)).map(e => ({ rank: e.globalRank, score: e.score })));
  }
  await step('rich presence', () => s.richPresence.setRichPresence('status', 'Abrindo pacotes (spike)'));
  return { ok: log.every(e => e.ok), log };
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: Math.min(1280, width), height: Math.min(800, height), minWidth: 480, minHeight: 270,
    backgroundColor: '#14101c', show: false, autoHideMenuBar: true, title: 'MiniFolks Packs — Spike',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'), { query: process.argv.includes('--bench') ? { bench: '1' } : {} });
  win.once('ready-to-show', () => win.show());
  win.webContents.on('console-message', (_e, level, message) => { if (level >= 2) console.log('[renderer]', message); });
}

ipcMain.handle('app:info', () => ({ electron: process.versions.electron, chrome: process.versions.chrome, platform: process.platform, arch: process.arch, packaged: app.isPackaged, exe: app.getPath('exe'), userData: app.getPath('userData'), gpu: app.getGPUFeatureStatus() }));
ipcMain.handle('steam:tests', () => runSteamTests());
ipcMain.handle('steam:overlay', (_e, dialog) => { const s = initSteam(); if (!s) return false; try { s.overlay.activateGameOverlay(dialog || 'Achievements'); return true; } catch (e) { return String(e.message); } });
ipcMain.handle('win:mode', (_e, mode) => {
  if (!win) return null;
  // No Electron a "tela cheia" já é janela sem borda do tamanho do monitor (não existe modo exclusivo).
  // "sem borda" aqui = tela cheia sem trocar de espaço no macOS; no Windows/Linux é o mesmo resultado.
  if (mode === 'fullscreen' || mode === 'borderless') { win.setFullScreen(true); }
  else { win.setFullScreen(false); win.setSize(1280, 800); win.center(); }
  return mode;
});
ipcMain.handle('results:save', (_e, obj) => {
  const file = path.join(app.getPath('userData'), 'spike-results.json');
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  fs.writeFileSync(file, JSON.stringify({ ...prev, ...obj, steamLog: log.length ? log : prev.steamLog, savedAt: new Date().toISOString() }, null, 2));
  return file;
});

app.whenReady().then(async () => {
  if (process.argv.includes('--steam-selftest')) { // roda os testes da Steam sem janela, grava e sai
    const r = await runSteamTests();
    const file = path.join(app.getPath('userData'), 'spike-results.json');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ steam: r, savedAt: new Date().toISOString() }, null, 2));
    console.log(`[steam] resultado: ${r.ok ? 'TUDO OK' : 'HOUVE FALHAS'} -> ${file}`);
    try { steam && steam.shutdown(); } catch { /* ignora */ }
    return app.exit(r.ok ? 0 : 1);
  }
  createWindow();
});
app.on('window-all-closed', () => { try { steam && steam.shutdown(); } catch { /* ignora */ } app.quit(); });
