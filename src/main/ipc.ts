import { ipcMain, BrowserWindow, Menu } from 'electron';
import { SettingsStore } from './store';
import { DangleWindow } from './windows/dangleWindow';
import { SettingsWindow } from './windows/settingsWindow';
import { getMonitorsList } from './monitors';
import { setStartWithWindows } from './startup';
import { CHARM_DEFINITIONS } from '../shared/constants';

export function registerIpcHandlers(
  store: SettingsStore,
  dangleWindow: DangleWindow,
  settingsWindow: SettingsWindow
): void {
  // Get current settings
  ipcMain.handle('get-settings', () => {
    return store.getSettings();
  });

  // Update settings
  ipcMain.handle('save-settings', (_event, partialSettings) => {
    if (partialSettings.startWithWindows !== undefined) {
      setStartWithWindows(partialSettings.startWithWindows);
    }
    const updated = store.updateSettings(partialSettings);
    dangleWindow.updateSettings(updated);

    // Broadcast to all windows
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send('settings-changed', updated);
      }
    });

    return updated;
  });

  // Reset settings
  ipcMain.handle('reset-settings', () => {
    const reset = store.resetSettings();
    dangleWindow.updateSettings(reset);
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send('settings-changed', reset);
      }
    });
    return reset;
  });

  // Get monitors list
  ipcMain.handle('get-monitors', () => {
    return getMonitorsList();
  });

  // Set mouse event forwarding/ignoring
  ipcMain.on('set-ignore-mouse-events', (event, ignore: boolean, options?: { forward?: boolean }) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
      win.setIgnoreMouseEvents(ignore, options);
    }
  });

  // Open Settings window
  ipcMain.on('open-settings', () => {
    settingsWindow.show();
  });

  // Close Settings window
  ipcMain.on('close-settings', () => {
    settingsWindow.hide();
  });

  // Toggle dangle visibility
  ipcMain.on('toggle-visibility', () => {
    const isVisible = dangleWindow.toggleVisibility();
    store.updateSettings({ isVisible });
  });

  // Reset position
  ipcMain.on('reset-position', () => {
    dangleWindow.resetPosition();
    store.updateSettings({ positionPreset: 'top-center', customOffsetX: 0 });
  });

  // Show right-click context menu on charm
  ipcMain.on('show-context-menu', (event) => {
    const currentSettings = store.getSettings();
    const menuTemplate = [
      {
        label: 'Settings...',
        click: () => settingsWindow.show()
      },
      { type: 'separator' as const },
      {
        label: 'Switch Charm',
        submenu: CHARM_DEFINITIONS.map((c) => ({
          label: c.name,
          type: 'radio' as const,
          checked: currentSettings.selectedCharm === c.id,
          click: () => {
            store.updateSettings({ selectedCharm: c.id });
            dangleWindow.updateSettings(store.getSettings());
          }
        }))
      },
      {
        label: 'Charm Size',
        submenu: [
          { label: 'Small (75%)', val: 0.75 },
          { label: 'Default (100%)', val: 1.0 },
          { label: 'Large (125%)', val: 1.25 },
          { label: 'Extra Large (150%)', val: 1.5 }
        ].map((item) => ({
          label: item.label,
          type: 'radio' as const,
          checked: Math.abs((currentSettings.charmScale ?? 1.0) - item.val) < 0.02,
          click: () => {
            store.updateSettings({ charmScale: item.val });
            dangleWindow.updateSettings(store.getSettings());
          }
        }))
      },
      {
        label: 'Position',
        submenu: [
          { label: 'Top Left', preset: 'top-left' as const },
          { label: 'Top Center', preset: 'top-center' as const },
          { label: 'Top Right', preset: 'top-right' as const }
        ].map((p) => ({
          label: p.label,
          type: 'radio' as const,
          checked: currentSettings.positionPreset === p.preset,
          click: () => {
            store.updateSettings({ positionPreset: p.preset, customOffsetX: 0 });
            dangleWindow.updateSettings(store.getSettings());
          }
        }))
      },
      {
        label: 'Mute Chime Sound',
        type: 'checkbox' as const,
        checked: !currentSettings.soundEnabled,
        click: (item: Electron.MenuItem) => {
          store.updateSettings({ soundEnabled: !item.checked });
          dangleWindow.updateSettings(store.getSettings());
        }
      },
      { type: 'separator' as const },
      {
        label: 'Hide Charm',
        click: () => {
          dangleWindow.toggleVisibility();
          store.updateSettings({ isVisible: false });
        }
      },
      {
        label: 'Quit',
        click: () => {
          require('electron').app.quit();
        }
      }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      menu.popup({ window: win });
    }
  });
}
