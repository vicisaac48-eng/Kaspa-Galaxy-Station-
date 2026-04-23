# Kaspa Galaxy Station: Decentralized Deployment Guide

The station has been upgraded to a **Pure Static Architecture**. It no longer requires a backend server to run, making it 100% crash-proof and decentralized-ready.

## 📡 Core Requirements
This application is a **Static Single Page App (SPA)**. It connects directly to the Kaspa network from your browser. 

### 1. Environment Variables
No server-side environment variables are required! All telemetry is fetched directly from public Kaspa APIs.

---

## 🚀 Platform Specifics (Zero-Config)

### 🟢 Vercel (Pure Static)
- **Framework Preset:** Select "Vite".
- **Build Command:** `npm run build`.
- **Output Directory:** `dist`.
- **Install Command:** `npm install`.
- *Note: You no longer need to worry about "Internal Server Errors".*

### 🟦 4Everland / IPFS / GitHub Pages
- Simply upload the contents of the `dist` folder after running `npm run build`.
- The station will wake up and sync with the Kaspa network regardless of the hosting provider.

---

## 🛠️ Station Health
- If the "Last Sync" is blank, ensure your browser is not blocking requests to `api.kaspa.org`.
- The station now processes its own AI heuristics locally in your browser to avoid server timeouts.

---
**Mission Certified for Decentralized Mainnet Distribution.**
