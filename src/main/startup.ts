import { app } from 'electron';

export function setStartWithWindows(enable: boolean): boolean {
  try {
    app.setLoginItemSettings({
      openAtLogin: enable,
      openAsHidden: true,
      path: process.execPath,
      args: ['--hidden']
    });
    return true;
  } catch (err) {
    console.error('Failed to set login item settings:', err);
    return false;
  }
}

export function getStartWithWindows(): boolean {
  try {
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
  } catch (err) {
    console.error('Failed to get login item settings:', err);
    return false;
  }
}
