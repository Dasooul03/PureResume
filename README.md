# PureResume

> 纯白极简、本地优先的 Markdown 简历编辑器。

PureResume 将一份 Markdown 简历实时渲染为可投递的 A4 预览，并可通过浏览器的“另存为 PDF”导出。简历内容只保存在当前浏览器，不需要账号，也不会上传到服务器。

![License](https://img.shields.io/badge/license-MIT-171717.svg)
![Local first](https://img.shields.io/badge/storage-local--first-171717.svg)

## 特性

- 实时 Markdown → A4 简历预览，输入后自动保存到 `localStorage`
- 三套纯白模板：经典单栏、紧凑双栏、现代留白
- Markdown 行内格式：加粗、斜体、删除线、行内代码、链接与直接 URL
- GFM 表格与 Typora 简写分隔行：`|---|---|`、`|-|-|`
- 通用日期行：标题在左、日期固定右对齐，适用于教育、项目和实习等任何章节
- 导入 `.md`、`.txt`、`.docx`；导出 Markdown；通过浏览器打印窗口保存 PDF
- 纯色界面与纸张：不使用渐变、纹理、阴影、滤镜或动画特效

## 快速开始

```bash
npm install
npm run dev
```

打开 [http://localhost:4173](http://localhost:4173)。`npm run dev` 会先构建 `dist/`，再启动本地静态预览服务。

生产构建：

```bash
npm run build
```

## Markdown 写法

### 基础结构

```md
# 姓名

城市 · 手机 · 邮箱 · 主页链接

## 工作经历

### 公司｜职位｜时间
- 负责的工作或成果

## 项目经历

### 项目名称
- 项目说明
```

`#` 是姓名，`##` 是章节，`###` 是经历/项目标题，`-` 是要点。

### 标题与日期右对齐

使用“加粗标题 + 日期范围 + 详情”的单行格式；中间的空白只作分隔，日期位置由模板固定，不依赖空格数量：

```md
**武汉东湖学院**　2020-07 ~ 2024-07　计算机科学学院 | 软件工程 | 本科

**PureResume**　2026-07 ~ 至今　Markdown 简历编辑器

**成都欧督系统科技有限公司**　2026-03 ~ 2026-06　Agent 实习生
```

渲染结果为标题与日期同一行、左右对齐，详情显示在下一行。这个格式可以放在教育、项目、实习或任意普通章节中。

### 表格

支持标准 GFM 表格以及 Typora 允许的紧凑分隔行：

```md
| 公司 | 岗位 | 时间 |
|-|-|-|
| 成都欧督系统科技有限公司 | Agent 实习生 | 2026.03 ~ 2026.06 |
```

### PDF 导出

点击“导出 PDF”后，在浏览器系统打印窗口选择“另存为 PDF”。导出复用当前模板和 A4 预览样式。

## 数据与边界

- 内容仅保存在当前浏览器的 `localStorage`；刷新后可恢复草稿。
- `.docx` 导入会在浏览器中提取文本并转换为 Markdown；不支持旧 `.doc`、扫描 PDF 或 OCR。
- PDF 是投递格式，Markdown 是可下载、可再次导入的源文件。
- 当前版本不包含登录、云同步、多人协作、自由拖拽排版或 AI 内容生成。

## 相关开源项目

PureResume 的实现独立于以下项目，但在产品能力取舍上参考了它们公开呈现的思路：

- [JOYCEQL/magic-resume](https://github.com/JOYCEQL/magic-resume)：实时预览、本地保存与 PDF 输出的编辑体验。
- [vangelov/devresume](https://github.com/vangelov/devresume)：无登录、离线优先、文本源驱动的简历工作流。
- [NxResume/DualMode-ResumeEditor](https://github.com/NxResume/DualMode-ResumeEditor)：Markdown 编辑、多页预览与导出能力的产品方向。

PureResume 选择 Markdown 而非 YAML 作为用户源文件，并聚焦纯白、可稳定打印的本地简历编辑体验；未复制上述项目的代码、设计资源或品牌内容。

## License

[MIT](./LICENSE)
