import { contextBridge, ipcRenderer } from 'electron';
import { AppSettings, ElectronAPI } from '../shared/types';

const api: ElectronAPI = {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke('save-settings', settings),
  onSettingsChanged: (callback: (settings: AppSettings) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, updated: AppSettings) => callback(updated);
    ipcRenderer.on('settings-changed', listener);
    return () => {
      ipcRenderer.removeListener('settings-changed', listener);
    };
  },
  getMonitors: () => ipcRenderer.invoke('get-monitors'),
  setIgnoreMouseEvents: (ignore: boolean, options?: { forward?: boolean }) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  openSettingsWindow: () => ipcRenderer.send('open-settings'),
  closeSettingsWindow: () => ipcRenderer.send('close-settings'),
  toggleVisibility: () => ipcRenderer.send('toggle-visibility'),
  resetPosition: () => ipcRenderer.send('reset-position'),
  quitApp: () => ipcRenderer.send('quit-app'),
  showContextMenu: () => ipcRenderer.send('show-context-menu')
};

contextBridge.exposeInMainWorld('electronAPI', api);
