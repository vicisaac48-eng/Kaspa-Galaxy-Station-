# 🌌 Kaspa Galaxy Station: Neural Telemetry & Infrastructure Core

**The ultimate visual mission control for the Kaspa BlockDAG Network.**

Kaspa Galaxy Station is a high-fidelity, interactive 3D telemetry dashboard designed to provide a real-time "Command Center" experience for the Kaspa network. It bridges the gap between complex network data and immersive visual storytelling.

![Kaspa Galaxy Station Preview](https://picsum.photos/seed/kaspagalaxy/1200/600)

## 🚀 Vision
The Kaspa network is a living, breathing blockDAG with unprecedented speed and efficiency. Galaxy Station visualizes this performance as a stellar system, where every module, node, and transaction is mapped to scientific celestial bodies.

## 🛠 Features
- **Neural Telemetry Engine:** Real-time data streams for Kaspa Price, Hashrate, Market Cap, and Blocks per Second.
- **Atmospheric BlockDAG Visualizer:** An interactive 3D stellar map using Three.js and GHOSTDAG-inspired rendering with dynamic cluster nodes.
- **Resonance Stability Monitoring:** A specialized visual feedback system that notifies operators of DAG state stabilization and telemetry synchronization.
- **Neural Uplink UI:** A floating intelligent interface for protocol querying and real-time network assistance.
- **Notch-Adaptive Interface:** Specialized safe-area utility integration ensures the HUD remains clear of status bars and hardware notches on all mobile devices.
- **Professional Branding:** Custom-engineered vector assets and icons optimized for high-density displays and APK deployment.
- **SRE Intelligence HUD:** Professional-grade technical readouts and "Neural Monitor" logs providing deep network insights.

## 📡 Technicial Core
- **Frontend:** React 18+, Three.js (@react-three/fiber), GSAP for cinematic transitions, Tailwind CSS for the HUD.
- **Backend:** High-frequency Node.js edge-worker for multi-source API synchronization (api.kaspa.org, CoinGecko, Google News).
- **Security:** HMAC-signed telemetry packets and authenticated internal state monitoring.
- **Network:** Direct integration with Kaspa Mainnet infrastructure.

## 📦 Getting Started
1. **Clone the repository:**
   ```bash
   git clone https://github.com/username/kaspa-galaxy-station.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the mission:**
   ```bash
   npm run dev
   ```

## 📜 Network Constants
- **Network:** Kaspa Mainnet
- **Consensus:** GHOSTDAG / DAG Knight
- **Port:** 3000 (Local Deployment)

## 🤝 Open Source
This project is open-source. We welcome security specialists, protocol engineers, and UI designers to contribute to the next generation of Kaspa visualization.

## 📱 Deployment & APK Configuration

To ensure the **Neural Network Intelligence** and **Telemetry Proxy** work correctly when deployed to GitHub Pages or built as an APK:

1. **AI & Gemini API Key:**
   - The station uses a **Hybrid Neural Infrastructure**.
   - **Local Heuristics:** Works immediately without any setup. Provides smart insights based on live network telemetry.
   - **LLM Insights:** Requires a `GEMINI_API_KEY`. In development, set this in the AI Studio settings. In production, satisfy this variable on your backend server.

2. **Environment Variables:**
   - `GEMINI_API_KEY`: Required on the backend server for generative LLM insights.
   - `VITE_API_BASE_URL`: (Critical for APKs) Set this in your frontend environment if your backend is hosted separately (e.g., `https://your-backend.herokuapp.com`). APK builds will look for the API here.

3. **APK Build (Capacitor):**
   - The app is Capacitor-ready.
   - Ensure `VITE_API_BASE_URL` in `.env` points to your public API before running `npm run build`.
   - Run `npm run cap:sync` to manifest assets to Android.

---
*Built for the Kaspa Community. Powered by the fastest Decentralized Proof-of-Work network in existence.*
