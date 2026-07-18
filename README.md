<div align="center">

# PureResume

![License](https://img.shields.io/badge/License-MIT-171717.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)
![Local first](https://img.shields.io/badge/Storage-Local--first-171717.svg)

纯白极简的简历编辑器，可下载到本地使用，也可作为静态网页部署后直接在线使用。

</div>

PureResume 让你使用 Markdown 编写简历，并实时预览为纯白 A4 简历。内容默认只保存在浏览器本地；完成后可下载 Markdown，或通过浏览器“另存为 PDF”直接投递。

## ✨ Features

- 📝 Markdown 实时编辑与 A4 简历预览
- 📄 经典单栏、紧凑双栏、现代留白三套纯白模板
- 📅 通用标题/日期格式：日期自动右对齐，适用于教育、项目、实习等任意章节
- 📊 支持 GFM 表格与 Typora 简写表格分隔行
- ✍️ 支持加粗、斜体、删除线、行内代码、链接和直接 URL
- 💾 自动保存到浏览器本地，刷新后可恢复草稿
- 📥 导入 Markdown、TXT、DOCX；下载 Markdown 源文件
- 📤 通过浏览器打印窗口导出 PDF
- 📱 响应式布局，窄屏可切换编辑与预览
- 🔒 不要求注册，不上传简历内容

## 🧩 Markdown Format

基础结构：

```md
# 姓名

城市 · 手机 · 邮箱 · 主页链接

## 工作经历

### 公司｜职位｜时间
- 负责的工作或成果
```

日期右对齐格式可用于任何章节：

```md
**武汉东湖学院**　2020-07 ~ 2024-07　计算机科学学院 | 软件工程 | 本科

**PureResume**　2026-07 ~ 至今　Markdown 简历编辑器

**成都欧督系统科技有限公司**　2026-03 ~ 2026-06　Agent 实习生
```

模板会将标题置于左侧、日期固定在右侧、详情显示在下一行；日期的位置不依赖空格数量。

表格支持标准 GFM 和 Typora 简写：

```md
| 公司 | 岗位 | 时间 |
|-|-|-|
| 成都欧督系统科技有限公司 | Agent 实习生 | 2026.03 ~ 2026.06 |
```

## 🛠️ Tech Stack

- TypeScript
- Vite
- 原生 DOM 与 Browser APIs
- 纯 CSS A4 打印样式
- localStorage

## 🚀 Quick Start

1. Clone the project

```bash
git clone https://github.com/Dasooul03/PureResume.git
cd PureResume
```

2. Install dependencies

```bash
npm install
```

3. Start local preview

```bash
npm run dev
```

4. Open [http://localhost:4173](http://localhost:4173)

## 📦 Build & Online Use

```bash
npm run build
```

构建产物位于 `dist/`。将该目录部署到 GitHub Pages、Vercel、Netlify 或任意静态网站服务后，即可直接在线使用；无需后端、数据库或账号系统。

## 🗺️ Roadmap

- [x] Markdown 实时预览
- [x] 三套纯白模板
- [x] 本地自动保存
- [x] MD / TXT / DOCX 导入
- [x] PDF 打印导出
- [x] GFM / Typora 表格支持
- [ ] 更多简历模板
- [ ] 自定义字体与字号
- [ ] 多语言界面
- [ ] 在线简历托管

## 🙏 Inspiration

PureResume 的 README 结构和产品能力取舍参考了 [Magic Resume](https://github.com/JOYCEQL/magic-resume) 的公开介绍，尤其是实时预览、本地保存、PDF 输出与模板能力的呈现方式。PureResume 的代码、视觉和 Markdown 规则为独立实现，未复制其代码或资源。

## 📄 License

[MIT](./LICENSE)
