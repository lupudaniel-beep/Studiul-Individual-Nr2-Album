import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('serverul livrează aplicația, dar nu fișierele private sau metode de scriere', async t => {
  const child = spawn(process.execPath, [fileURLToPath(new URL('../server.mjs', import.meta.url))], { env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => child.kill());
  const base = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server startup timed out')), 5000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.stdout.on('data', data => { const match = String(data).match(/http:\/\/127\.0\.0\.1:\d+/); if (match) { clearTimeout(timer); resolve(match[0]); } });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Server exited: ${code}`)); });
  });
  for (const path of ['/', '/app.js', '/model.js', '/style.css']) {
    const response = await fetch(base + path); assert.equal(response.status, 200, path); assert.ok((await response.text()).length > 10);
  }
  for (const path of ['/.git/config', '/package.json', '/README.md', '/missing']) assert.equal((await fetch(base + path)).status, 404, path);
  assert.equal((await fetch(base + '/', { method: 'POST' })).status, 404);
  const head = await fetch(base + '/', { method: 'HEAD' }); assert.equal(head.status, 200); assert.equal(await head.text(), '');
});
