# 贡献指南 (Contributing Guide)

感谢您对 **思绪脱水与重构器 (Thought Dehydrator)** 的关注！我们欢迎任何形式的贡献，包括修复 Bug、改进 Prompt、优化音频合成与补充复古界面细节。

## 提交流程

1. **Fork 本仓库** 到您的 GitHub 账号；
2. **克隆到本地**：
   ```bash
   git clone https://github.com/<your-username>/thought-dehydrator.git
   cd thought-dehydrator
   npm install
   ```
3. **创建特性分支**：
   ```bash
   git checkout -b feature/my-cool-feature
   ```
4. **进行开发与测试**：
   ```bash
   npm run dev      # 启动本地热重载调试
   npm run build    # 确保 TypeScript 检查与静态编译 100% 通过
   ```
5. **代码规范要求**：
   - 保持 90s NeXTSTEP / Classic Gray 视觉基调不变；
   - 严禁引入任何外链第三方音频文件，所有音效必须由原生 Web Audio API 合成；
   - 核心三段式字数硬性上限不可突破（<=20, <=20, <=15 字）。
6. **提交 Commit 并发起 PR**。
