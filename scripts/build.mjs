import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import ts from 'typescript'

await rm('dist', { recursive: true, force: true })
await mkdir('dist', { recursive: true })
const source = await readFile('src/main.ts', 'utf8')
const output = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText.replace(/^import ['"]\.\/style\.css['"];?\s*/m, '')
await Promise.all([
  writeFile('dist/main.js', output),
  cp('src/style.css', 'dist/style.css'),
  writeFile('dist/index.html', (await readFile('index.html', 'utf8')).replace('/src/main.ts', './main.js').replace('</head>', '    <link rel="stylesheet" href="./style.css" />\n  </head>')),
])
console.log('Built PureResume to dist/')
