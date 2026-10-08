// Serves legacy/index.html (the pre-refactor app) for side-by-side tests.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const html = readFileSync('legacy/index.html');
createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html); })
  .listen(Number(process.env.PORT || 4174), '127.0.0.1');
