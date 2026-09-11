import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import extract from 'extract-zip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const electronDir = path.resolve(__dirname, '../node_modules/electron');
const zipFile = path.join(electronDir, 'electron.zip');
const distDir = path.join(electronDir, 'dist');

async function run() {
  if (!fs.existsSync(zipFile)) {
    console.error('Zip file not found:', zipFile);
    return;
  }
  console.log('Extracting Electron zip to', distDir);
  await extract(zipFile, { dir: distDir });
  fs.writeFileSync(path.join(electronDir, 'path.txt'), 'electron.exe');
  fs.writeFileSync(path.join(distDir, 'version'), '34.5.8');
  console.log('Electron successfully installed and configured!');
}

run().catch((err) => {
  console.error('Extraction error:', err);
  process.exit(1);
});
