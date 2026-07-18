import { createReadStream, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join } from 'node:path'

const root = process.argv.includes('--dist') ? 'dist' : 'src'
const port = Number(process.env.PORT || 4173)
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.ts': 'application/typescript; charset=utf-8', '.css': 'text/css; charset=utf-8' }
createServer((req, res) => {
  const pathname = req.url === '/' ? 'index.html' : req.url.slice(1)
  const file = pathname === 'index.html' ? (root === 'dist' ? 'dist/index.html' : 'index.html') : join(root, pathname)
  if (!existsSync(file)) { res.writeHead(404); res.end('Not found'); return }
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
  createReadStream(file).pipe(res)
}).listen(port, () => console.log(`PureResume preview: http://localhost:${port}`))
