// Preload mínimo: só expõe chamadas nomeadas, nada de ipcRenderer cru.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('native', {
  isElectron: true,
  info: () => ipcRenderer.invoke('app:info'),
  steamTests: () => ipcRenderer.invoke('steam:tests'),
  steamOverlay: (dialog) => ipcRenderer.invoke('steam:overlay', dialog),
  windowMode: (mode) => ipcRenderer.invoke('win:mode', mode),
  saveResults: (obj) => ipcRenderer.invoke('results:save', obj),
});
