import { app, screen } from 'electron';
import { SettingsStore } from './store';
import { DangleWindow } from './windows/dangleWindow';
import { SettingsWindow } from './windows/settingsWindow';
import { TrayManager } from './tray';
import { registerIpcHandlers } from './ipc';


app.setName('lucky-dangle');

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('Another instance of Lucky Dangle is already running.');
  app.quit();
} else {
  console.log('Acquired single instance lock for Lucky Dangle.');
}

let store: SettingsStore;
let dangleWindow: DangleWindow;
let settingsWindow: SettingsWindow;
let trayManager: TrayManager;

async function initApp() {
  console.log('Initializing Lucky Dangle main process...');
  store = new SettingsStore();
  const settings = store.getSettings();
  console.log('Settings loaded, selected charm:', settings.selectedCharm);

  dangleWindow = new DangleWindow(settings);
  settingsWindow = new SettingsWindow();

  // Register IPC handlers
  registerIpcHandlers(store, dangleWindow, settingsWindow);

  // Create windows
  dangleWindow.create();
  console.log('Dangle window created.');

  // Create Tray icon
  trayManager = new TrayManager(
    store,
    () => settingsWindow.show(),
    () => {
      const isVisible = dangleWindow.toggleVisibility();
      store.updateSettings({ isVisible });
    },
    () => {
      dangleWindow.resetPosition();
      store.updateSettings({ positionPreset: 'top-center', customOffsetX: 0 });
    }
  );
  trayManager.create();

  // Monitor changes listener
  const updateDisplays = () => {
    const currentSettings = store.getSettings();
    dangleWindow.updateSettings(currentSettings);
  };

  screen.on('display-added', updateDisplays);
  screen.on('display-removed', updateDisplays);
  screen.on('display-metrics-changed', updateDisplays);
}

app.whenReady().then(initApp);

// Don't quit when windows close (runs in tray)
app.on('window-all-closed', () => {
  // Keep running in system tray
});

app.on('second-instance', () => {
  // If user tries to launch again, show dangle and settings
  if (dangleWindow) {
    const settings = store.getSettings();
    if (!settings.isVisible) {
      dangleWindow.toggleVisibility();
      store.updateSettings({ isVisible: true });
    }
  }
  if (settingsWindow) {
    settingsWindow.show();
  }
});

app.on('before-quit', () => {
  trayManager?.destroy();
});
