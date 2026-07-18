# PureResume

纯白极简的简历编辑器。可直接在线使用，也可下载到本地运行；以 Markdown 编写简历，实时预览为 A4 页面，并通过浏览器打印窗口导出 PDF。

在线使用：[https://dasooul03.github.io/PureResume/](https://dasooul03.github.io/PureResume/)

## 功能

- Markdown 实时编辑与 A4 简历预览
- 经典单栏、紧凑双栏、现代留白三套纯白模板
- 标题与日期自动左右对齐，可用于教育、项目和实习经历
- 支持 GFM 表格、加粗、斜体、删除线、行内代码和链接
- 自动保存浏览器本地草稿
- 支持 MD、TXT、DOCX 导入与 Markdown 下载
- 通过浏览器打印窗口导出 PDF
- 不要求账号，不上传简历内容

## 本地运行

```bash
git clone https://github.com/Dasooul03/PureResume.git
cd PureResume
npm install
npm run dev
```

打开 [http://localhost:4173](http://localhost:4173)。

## Markdown 格式

```md
# 姓名

城市 · 手机 · 邮箱 · 主页链接

## 教育经历

**北辰大学**　2020-09 ~ 2024-06　信息工程学院 | 软件工程 | 本科

## 项目经历

**项目名称**　2025-01 ~ 至今　项目简介
- 项目职责或成果
```

使用“加粗标题 + 日期范围 + 详情”的单行格式时，标题会显示在左侧、日期固定右对齐、详情显示在下一行；位置不依赖空格数量。

表格支持标准 GFM 和 Typora 简写分隔行：

```md
| 公司 | 岗位 | 时间 |
|-|-|-|
| 星轨科技 | 前端工程实习生 | 2025.07 ~ 2025.10 |
```

## 构建与部署

```bash
npm run build
```

构建产物位于 `dist/`，可部署到任意静态网站服务。仓库已配置 GitHub Pages，推送至 `master` 后会自动更新线上站点。

## License

[MIT](./LICENSE)
