<div align="center">

# 📦 PipInstalls PRO

### The Neon Observatory — Enterprise Python Package Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-7C3AED.svg?style=for-the-badge)](LICENSE)
[![Made with JS](https://img.shields.io/badge/Made_with-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PyPI API](https://img.shields.io/badge/API-PyPI-3775A9?style=for-the-badge&logo=pypi&logoColor=white)](https://pypi.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-34d399?style=for-the-badge)](https://github.com/kadam)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222?style=for-the-badge&logo=github)](https://pages.github.com/)

> 🚀 Browse 8000+ Python packages, scan OS compatibility, generate lockfiles with SHA256 hashes, and export Dockerfiles — all from one visual interface. No backend required.

</div>

---

## ⚡ Features

| Feature | Description |
|---------|------------|
| 🔍 **Live Search** | Autocomplete with highlighted matching text and category tags |
| ♾️ **Infinite Scroll** | Browse 8000+ trending PyPI packages with buttery smooth loading |
| 📂 **Category Filters** | Data Science · Vision · Web & API · Dev Tools |
| 🪟🍏🐧 **OS Compatibility** | Binary wheel scanner shows which OSes each package supports |
| 📚 **Inline Docs** | Read package README files rendered as Markdown, without leaving the app |
| 🔒 **Lockfile Generator** | Recursive dependency graph → deterministic `requirements.lock` with SHA256 |
| 🩺 **Health Scanner** | Audits license conflicts (GPL detection) and version mismatches |
| 🐳 **Export Anything** | `.txt` · `.toml` · `.lock` · `Dockerfile` · `.bat` · `.sh` |
| ⚖️ **Package Compare** | Side-by-side comparison of any 2 pinned packages |
| 🔗 **URL Sharing** | Share your workspace via URL — teammates get your exact stack |
| 📤 **Import** | Upload a `requirements.txt` to instantly build your workspace |
| 🌙 **Dark/Light Mode** | Toggle between Obsidian Neon dark and clean light themes |
| 📱 **PWA Ready** | Install as a desktop app from your browser |

---

## 🚀 Deployment

### GitHub Pages (Recommended)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "🚀 Initial release"
git remote add origin https://github.com/YOUR_USERNAME/pip-installer-web.git
git push -u origin main

# 2. Enable GitHub Pages
# Go to: Settings → Pages → Source: "main" branch → Save
# Your site will be live at: https://YOUR_USERNAME.github.io/pip-installer-web/
```

### Local Development

```bash
# Any static file server works:
npx serve .
# or
python -m http.server 8000
```

---

## 🏗️ Architecture

```
pip-installer-web/
├── index.html          # UI structure + SEO meta tags
├── style.css           # Obsidian Neon design system
├── app.js              # Core logic (API, infinite scroll, lockfile engine)
├── manifest.json       # PWA manifest
├── og-preview.png      # Social media preview image
└── README.md           # This file
```

**Zero dependencies.** Pure vanilla HTML + CSS + JavaScript.
Uses the public [PyPI JSON API](https://pypi.org/pypi/{package}/json) and [Top PyPI Packages dataset](https://hugovk.github.io/top-pypi-packages/).

---

## 🔒 Security

- **No backend** — runs entirely in your browser
- **No data collection** — workspace saved in `localStorage` only
- **SHA256 verification** — every downloaded file can be hash-verified
- **License auditing** — flags GPL and other restrictive licenses
- **Safe for public repos** — no API keys, no secrets, no server-side code

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📜 License

MIT — free for personal and commercial use.

---

<div align="center">
    <sub>Built with ❤️ by <a href="https://github.com/kadam">kadam</a> · Powered by <a href="https://pypi.org">PyPI</a></sub>
</div>
