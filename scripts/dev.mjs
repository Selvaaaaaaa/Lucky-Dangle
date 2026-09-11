import { createServer } from 'vite';
import * as esbuild from 'esbuild';
import { spawn } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import electron from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

async function startDev() {
  // 1. Start Vite dev server
  const viteServer = await createServer({
    configFile: resolve(rootDir, 'vite.config.ts'),
    mode: 'development'
  });
  await viteServer.listen();
  const address = viteServer.httpServer?.address();
  const port = typeof address === 'object' && address ? address.port : 5173;
  const devServerUrl = `http://localhost:${port}`;
  console.log(`Vite Dev Server running at: ${devServerUrl}`);

  // 2. Build main & preload scripts
  const buildConfig = (entry, outfile) => ({
    entryPoints: [entry],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile,
    external: ['electron'],
    sourcemap: true,
    format: 'cjs',
    alias: {
      '@': resolve(rootDir, 'src')
    },
    define: {
      'process.env.VITE_DEV_SERVER_URL': JSON.stringify(devServerUrl)
    }
  });

  console.log('Compiling Electron scripts for development...');
  await esbuild.build(buildConfig(
    resolve(rootDir, 'src/main/index.ts'),
    resolve(rootDir, 'dist-electron/main/index.js')
  ));
  await esbuild.build(buildConfig(
    resolve(rootDir, 'src/preload/index.ts'),
    resolve(rootDir, 'dist-electron/preload/index.js')
  ));

  // 3. Spawn Electron process
  console.log('Spawning Electron process...');
  const electronProcess = spawn(electron, [resolve(rootDir, 'dist-electron/main/index.js')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: devServerUrl,
      NODE_ENV: 'development'
    }
  });

  electronProcess.on('close', () => {
    viteServer.close();
    process.exit();
  });
}

startDev().catch((err) => {
  console.error(err);
  process.exit(1);
});
