import './style.css'

type TemplateId = 'classic' | 'compact' | 'modern'

type Resume = {
  name: string
  contact: string[]
  summary: string
  sections: Array<{ title: string; items: Array<{ heading: string; bullets: string[]; text: string[] }> }>
}

const SAMPLE = `# 林墨

北京 · 138 0000 0000 · linmo@example.com · github.com/linmo

## 个人简介
五年前端开发经验，专注于 React、设计系统与高质量业务交付。擅长把复杂流程转化为清晰、稳定且可维护的产品体验。

## 工作经历

### 星云科技｜高级前端工程师｜2023.06 - 至今
- 主导招聘平台的简历编辑与预览模块，缩短内容录入时间。
- 建立组件规范和可访问性检查流程，提升多端一致性。

### 青山网络｜前端工程师｜2020.07 - 2023.05
- 负责企业后台、数据看板和权限系统的迭代交付。
- 与设计和产品协作，将核心页面加载时间降低 35%。

## 项目经历

### PureResume｜本地简历编辑器｜2026
- 以 Markdown 作为内容源，支持实时 A4 预览和 PDF 输出。
- 支持经典单栏、紧凑双栏和现代留白三套纯白模板。

## 技能

- React / TypeScript / Vite
- 设计系统 / CSS / 可访问性
- Git / GitHub / Figma

## 教育经历

### 华东大学｜计算机科学与技术｜2016 - 2020
- 本科`

const STORAGE_KEY = 'pureresume-document-v1'
let activeTemplate: TemplateId = 'classic'
let photo: string = ''
let debounceTimer = 0

const app = document.querySelector<HTMLDivElement>('#app')!

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!)
}

