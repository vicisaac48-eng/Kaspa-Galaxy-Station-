# Kaspa Galaxy Station: Mission Deployment Guide

To ensure your station deploys perfectly on external platforms, follow these specific instructions for the **Node.js** architecture.

## 📡 Core Requirements
This application is **Full-Stack**. It requires a Node.js runtime to process the Kaspa telemetry and radio streams. 

### 1. Environment Variables
You MUST set the following variables in your platform's dashboard:
- `AGENT_SIGNING_KEY`: Set to any high-entropy string (from `.env.example`).
- `NODE_ENV`: Set to `production`.

---

## 🚀 Platform Specifics

### 🟢 Vercel (Recommended for Frontend)
We have included a `vercel.json` already. 
- **Framework Preset:** Select "Vite".
- **Build Command:** `npm run build`.
- **Output Directory:** `dist`.
- **Install Command:** `npm install`.

### 🟦 Railway / Render (Recommended for Real-time)
These platforms support "Persistent Servers," which are better for the 24/7 background sync.
- **Start Command:** `node server.ts` (or `npm start`).
- **Port:** The app automatically detects the `PORT` variable assigned by the platform.

### ⛓️ 4Everland
- Use **4Everland Hosting** for the Frontend.
- If using **4Everland Compute**, ensure you deploy it as a Node.js project targeting `server.ts`.

---

## 🛠️ Debugging the Heartbeat
If you see "Galaxy Station: Static Assets Not Found":
1. This means the server started but the `dist` folder is missing.
2. Ensure you have the **"Framework Preset"** in Vercel set to **"Vite"** or **"Other"** (with `npm run build` as the command).
3. We have updated `vercel.json` with `includeFiles` to force Vercel to bundle the React frontend into the serverless function.

---
**Mission Certified and Hardened for Vercel Serverless Architecture.**
