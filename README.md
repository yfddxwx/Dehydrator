<div align="center">

# ◈ 思绪脱水与重构器 (Thought Dehydrator.app)

**致敬 90 年代 NeXTSTEP 复古美学的长文思绪“极度脱水”与结构化重构工具**

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](./LICENSE)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Native_Synthesis-27ae60.svg?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Client_Side-blue.svg?style=flat-square)](#-隐私与安全声明)

[English](./README_EN.md) | **简体中文**

</div>

---

## 💡 为什么需要「思绪脱水器」？

在日常工作与技术思考中，我们经常写下冗长杂乱的会议纪要、充满情绪拉扯的随手记或发散的代码架构反思。这些内容往往充满了口水词、情绪修饰语与犹豫不决的废话。

**思绪脱水与重构器** 追求极限的信息密度。无论丢给它几百字多么混乱的随笔，它都会像一台冷酷的离心脱水机，将其浓缩为三行骨架：

1. **【核心实体与动作】**（严格不超过 20 字）
2. **【潜在矛盾/关键卡点】**（严格不超过 20 字）
3. **【下一步动作】**（严格不超过 15 字）

---

## ✨ 核心特性

### 1. 经典 90 年代 NeXTSTEP / Classic Gray 复古美学
- **3D 浮雕灰阶质感**：纯正经典灰色基调（`#c0c0c0`），精细的双层 Inset / Outset Bevel 立体凸凹边框。
- **NeXT 经典黑底标题栏**：加粗等宽字体，三维内凹控制方块按钮（关闭 `✕` 与折叠 `▼`）。
- **微型荧光点阵进度条**：`[■■■■■■□□□□]` 配合晶体管状态 LED，实时呈现处理脉冲。

### 2. 纯代码 Web Audio API 声音合成（严禁且零外链音频）
- **脱水启动**：触发快速升调的 6 阶电子脉冲序列（方波与正弦波交错琶音 Arpeggio）。
- **脱水完成**：基于输出文本特征与字数哈希（Hash Code），实时计算并弹奏清脆泛音和弦（C Maj9 / F Lydian / G Sus4 等），并通过反馈延迟网络（Feedback Delay Line）呈现空灵的晶体管风铃余音（Chime）。
- **声学指纹**：每个脱水成果卡片自动附带独一无二的声学指纹徽章（如 `#A9F1`），支持一键静音。

### 3. 灵活的双脱水引擎（离线本地规则 + 多大模型 BYOK）
- **本地启发式规则引擎（零网络、零配置）**：
  - 内置基于标点断句、语气修饰词清洗、主谓宾结构过滤与转折词权重的本地提取算法。
  - 即使断网、无 API Key，也能秒级提取高质量三段式结果。
- **主流大模型 API 原生直连（BYOK 模式）**：
  - 支持 Google Gemini、DeepSeek、Moonshot Kimi、OpenAI 等。
  - 支持自定义 API Base URL 与模型名称。
  - **无缝平滑降级**：当 API 遇到欠费、网络中断或 Key 错误时，自动降级至本地规则引擎并弹出清晰告警，保证任务永不崩溃。

### 4. 浮动卡片抽屉与 Markdown 极速导出
- **本地卡片架 (Card Shelf)**：右侧滑入式复古抽屉，自动持久化存储至浏览器 LocalStorage，支持翻阅历史、载入工作台与删除管理。
- **一键导出**：一键将当前卡片复制为干净的标准 Markdown 片段，即贴即用。

---

## 🔒 隐私与安全声明

- **零后端中转**：本项目为 100% 纯前端单页应用（SPA），没有自己的后端服务器。
- **Key 仅留存本地**：您在界面配置的 API Key 仅保存在您当前电脑浏览器的 `LocalStorage` 沙箱中。
- **开源安全**：代码仓库完全不含任何硬编码密钥，您可以放心地 Fork、开源、部署或二次分发。

---

## 🚀 快速开始

### 依赖环境
- Node.js >= 18.0.0
- npm >= 9.0.0

### 本地运行

```bash
# 1. 克隆代码仓库
git clone https://github.com/yfddxwx/Dehydrator.git
cd Dehydrator

# 2. 安装轻量依赖
npm install

# 3. 启动本地开发服务
npm run dev
```

启动后在浏览器中打开：`http://localhost:5173/`

*(Windows 用户亦可直接双击根目录下的 `启动.bat` 快速运行)*

### 构建生产包

```bash
npm run build
```

构建生成的纯静态文件将存放在 `dist/` 目录下，可直接托管在任何静态网页服务上。

---

## 🌐 免费一键部署

由于本项目是纯静态无服务端的应用，你可以将它一键免费部署到各大平台：

### 部署到 Vercel / Netlify / Cloudflare Pages
1. 将本仓库推送到你的 GitHub；
2. 登录 [Vercel](https://vercel.com) 或 [Cloudflare Pages](https://pages.cloudflare.com)；
3. 点击 **Import Git Repository**，选择本项目；
4. 构建命令填 `npm run build`，输出目录填 `dist`，点击 **Deploy** 即可瞬间上线！

### 部署到 GitHub Pages
本项目已预置 `.github/workflows/deploy.yml` 自动化工作流。只需在仓库设置中：
`Settings` -> `Pages` -> `Build and deployment` -> `Source` 选择 **GitHub Actions**，每次推送到 `main` 分支即可自动发布！

---

## 📂 项目结构

```text
thought-dehydrator/
├── .github/workflows/deploy.yml # GitHub Actions 自动部署
├── dist/                        # 生产打包静态文件
├── src/
│   ├── audio.ts                 # Web Audio API 纯原生琶音与和弦混响合成器
│   ├── dehydrator.ts            # 本地规则引擎与多 LLM 客户端抽象
│   ├── main.ts                  # 主交互编排与 UI 状态机
│   ├── samples.ts               # 内置预设测试样例思考流
│   ├── storage.ts               # LocalStorage 安全读写层
│   ├── style.css                # 90s NeXTSTEP 浮雕界面样式系统
│   └── types.ts                 # TypeScript 数据模型与接口
├── index.html                   # 主结构与 NeXTSTEP 视窗骨架
├── package.json                 # 项目依赖与 Scripts
├── tsconfig.json                # TypeScript 严格模式编译配置
├── vite.config.ts               # Vite 基础构建配置
├── LICENSE                      # MIT 开源协议
└── README.md                    # 项目说明文档 (中/英)
```

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！
1. Fork 本仓库；
2. 新建特性分支 (`git checkout -b feature/AmazingFeature`)；
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)；
4. 推送到分支 (`git push origin feature/AmazingFeature`)；
5. 发起 Pull Request。

---

## 📄 开源许可证

本项目采用 [MIT License](./LICENSE) 协议开源。