function inline(value: string) {
  const tokens: string[] = []
  const stash = (html: string) => {
    const marker = `@@PURE_RESUME_TOKEN_${tokens.length}@@`
    tokens.push(html)
    return marker
  }
  let html = escapeHtml(value)

  // Protect elements that must not receive further Markdown substitutions.
  html = html.replace(/`([^`]+)`/g, (_, code: string) => stash(`<code>${code}</code>`))
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, label: string, url: string) =>
    stash(`<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`),
  )
  html = html.replace(/(https?:\/\/[^\s<]+)/g, (_, url: string) =>
    stash(`<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`),
  )

  html = html
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/~~([^~]+)~~/g, '<s>$1</s>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/(^|[^\w])_([^_]+)_/g, '$1<em>$2</em>')

  const restored = tokens.reduce((result, token, index) => result.replace(`@@PURE_RESUME_TOKEN_${index}@@`, token), html)
  // HTML normally collapses whitespace. Preserve user-authored spacing everywhere,
  // including between formatted spans such as `**学校**    时间`.
  return restored
    .replace(/\t/g, '<span class="markdown-tab">    </span>')
    .replace(/ {2,}/g, (spaces) => `<span class="markdown-spaces">${spaces}</span>`)
}

function parseResume(markdown: string): Resume {
  const lines = markdown.replace(/\r/g, '').split('\n')
  const result: Resume = { name: '未命名简历', contact: [], summary: '', sections: [] }
  let section: Resume['sections'][number] | null = null
  let item: Resume['sections'][number]['items'][number] | null = null
  let state: 'contact' | 'summary' | 'section' = 'contact'

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      result.name = line.slice(2).trim() || '未命名简历'
      state = 'contact'
      continue
    }
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim()
      if (!title) throw new Error('二级标题缺少名称')
      section = { title, items: [] }
      result.sections.push(section)
      item = null
      state = title === '个人简介' || title.toLowerCase() === 'summary' ? 'summary' : 'section'
      continue
    }
    if (line.startsWith('### ')) {
      if (!section) throw new Error('三级标题必须位于一个章节内')
      const heading = line.slice(4).trim()
      if (!heading) throw new Error('三级标题缺少内容')
      item = { heading, bullets: [], text: [] }
      section.items.push(item)
      state = 'section'
      continue
    }
    if (state === 'contact') result.contact.push(line)
    else if (state === 'summary') result.summary += `${result.summary ? ' ' : ''}${line.replace(/^-\s*/, '')}`
    else if (item && line.startsWith('- ')) item.bullets.push(line.slice(2))
    else if (item) item.text.push(line)
    else if (section) {
      item = { heading: '', bullets: line.startsWith('- ') ? [line.slice(2)] : [], text: line.startsWith('- ') ? [] : [line] }
      section.items.push(item)
    }
  }
  return result
}

function isSideSection(title: string) {
  return /技能|教育|证书|语言|Skill|Education|Certificate|Language/i.test(title)
}

function tableCells(line: string) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim())
}

function isTableDivider(line: string) {
  // Typora also accepts a compact `|-|-|` divider, so accept one or more dashes.
  return /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/.test(line)
}

function datedLine(line: string) {
  const dateRange = '(?:\\d{4}[./-]\\d{1,2}\\s*(?:~|至|—|-)\\s*(?:\\d{4}[./-]\\d{1,2}|至今))'
  const match = line.match(new RegExp(`^(\\*\\*.+?\\*\\*)[\\s\\u3000]+(${dateRange})(?:[\\s\\u3000]+(.+))?$`))
  if (!match) return null
  return { title: match[1], date: match[2], detail: match[3] || '' }
}

function textBlocks(lines: string[]) {
  const blocks: string[] = []
  for (let index = 0; index < lines.length; index++) {
    const header = lines[index]
    const divider = lines[index + 1]
    if (/^-{3,}$/.test(header)) {
      blocks.push('<hr class="resume-rule">')
      continue
    }
    const dated = datedLine(header)
    if (dated) {
      blocks.push(`<div class="dated-line"><span class="dated-title">${inline(dated.title)}</span><span class="dated-date">${inline(dated.date)}</span></div>${dated.detail ? `<p class="dated-detail">${inline(dated.detail)}</p>` : ''}`)
      continue
    }
    if (header.includes('|') && divider && isTableDivider(divider)) {
      const headings = tableCells(header)
      const rules = tableCells(divider)
      const alignments = rules.map((rule) => rule.startsWith(':') && rule.endsWith(':') ? 'center' : rule.endsWith(':') ? 'right' : rule.startsWith(':') ? 'left' : '')
      const rows: string[][] = []
      index += 2
      while (index < lines.length && lines[index].includes('|')) {
        rows.push(tableCells(lines[index]))
        index++
      }
      index--
      blocks.push(`<div class="table-wrap"><table><thead><tr>${headings.map((cell, cellIndex) => `<th class="align-${alignments[cellIndex]}">${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${headings.map((_, cellIndex) => `<td class="align-${alignments[cellIndex]}">${inline(row[cellIndex] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`)
      continue
    }
    blocks.push(`<p>${inline(header)}</p>`)
  }
  return blocks.join('')
}

function itemHtml(item: Resume['sections'][number]['items'][number]) {
  return `<article class="resume-item">
    ${item.heading ? `<h4>${inline(item.heading)}</h4>` : ''}
    ${textBlocks(item.text)}
    ${item.bullets.length ? `<ul>${item.bullets.map((bullet) => `<li>${inline(bullet)}</li>`).join('')}</ul>` : ''}
  </article>`
}

function sectionHtml(section: Resume['sections'][number]) {
  const body = section.items.map(itemHtml).join('')
  return `<section class="resume-section"><h3>${inline(section.title)}</h3>${body || '<p class="empty-section">待补充</p>'}</section>`
}

function renderDocument(markdown: string, photoParam: string = photo) {
  const resume = parseResume(markdown)
  const summary = resume.summary ? `<section class="resume-section summary"><h3>个人简介</h3><p>${inline(resume.summary)}</p></section>` : ''
  const sections = resume.sections.filter((section) => !/个人简介|summary/i.test(section.title))
  const photoTag = photoParam ? `<img class="resume-photo" src="${escapeHtml(photoParam)}" alt="头像">` : ''
  const headerWithPhoto = `<header class="resume-header"><div class="header-text"><h1>${inline(resume.name)}</h1><p>${resume.contact.map(inline).join('<span class="dot">·</span>')}</p></div>${photoTag}</header>`
  if (activeTemplate === 'compact') {
    const left = sections.filter((section) => isSideSection(section.title)).map(sectionHtml).join('')
    const right = sections.filter((section) => !isSideSection(section.title)).map(sectionHtml).join('')
    return `<div class="resume-paper compact-paper">${headerWithPhoto}<div class="two-column"><aside>${left}</aside><main>${summary}${right}</main></div><footer>PureResume · <span class="page-number"></span></footer></div>`
  }
  return `<div class="resume-paper ${activeTemplate === 'modern' ? 'modern-paper' : ''}">${headerWithPhoto}${summary}${sections.map(sectionHtml).join('')}<footer>PureResume · <span class="page-number"></span></footer></div>`
}

function sizeHeaderPhotos() {
  document.querySelectorAll<HTMLElement>('.resume-header').forEach((header) => {
    const text = header.querySelector<HTMLElement>('.header-text')
    const image = header.querySelector<HTMLImageElement>('.resume-photo')
    if (!text || !image) return
    const size = Math.ceil(text.getBoundingClientRect().height)
    image.style.width = `${size}px`
    image.style.height = `${size}px`
  })
}

function updatePreview(markdown: string, persist = true) {
  const preview = document.querySelector<HTMLDivElement>('#preview')!
  const error = document.querySelector<HTMLDivElement>('#parse-error')!
  try {
    const rendered = renderDocument(markdown, photo)
    preview.innerHTML = rendered
    window.requestAnimationFrame(sizeHeaderPhotos)
    error.textContent = ''
    error.hidden = true
    if (persist) localStorage.setItem(STORAGE_KEY, JSON.stringify({ markdown, activeTemplate, photo }))
  } catch (reason) {
    error.textContent = `暂未渲染：${reason instanceof Error ? reason.message : 'Markdown 格式错误'}。预览保留上一次有效内容。`
    error.hidden = false
  }
}

function downloadMarkdown() {
  const editor = document.querySelector<HTMLTextAreaElement>('#editor')!
  const url = URL.createObjectURL(new Blob([editor.value], { type: 'text/markdown;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'PureResume.md'
  link.click()
  URL.revokeObjectURL(url)
}

async function readDocx(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const view = new DataView(bytes.buffer)
  for (let offset = bytes.length - 22; offset >= 0; offset--) {
    if (view.getUint32(offset, true) !== 0x06054b50) continue
    const centralOffset = view.getUint32(offset + 16, true)
    const count = view.getUint16(offset + 10, true)
    let cursor = centralOffset
    for (let index = 0; index < count; index++) {
      if (view.getUint32(cursor, true) !== 0x02014b50) break
      const method = view.getUint16(cursor + 10, true)
      const compressedSize = view.getUint32(cursor + 20, true)
      const nameSize = view.getUint16(cursor + 28, true)
      const extraSize = view.getUint16(cursor + 30, true)
      const commentSize = view.getUint16(cursor + 32, true)
      const localOffset = view.getUint32(cursor + 42, true)
      const name = new TextDecoder().decode(bytes.slice(cursor + 46, cursor + 46 + nameSize))
      if (name === 'word/document.xml') {
        const localNameSize = view.getUint16(localOffset + 26, true)
        const localExtraSize = view.getUint16(localOffset + 28, true)
        const data = bytes.slice(localOffset + 30 + localNameSize + localExtraSize, localOffset + 30 + localNameSize + localExtraSize + compressedSize)
        const xmlBytes = method === 0 ? data : new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())
        const xml = new TextDecoder().decode(xmlBytes)
        const paragraphs = [...xml.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)].map((match) => {
          const text = [...match[0].matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((part) => part[1]).join('')
          return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').trim()
        }).filter(Boolean)
        return paragraphs.map((paragraph, index) => index === 0 ? `# ${paragraph}` : paragraph).join('\n\n')
      }
      cursor += 46 + nameSize + extraSize + commentSize
    }
  }
  throw new Error('无法读取 DOCX 文档内容')
}

