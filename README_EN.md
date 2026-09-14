<div align="center">

# ◈ Thought Dehydrator (思绪脱水与重构器)

**An extreme thought dehydration & structural reconstruction workstation crafted with 1990s NeXTSTEP retro aesthetics.**

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg?style=flat-square)](./LICENSE)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Native_Synthesis-27ae60.svg?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Client_Side-blue.svg?style=flat-square)](#-privacy--security-guarantee)

**English** | [简体中文](./README.md)

</div>

---

## 💡 Why Thought Dehydrator?

During daily brainstorming, technical deliberations, and chaotic meetings, our thoughts are often cluttered with filler phrases, emotional friction, and rambling narratives.

**Thought Dehydrator** ruthlessly purges noise and maximizes information density. No matter how convoluted your raw stream of consciousness is, it strips away conversational fluff and extracts the essential three-line skeleton:

1. **[Core Entities & Action]** (Strictly <= 20 chars)
2. **[Potential Conflict / Key Bottleneck]** (Strictly <= 20 chars)
3. **[Next Action]** (Strictly <= 15 chars)

---

## ✨ Key Features

### 1. 1990s NeXTSTEP / Classic Gray Retro Aesthetic
- **Authentic Bevel Relief**: Classic workstation gray palette (`#c0c0c0`), sharp double-layer Inset/Outset 3D bevel borders.
- **Iconic NeXT Titlebar**: Pure black titlebar with bold monospace typography, cube badge, and inset 3D control squares (Close `✕` and Minimize `▼`).
- **Dot-Matrix Micro Progress Indicator**: `[■■■■■■□□□□]` with phosphor green glow and status LEDs.

### 2. Pure Code Web Audio API Synthesis (Zero External Audio Files)
- **Ascending Arpeggio on Start**: 6-step rapid electronic pulse sequence interweaving square and sine waves with a lowpass envelope.
- **Harmonic Chime Chord with Reverb on Finish**: Maps the text hash into crystal-clear chord voicings (C Maj9, F Lydian, G Sus4, etc.) through a native feedback delay network for an authentic 90s DSP chime.
- **Acoustic Fingerprint**: Each specimen card is stamped with a unique harmonic hash (e.g. `#A9F1`). Sound can be toggled on/off with one click.

### 3. Dual Engine Architecture (Offline Heuristic + Multi-LLM BYOK)
- **Local Heuristic Rule Engine (Zero Network, Zero Config)**:
  - Smart Chinese/English clause segmentation, 20+ filler word filter, subject-verb priority scoring, and conflict clause detection.
  - Works 100% offline with zero latency and zero API keys.
- **Native Multi-LLM Connectors (Bring-Your-Own-Key)**:
  - Out-of-the-box support for Google Gemini, DeepSeek, Moonshot Kimi, OpenAI, or custom OpenAI-compatible proxies.
  - **Graceful Fallback**: If an API key is invalid or network drops, it immediately falls back to the local heuristic engine with clear alert badges.

### 4. Floating Card Shelf & Instant Markdown Export
- **Card Shelf Drawer**: Sliding NeXTSTEP shelf docked to the side, persisted to browser `LocalStorage`. Inspect, reload, or manage past specimen cards.
- **One-Click Export**: Copy the structured card into clean GitHub-flavored Markdown.

---

## 🔒 Privacy & Security Guarantee

- **Zero Server Relays**: This project is a 100% client-side Single Page Application (SPA). There is NO backend server collecting your thoughts.
- **LocalStorage Sandbox**: All API keys and cards reside strictly inside your browser's private `LocalStorage`.
- **Open-Source Safe**: No hardcoded API keys exist in the codebase. Safe to fork, host, or share publicly.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Run Locally

```bash
# 1. Clone repository
git clone https://github.com/your-username/thought-dehydrator.git
cd thought-dehydrator

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at `http://localhost:5173/`.

*(On Windows, you can also double-click `启动.bat` for instant startup!)*

### Build for Production

```bash
npm run build
```

Production assets will be generated in `dist/`.

---

## 🌐 Free Instant Deployment

Deploy in seconds to any static hosting provider:

### Vercel / Netlify / Cloudflare Pages
1. Push this repository to your GitHub.
2. Sign in to [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com).
3. Import the repository.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Click **Deploy**!

### GitHub Pages
This repo includes a pre-configured `.github/workflows/deploy.yml`. Simply navigate to:
`Settings` -> `Pages` -> `Build and deployment` -> `Source` -> choose **GitHub Actions**.
Every push to `main` will automatically build and deploy!

---

## 📂 Project Structure

```text
thought-dehydrator/
├── .github/workflows/deploy.yml # Automated GitHub Pages workflow
├── dist/                        # Production build outputs
├── src/
│   ├── audio.ts                 # Web Audio API synthesizer (Arpeggio + Chime Delay)
│   ├── dehydrator.ts            # Heuristic rule engine & LLM connectors
│   ├── main.ts                  # Main controller & UI state management
│   ├── samples.ts               # Preset thought streams for 1-click testing
│   ├── storage.ts               # LocalStorage persistence layer
│   ├── style.css                # 1990s NeXTSTEP design system & bevel styles
│   └── types.ts                 # TypeScript interfaces & types
├── index.html                   # HTML entry & NeXTSTEP window structure
├── package.json                 # Project configuration & scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite build configuration
├── LICENSE                      # MIT License
└── README.md                    # Documentation (English & Chinese)
```

---

## 🤝 Contributing

Contributions, issues, and feature suggestions are always welcome!
1. Fork the Project;
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`);
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`);
4. Push to the Branch (`git push origin feature/AmazingFeature`);
5. Open a Pull Request.

---

## 📄 License

Distributed under the [MIT License](./LICENSE).
