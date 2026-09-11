import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';
import fs from 'fs';
import { SettingsStore } from './store';
import { CHARM_DEFINITIONS } from '../shared/constants';
import { setStartWithWindows } from './startup';

export class TrayManager {
  private tray: Tray | null = null;
  private store: SettingsStore;
  private onOpenSettings: () => void;
  private onToggleVisibility: () => void;
  private onResetPosition: () => void;

  constructor(
    store: SettingsStore,
    onOpenSettings: () => void,
    onToggleVisibility: () => void,
    onResetPosition: () => void
  ) {
    this.store = store;
    this.onOpenSettings = onOpenSettings;
    this.onToggleVisibility = onToggleVisibility;
    this.onResetPosition = onResetPosition;
  }

  public create(): Tray {
    const iconPath = this.getTrayIcon();
    this.tray = new Tray(iconPath);
    this.tray.setToolTip('Lucky Dangle - Hanging Screen Charm');

    this.updateContextMenu();

    this.tray.on('click', () => {
      this.onToggleVisibility();
    });

    this.store.onChange(() => {
      this.updateContextMenu();
    });

    return this.tray;
  }

  private getTrayIcon(): Electron.NativeImage {
    // Generate simple 16x16 or 32x32 crisp nativeImage icon if file not yet compiled
    const iconPngPath = path.join(__dirname, '../../build/tray-icon.png');
    if (fs.existsSync(iconPngPath)) {
      return nativeImage.createFromPath(iconPngPath);
    }
    // Fallback: 16x16 golden dot icon
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - 7.5;
        const dy = y - 7.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * size + x) * 4;
        if (dist <= 6) {
          buffer[idx] = 230;     // B
          buffer[idx + 1] = 180; // G
          buffer[idx + 2] = 34;  // R
          buffer[idx + 3] = 255; // A
        } else {
          buffer[idx + 3] = 0;
        }
      }
    }
    return nativeImage.createFromBuffer(buffer, { width: size, height: size });
  }

  public updateContextMenu(): void {
    if (!this.tray) return;

    const settings = this.store.getSettings();

    const charmMenuItems = CHARM_DEFINITIONS.map((charm) => ({
      label: charm.name,
      type: 'radio' as const,
      checked: settings.selectedCharm === charm.id,
      click: () => {
        this.store.updateSettings({ selectedCharm: charm.id });
      }
    }));

    const positionMenuItems = [
      { label: 'Top Left', preset: 'top-left' as const },
      { label: 'Top Center', preset: 'top-center' as const },
      { label: 'Top Right', preset: 'top-right' as const }
    ].map((pos) => ({
      label: pos.label,
      type: 'radio' as const,
      checked: settings.positionPreset === pos.preset,
      click: () => {
        this.store.updateSettings({ positionPreset: pos.preset, customOffsetX: 0 });
      }
    }));

    const intensityMenuItems = [
      { label: 'Low', value: 'low' as const },
      { label: 'Medium', value: 'medium' as const },
      { label: 'High', value: 'high' as const }
    ].map((item) => ({
      label: item.label,
      type: 'radio' as const,
      checked: settings.animationIntensity === item.value,
      click: () => {
        this.store.updateSettings({ animationIntensity: item.value });
      }
    }));

    const sizeMenuItems = [
      { label: 'Small (75%)', val: 0.75 },
      { label: 'Default (100%)', val: 1.0 },
      { label: 'Large (125%)', val: 1.25 },
      { label: 'Extra Large (150%)', val: 1.5 }
    ].map((item) => ({
      label: item.label,
      type: 'radio' as const,
      checked: Math.abs((settings.charmScale ?? 1.0) - item.val) < 0.02,
      click: () => {
        this.store.updateSettings({ charmScale: item.val });
      }
    }));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: settings.isVisible ? 'Hide Lucky Dangle' : 'Show Lucky Dangle',
        click: () => this.onToggleVisibility()
      },
      { type: 'separator' },
      {
        label: 'Choose Charm',
        submenu: charmMenuItems
      },
      {
        label: 'Charm Size',
        submenu: sizeMenuItems
      },
      {
        label: 'Screen Position',
        submenu: positionMenuItems
      },
      {
        label: 'Animation',
        submenu: [
          {
            label: 'Enable Animation',
            type: 'checkbox',
            checked: settings.animationEnabled,
            click: (item) => {
              this.store.updateSettings({ animationEnabled: item.checked });
            }
          },
          { type: 'separator' },
          ...intensityMenuItems
        ]
      },
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: settings.alwaysOnTop,
        click: (item) => {
          this.store.updateSettings({ alwaysOnTop: item.checked });
        }
      },
      {
        label: 'Chime Sound',
        type: 'checkbox',
        checked: settings.soundEnabled,
        click: (item) => {
          this.store.updateSettings({ soundEnabled: item.checked });
        }
      },
      { type: 'separator' },
      {
        label: 'Settings...',
        click: () => this.onOpenSettings()
      },
      {
        label: 'Start with Windows',
        type: 'checkbox',
        checked: settings.startWithWindows,
        click: (item) => {
          setStartWithWindows(item.checked);
          this.store.updateSettings({ startWithWindows: item.checked });
        }
      },
      {
        label: 'Reset Position',
        click: () => this.onResetPosition()
      },
      { type: 'separator' },
      {
        label: 'Quit Lucky Dangle',
        click: () => {
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
