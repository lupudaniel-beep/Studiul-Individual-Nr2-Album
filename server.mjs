import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([['/', ['index.html', 'text/html']], ['/app.js', ['app.js', 'text/javascript']], ['/model.js', ['model.js', 'text/javascript']], ['/style.css', ['style.css', 'text/css']]]);
const server = createServer(async (req, res) => {
  const resource = files.get(new URL(req.url, 'http://localhost').pathname);
  if (!resource || !['GET', 'HEAD'].includes(req.method)) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const body = await readFile(new URL(resource[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': resource[1] + '; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(500); res.end('Unable to load application'); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Albumia: http://127.0.0.1:${server.address().port}`));
