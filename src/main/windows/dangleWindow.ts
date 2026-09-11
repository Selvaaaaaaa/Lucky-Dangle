import { BrowserWindow } from 'electron';
import path from 'path';
import { AppSettings } from '../../shared/types';
import { calculateWindowBounds } from '../monitors';

export class DangleWindow {
  private window: BrowserWindow | null = null;
  private settings: AppSettings;

  constructor(settings: AppSettings) {
    this.settings = settings;
  }

  public create(): BrowserWindow {
    const bounds = calculateWindowBounds(
      this.settings.monitorId,
      this.settings.positionPreset,
      this.settings.customOffsetX
    );

    this.window = new BrowserWindow({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      transparent: true,
      frame: false,
      hasShadow: false,
      alwaysOnTop: this.settings.alwaysOnTop,
      skipTaskbar: true,
      resizable: false,
      focusable: false, // Prevents stealing focus from active apps
      show: false,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        backgroundThrottling: false, // Ensures smooth 60fps physics while working in other apps
        devTools: process.env.NODE_ENV === 'development'
      }
    });

    if (this.settings.alwaysOnTop) {
      this.window.setAlwaysOnTop(true, 'screen-saver');
    }

    // Default to passing through mouse events until hovered over the charm
    this.window.setIgnoreMouseEvents(true, { forward: true });

    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
    if (devServerUrl) {
      this.window.loadURL(devServerUrl);
    } else {
      this.window.loadFile(path.join(__dirname, '../../dist/index.html'));
    }

    this.window.webContents.on('did-fail-load', (_e, code, desc, url) => {
      console.error('Dangle window failed to load:', url, code, desc);
    });

    this.window.once('ready-to-show', () => {
      console.log('Dangle window ready to show, isVisible:', this.settings.isVisible);
      if (this.settings.isVisible) {
        this.window?.showInactive();
      }
    });

    this.window.on('closed', () => {
      this.window = null;
    });

    return this.window;
  }

  public getWindow(): BrowserWindow | null {
    return this.window;
  }

  public updateSettings(settings: AppSettings): void {
    this.settings = settings;
    if (!this.window || this.window.isDestroyed()) return;

    // Update position and monitor
    const bounds = calculateWindowBounds(
      this.settings.monitorId,
      this.settings.positionPreset,
      this.settings.customOffsetX
    );
    this.window.setBounds(bounds);

    // Update always on top
    this.window.setAlwaysOnTop(this.settings.alwaysOnTop, 'screen-saver');

    // Update visibility
    if (this.settings.isVisible) {
      if (!this.window.isVisible()) {
        this.window.showInactive();
      }
    } else {
      if (this.window.isVisible()) {
        this.window.hide();
      }
    }

    // Send updated settings to renderer
    this.window.webContents.send('settings-changed', this.settings);
  }

  public toggleVisibility(): boolean {
    if (!this.window || this.window.isDestroyed()) return false;
    const newState = !this.window.isVisible();
    if (newState) {
      this.window.showInactive();
    } else {
      this.window.hide();
    }
    return newState;
  }

  public setIgnoreMouseEvents(ignore: boolean, forward: boolean = false): void {
    if (!this.window || this.window.isDestroyed()) return;
    this.window.setIgnoreMouseEvents(ignore, { forward });
  }

  public resetPosition(): void {
    if (!this.window || this.window.isDestroyed()) return;
    const bounds = calculateWindowBounds('primary', 'top-center', 0);
    this.window.setBounds(bounds);
  }
}
