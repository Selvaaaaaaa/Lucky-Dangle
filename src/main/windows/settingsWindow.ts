import { BrowserWindow } from 'electron';
import path from 'path';
import { WINDOW_CONFIG } from '../../shared/constants';

export class SettingsWindow {
  private window: BrowserWindow | null = null;

  public create(): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      this.window.show();
      this.window.focus();
      return this.window;
    }

    this.window = new BrowserWindow({
      width: WINDOW_CONFIG.SETTINGS_WIDTH,
      height: WINDOW_CONFIG.SETTINGS_HEIGHT,
      title: 'Lucky Dangle Settings',
      frame: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      center: true,
      show: false,
      backgroundColor: '#0f1117',
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        devTools: process.env.NODE_ENV === 'development'
      }
    });

    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (devServerUrl) {
      this.window.loadURL(`${devServerUrl}/settings.html`);
    } else {
      this.window.loadFile(path.join(__dirname, '../../dist/settings.html'));
    }

    this.window.once('ready-to-show', () => {
      this.window?.show();
      this.window?.focus();
    });

    // Hide instead of destroying so it opens instantly next time
    this.window.on('close', (e) => {
      if (!this.window?.isDestroyed()) {
        e.preventDefault();
        this.window?.hide();
      }
    });

    return this.window;
  }

  public show(): void {
    if (!this.window || this.window.isDestroyed()) {
      this.create();
    } else {
      this.window.show();
      this.window.focus();
    }
  }

  public hide(): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.hide();
    }
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }
}
