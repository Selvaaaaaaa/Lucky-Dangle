import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { AppSettings } from '../shared/types';
import { DEFAULT_SETTINGS } from '../shared/constants';

export class SettingsStore {
  private filePath: string;
  private settings: AppSettings;
  private listeners: Array<(settings: AppSettings) => void> = [];

  constructor() {
    const userDataPath = app.getPath('userData');
    this.filePath = path.join(userDataPath, 'settings.json');
    this.settings = this.load();
  }

  private load(): AppSettings {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(data);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (err) {
      console.error('Failed to load settings file, falling back to defaults:', err);
    }
    return { ...DEFAULT_SETTINGS };
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<AppSettings>): AppSettings {
    this.settings = { ...this.settings, ...partial };
    this.save();
    this.notify();
    return { ...this.settings };
  }

  public resetSettings(): AppSettings {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
    this.notify();
    return { ...this.settings };
  }

  private save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }

  public onChange(callback: (settings: AppSettings) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener({ ...this.settings });
      } catch (err) {
        console.error('Error in settings listener:', err);
      }
    }
  }
}
