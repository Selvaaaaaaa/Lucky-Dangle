import { app, screen } from 'electron';

app.whenReady().then(() => {
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();
  console.log('Displays found:', displays.length);
  displays.forEach((d, i) => {
    console.log(`Display ${i}: id=${d.id}, isPrimary=${d.id === primary.id}`);
    console.log(`  bounds: ${JSON.stringify(d.bounds)}`);
    console.log(`  workArea: ${JSON.stringify(d.workArea)}`);
    console.log(`  scaleFactor: ${d.scaleFactor}`);
  });
  app.quit();
});