async function importFile(file: File) {
  const editor = document.querySelector<HTMLTextAreaElement>('#editor')!
  let content = ''
  if (/\.docx$/i.test(file.name)) content = await readDocx(file)
  else content = await file.text()
  const dialog = document.querySelector<HTMLDialogElement>('#import-dialog')!
  const importText = document.querySelector<HTMLTextAreaElement>('#import-text')!
  importText.value = content
  dialog.showModal()
  document.querySelector<HTMLButtonElement>('#apply-import')!.onclick = () => {
    editor.value = importText.value
    updatePreview(editor.value)
    dialog.close()
  }
}

function importPhoto(file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const maxSize = 320
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      photo = canvas.toDataURL('image/jpeg', 0.85)
      const editor = document.querySelector<HTMLTextAreaElement>('#editor')!
      updatePreview(editor.value)
      document.querySelector<HTMLButtonElement>('#remove-photo')!.hidden = false
    }
    img.onerror = () => window.alert('头像图片解析失败，请换一张图片重试。')
    img.src = reader.result as string
  }
  reader.onerror = () => window.alert('头像读取失败，请换一张图片重试。')
  reader.readAsDataURL(file)
}

function setup() {
  const saved = localStorage.getItem(STORAGE_KEY)
  const initial = saved ? JSON.parse(saved) : { markdown: SAMPLE, activeTemplate: 'classic', photo: '' }
  activeTemplate = initial.activeTemplate as TemplateId
  photo = initial.photo || ''
  app.innerHTML = `
  <header class="app-header"><div><span class="brand-mark">P</span><strong>PureResume</strong><small>纯白极简简历编辑器</small></div><div class="header-actions"><button id="download-md">下载 Markdown</button><button id="export-pdf" class="primary">导出 PDF</button></div></header>
  <main class="workspace">
    <aside class="sidebar"><div class="sidebar-title">简历设置</div><button id="new-resume">新建空白简历</button><label class="file-button">导入 MD / TXT / DOCX<input id="import-file" type="file" accept=".md,.txt,.docx" hidden></label><hr><div class="sidebar-title">人像照片</div><label class="file-button">导入头像<input id="import-photo" type="file" accept="image/*" hidden></label><button id="remove-photo" hidden>移除头像</button><hr><div class="sidebar-title">模板</div><div class="templates">
      <button data-template="classic" class="template-choice"><b>经典单栏</b><span>正式与清晰</span></button>
      <button data-template="compact" class="template-choice"><b>紧凑双栏</b><span>技术与项目</span></button>
      <button data-template="modern" class="template-choice"><b>现代留白</b><span>简洁与国际化</span></button>
    </div><hr><div class="sidebar-title">章节</div><nav><a href="#editor">Markdown 源文件</a><a href="#preview">实时 A4 预览</a></nav><p class="local-note">仅保存于当前浏览器。</p></aside>
    <section class="editor-panel"><div class="panel-title"><span>Markdown</span><span class="status-dot">自动保存</span></div><textarea id="editor" spellcheck="false" aria-label="Markdown 简历编辑器"></textarea><div id="parse-error" class="parse-error" hidden></div><div class="editor-help"><b>格式提示</b><code># 姓名</code><code>## 工作经历</code><code>### 公司｜职位｜时间</code><code>- 工作描述</code></div></section>
    <section class="preview-panel"><div class="panel-title"><span>实时预览</span><span>A4 · ${activeTemplate === 'classic' ? '经典单栏' : activeTemplate === 'compact' ? '紧凑双栏' : '现代留白'}</span></div><div id="preview" class="preview-canvas"></div></section>
  </main>
  <dialog id="import-dialog"><form method="dialog"><h2>确认导入内容</h2><p>导入内容将转换为 Markdown；确认后会替换当前简历。</p><textarea id="import-text"></textarea><menu><button value="cancel">取消</button><button id="apply-import" value="default" class="primary">替换当前简历</button></menu></form></dialog>`
  const editor = document.querySelector<HTMLTextAreaElement>('#editor')!
  editor.value = initial.markdown
  updatePreview(editor.value, false)
  document.querySelectorAll<HTMLButtonElement>('[data-template]').forEach((button) => {
    button.classList.toggle('selected', button.dataset.template === activeTemplate)
    button.addEventListener('click', () => {
      activeTemplate = button.dataset.template as TemplateId
      document.querySelectorAll<HTMLButtonElement>('[data-template]').forEach((choice) => choice.classList.toggle('selected', choice === button))
      updatePreview(editor.value)
      document.querySelector('.preview-panel .panel-title span:last-child')!.textContent = `A4 · ${button.querySelector('b')!.textContent}`
    })
  })
  editor.addEventListener('input', () => {
    window.clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(() => updatePreview(editor.value), 180)
  })
  document.querySelector('#download-md')!.addEventListener('click', downloadMarkdown)
  document.querySelector('#export-pdf')!.addEventListener('click', () => window.print())
  document.querySelector('#new-resume')!.addEventListener('click', () => { editor.value = '# 姓名\n\n城市 · 电话 · 邮箱\n\n## 个人简介\n\n## 工作经历'; updatePreview(editor.value) })
  document.querySelector<HTMLInputElement>('#import-file')!.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    try { await importFile(file) } catch (error) { window.alert(`导入失败：${error instanceof Error ? error.message : '未知错误'}`) }
  })
  const importPhotoInput = document.querySelector<HTMLInputElement>('#import-photo')!
  importPhotoInput.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    importPhoto(file)
    ;(event.target as HTMLInputElement).value = ''
  })
  const removePhotoButton = document.querySelector<HTMLButtonElement>('#remove-photo')!
  if (photo) removePhotoButton.hidden = false
  removePhotoButton.addEventListener('click', () => {
    photo = ''
    updatePreview(editor.value)
    removePhotoButton.hidden = true
  })
}

setup()
