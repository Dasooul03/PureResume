# PureResume

纯白极简、本地优先的 Markdown 简历编辑器。编辑 Markdown 后可即时预览 A4 简历，并通过浏览器打印功能保存为 PDF。

## 功能

- 经典单栏、紧凑双栏、现代留白三套纯白模板
- Markdown 实时渲染、本地自动保存、MD 下载
- 导入 MD、TXT 和 DOCX（浏览器端读取文本）
- A4 打印样式：点击“导出 PDF”后在浏览器系统打印窗口选择“另存为 PDF”

## 本地运行

```bash
npm install
npm run dev
```

## Markdown 约定

`#` 表示姓名，`##` 表示章节，`###` 表示经历或项目标题，`-` 表示要点。

PureResume 不上传简历内容；草稿仅存于当前浏览器的 localStorage。
