import { app, BrowserWindow, Menu, ipcMain } from 'electron';

app.whenReady().then(async () => {
  console.log('Testing Menu.popup with focusable: false...');

  const win = new BrowserWindow({
    width: 480,
    height: 520,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    show: false
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadURL('about:blank');

  let popupShown = false;

  const menu = Menu.buildFromTemplate([
    { label: 'Test Item 1', click: () => console.log('Clicked item 1') },
    { label: 'Test Item 2', click: () => console.log('Clicked item 2') }
  ]);

  menu.on('menu-will-show', () => {
    popupShown = true;
    console.log('Menu successfully shown on focusable:false window!');
    setTimeout(() => {
      menu.closePopup(win);
      console.log('Menu successfully closed.');
      win.destroy();
      app.quit();
    }, 500);
  });

  win.once('ready-to-show', () => {
    win.showInactive();
    setTimeout(() => {
      menu.popup({ window: win, x: 200, y: 200 });
    }, 300);
  });

  setTimeout(() => {
    if (!popupShown) {
      console.error('Menu failed to show!');
      win.destroy();
      app.quit();
    }
  }, 2000);
});
