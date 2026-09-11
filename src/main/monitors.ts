import { screen, Display } from 'electron';
import { MonitorInfo, PositionPreset } from '../shared/types';
import { WINDOW_CONFIG } from '../shared/constants';

export function getMonitorsList(): MonitorInfo[] {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

  return displays.map((disp, idx) => ({
    id: disp.id,
    name: `Display ${idx + 1} (${disp.bounds.width}x${disp.bounds.height}${disp.id === primaryDisplay.id ? ' - Primary' : ''})`,
    x: disp.bounds.x,
    y: disp.bounds.y,
    width: disp.bounds.width,
    height: disp.bounds.height,
    isPrimary: disp.id === primaryDisplay.id,
    scaleFactor: disp.scaleFactor
  }));
}

export function getTargetDisplay(monitorId: number | 'primary'): Display {
  const displays = screen.getAllDisplays();
  if (monitorId === 'primary' || !monitorId) {
    return screen.getPrimaryDisplay();
  }
  const found = displays.find((d) => d.id === monitorId);
  return found || screen.getPrimaryDisplay();
}

export function calculateWindowBounds(
  monitorId: number | 'primary',
  preset: PositionPreset,
  customOffsetX: number = 0
): { x: number; y: number; width: number; height: number } {
  const display = getTargetDisplay(monitorId);
  const winWidth = WINDOW_CONFIG.DANGLE_WIDTH;
  const winHeight = WINDOW_CONFIG.DANGLE_HEIGHT;

  let x: number;
  // Always attach to top edge of monitor (y = display.bounds.y)
  const y = display.bounds.y;

  switch (preset) {
    case 'top-left':
      x = display.bounds.x + 60;
      break;
    case 'top-right':
      x = display.bounds.x + display.bounds.width - winWidth - 60;
      break;
    case 'custom':
      const centerX = display.bounds.x + (display.bounds.width - winWidth) / 2;
      x = Math.max(
        display.bounds.x,
        Math.min(display.bounds.x + display.bounds.width - winWidth, centerX + customOffsetX)
      );
      break;
    case 'top-center':
    default:
      x = display.bounds.x + Math.round((display.bounds.width - winWidth) / 2);
      break;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: winWidth,
    height: winHeight
  };
}
