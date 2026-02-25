import { spawn } from 'node:child_process';

const port = Number(process.env.AI_RUN_HUB_PORT || 18777);
const url = `http://127.0.0.1:${port}`;

const daemon = spawn(process.execPath, ['src/cli.js', '--daemon', '--panel-port', String(port)], {
  detached: true,
  stdio: 'ignore',
  cwd: process.cwd(),
  env: process.env
});
daemon.unref();

const platform = process.platform;
if (platform === 'darwin') {
  spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
} else if (platform === 'win32') {
  spawn('cmd', ['/c', 'start', url], { detached: true, stdio: 'ignore' }).unref();
} else {
  spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
}

console.log(`[ai-run] desktop panel opening: ${url}`);
console.log('[ai-run] daemon started in background (local-only, read-only).');
