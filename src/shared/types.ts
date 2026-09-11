export type CharmId = 'mandala' | 'mystic-knot' | 'ganesha' | 'nazar' | 'blue-nazar' | 'horned-mask';

export type PositionPreset = 'top-center' | 'top-left' | 'top-right' | 'custom';

export type AnimationIntensity = 'off' | 'low' | 'medium' | 'high';

export interface MonitorInfo {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPrimary: boolean;
  scaleFactor: number;
}

export interface AppSettings {
  selectedCharm: CharmId;
  positionPreset: PositionPreset;
  customOffsetX: number; // Pixels relative to screen center or left
  monitorId: number | 'primary';
  animationEnabled: boolean;
  animationIntensity: AnimationIntensity;
  stringLength: number; // Hanging distance in pixels (e.g. 240 - 360)
  dampingFactor: number; // Physics damping (e.g. 0.015 - 0.05)
  soundEnabled: boolean;
  soundVolume: number; // 0 - 100
  alwaysOnTop: boolean;
  startWithWindows: boolean;
  isVisible: boolean;
  charmScale: number; // 0.5 to 1.5 (default: 1.0)
}

export interface CharmDefinition {
  id: CharmId;
  name: string;
  subtitle: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  badge: string;
}

export interface ElectronAPI {
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void;
  getMonitors: () => Promise<MonitorInfo[]>;
  setIgnoreMouseEvents: (ignore: boolean, options?: { forward?: boolean }) => void;
  openSettingsWindow: () => void;
  closeSettingsWindow: () => void;
  toggleVisibility: () => void;
  resetPosition: () => void;
  quitApp: () => void;
  showContextMenu: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
