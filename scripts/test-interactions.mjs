import { app, BrowserWindow, ipcMain } from 'electron';

app.whenReady().then(async () => {
  console.log('--- Testing Window Configuration & Mouse Events ---');

  const win = new BrowserWindow({
    width: 480,
    height: 520,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.setAlwaysOnTop(true, 'screen-saver');

  let events = [];

  ipcMain.on('evt', (_e, data) => {
    events.push(data);
    console.log('  [DOM Event]', data.type, 'at', data.x, data.y, 'button:', data.button);
  });

  win.loadURL(`data:text/html,<html>
    <body style="margin:0;background:transparent;overflow:hidden;">
      <div id="charm" style="position:absolute;left:200px;top:200px;width:100px;height:100px;background:gold;"></div>
      <script>
        const { ipcRenderer } = require('electron');
        const charm = document.getElementById('charm');
        ['mouseenter', 'mousemove', 'mousedown', 'mouseup', 'click', 'contextmenu'].forEach(t => {
          charm.addEventListener(t, (e) => {
            ipcRenderer.send('evt', { type: t, x: e.clientX, y: e.clientY, button: e.button });
          });
        });
        document.body.addEventListener('mousemove', (e) => {
          ipcRenderer.send('evt', { type: 'body-move', x: e.clientX, y: e.clientY });
        });
      </script>
    </body>
  </html>`);

  await new Promise((resolve) => win.once('ready-to-show', resolve));
  win.showInactive();

  // Test Step A: With setIgnoreMouseEvents(true, { forward: true })
  console.log('Step A: setIgnoreMouseEvents(true, { forward: true })');
  win.setIgnoreMouseEvents(true, { forward: true });
  await new Promise((r) => setTimeout(r, 200));

  // Dispatch mouse move over body
  win.webContents.sendInputEvent({ type: 'mouseMove', x: 50, y: 50 });
  await new Promise((r) => setTimeout(r, 100));

  // Dispatch mouse move over charm
  win.webContents.sendInputEvent({ type: 'mouseMove', x: 250, y: 250 });
  await new Promise((r) => setTimeout(r, 100));

  // Test Step B: When over charm, renderer sets setIgnoreMouseEvents(false)
  console.log('Step B: setIgnoreMouseEvents(false)');
  win.setIgnoreMouseEvents(false);
  await new Promise((r) => setTimeout(r, 200));

  // Dispatch mouse down on charm
  win.webContents.sendInputEvent({ type: 'mouseDown', x: 250, y: 250, button: 'left', clickCount: 1 });
  await new Promise((r) => setTimeout(r, 100));

  // Dispatch drag
  win.webContents.sendInputEvent({ type: 'mouseMove', x: 280, y: 270 });
  await new Promise((r) => setTimeout(r, 100));

  // Dispatch mouse up
  win.webContents.sendInputEvent({ type: 'mouseUp', x: 280, y: 270, button: 'left', clickCount: 1 });
  await new Promise((r) => setTimeout(r, 100));

  // Dispatch right click
  win.webContents.sendInputEvent({ type: 'mouseDown', x: 250, y: 250, button: 'right', clickCount: 1 });
  win.webContents.sendInputEvent({ type: 'mouseUp', x: 250, y: 250, button: 'right', clickCount: 1 });
  win.webContents.sendInputEvent({ type: 'contextMenu', x: 250, y: 250 });
  await new Promise((r) => setTimeout(r, 150));

  console.log('Total DOM events received:', events.length);
  const eventTypes = events.map(e => e.type);
  console.log('Received types:', eventTypes);

  const hasMouseDown = eventTypes.includes('mousedown');
  const hasMouseUp = eventTypes.includes('mouseup');
  const hasContextMenu = eventTypes.includes('contextmenu');

  console.log('mousedown received:', hasMouseDown);
  console.log('mouseup received:', hasMouseUp);
  console.log('contextmenu received:', hasContextMenu);

  win.destroy();
  app.quit();
});
