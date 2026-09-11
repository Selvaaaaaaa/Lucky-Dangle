import * as esbuild from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

async function buildElectron() {
  console.log('Building Electron main and preload...');

  // Build main process
  await esbuild.build({
    entryPoints: [resolve(rootDir, 'src/main/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: resolve(rootDir, 'dist-electron/main/index.js'),
    external: ['electron'],
    sourcemap: true,
    format: 'cjs',
    alias: {
      '@': resolve(rootDir, 'src')
    }
  });

  // Build preload script
  await esbuild.build({
    entryPoints: [resolve(rootDir, 'src/preload/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: resolve(rootDir, 'dist-electron/preload/index.js'),
    external: ['electron'],
    sourcemap: true,
    format: 'cjs',
    alias: {
      '@': resolve(rootDir, 'src')
    }
  });

  console.log('Electron main & preload build complete.');
}

buildElectron().catch((err) => {
  console.error(err);
  process.exit(1);
});
