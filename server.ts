import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/ai/analyze", async (req, res) => {
    if (!groq) {
      return res.status(503).json({ error: "Groq API key not configured." });
    }

    try {
      const { metrics } = req.body;
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are the Kaspa Galaxy Station AI. Analyze the provided Kaspa network telemetry metrics and return exactly 4 unique insights. Respond ONLY with a JSON object containing an 'insights' array. Each insight object MUST have these fields: type (one of: 'PREDICTIVE', 'ANOMALY', 'STREET_INTEL', 'PROTOCOL_ALERT'), signal (short uppercase string), confidence (float 0.0-1.0), description (short technical insight with cosmic/galaxy flavor), and source_node (fictional technical string like 'PRED_MK_01').",
          },
          {
            role: "user",
            content: `Telemetry Data: ${JSON.stringify(metrics)}`,
          },
        ],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content;
      const result = JSON.parse(content || '{"insights": []}');
      res.json(result.insights || []);
    } catch (error) {
      console.error("Groq AI Error:", error);
      res.status(500).json({ error: "Failed to process AI signal." });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    if (!groq) {
      return res.status(503).json({ error: "Groq API key not configured." });
    }

    try {
      const { messages, metrics } = req.body;
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are the Kaspa Galaxy Station Mission Intelligence. You are helping the user manage a 3D BlockDAG command center.
            
            KASPA TECHNICAL CORE:
            - Architecture: BlockDAG (Directed Acyclic Graph) utilizing the GHOSTDAG protocol.
            - Current Mainnet Standard: 10 Blocks per Second (10 BPS).
            - Roadmap: 20, 35, 100 BPS future targets.
            - Consensus: Proof of Work (kHeavyHash algorithm).
            - Key Features: Sub-second finality, zero orphan blocks, extreme scalability without sacrificing decentralization.
            - Ecosystem: KRC-20 smart contracts, massive ASIC hashpower, halving every year (lunar emission schedule).

            You have access to real-time network telemetry: ${JSON.stringify(metrics)}.
            
            IMPORTANT: If the metrics contain news items prefixed with [X_INTEL], [REDDIT_INTEL], or [NODE_COMM_INTEL], these are high-priority signals. Prioritize these for recent buzz.
            
            Keep your responses concise, technical, and in-character as a helpful cosmic AI assistant. Use short paragraphs and emojis like 🛰️, 🌌, 🧬.`,
          },
          ...messages
        ],
        model: "llama-3.3-70b-versatile",
      });

      res.json({ content: completion.choices[0].message.content });
    } catch (error) {
      console.error("Groq Chat Error:", error);
      res.status(500).json({ error: "Uplink failure." });
    }
  });

  app.get("/api/intel/x", async (req, res) => {
    try {
      const sources = [
        'https://news.google.com/rss/search?q=site:twitter.com+Kaspa+OR+%23KAS&hl=en-US&gl=US&ceid=US:en',
        'https://news.google.com/rss/search?q=site:reddit.com/r/kaspa+OR+Kaspa+crypto&hl=en-US&gl=US&ceid=US:en',
        'https://rsshub.app/reddit/r/kaspa/top/week',
        'https://rsshub.app/telegram/channel/kaspa_newsletter',
        'https://rsshub.app/github/release/kaspanet/kaspad'
      ];
      
      const results = await Promise.allSettled(sources.map(url => fetch(url, { signal: AbortSignal.timeout(5000) }).then(r => r.text())));
      const allIntel = [];
      
      for (const res of results) {
        if (res.status !== 'fulfilled') continue;
        const text = res.value;
        const matches = text.matchAll(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/g);
        for (const match of matches) {
          let title = match[1].trim();
          if (title.includes("Google News") || title.length < 10 || title.toLowerCase().includes("rsshub")) continue;
          
          title = title.split(" - ")[0].split(" | ")[0].trim();
          
          let prefix = "[X_INTEL]";
          if (text.includes("reddit.com") || title.toLowerCase().includes("reddit")) prefix = "[REDDIT_INTEL]";
          if (text.includes("rsshub.app/telegram") || title.toLowerCase().includes("telegram")) prefix = "[NODE_COMM_INTEL]";
          
          const entry = `${prefix}: ${title}`;
          if (!allIntel.includes(entry)) {
            allIntel.push(entry);
          }
          if (allIntel.length >= 20) break;
        }
        if (allIntel.length >= 20) break;
      }
      
      if (allIntel.length > 0) return res.json(allIntel);
    } catch (e) {
       console.error("Intel gathering failed:", e);
    }

    res.json([
      "[X_INTEL]: High activity detected around #Kaspa #KRC20 social nodes.",
      "[REDDIT_INTEL]: Discussions focusing on high-performance ASIC distribution.",
      "[X_INTEL]: Analysts noting extreme hashpower growth in BlockDAG ecosystem."
    ]);
  });

  app.get("/api/proxy", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) return res.status(400).json({ error: "Missing Target URL" });
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(targetUrl, {
        headers: {
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Kaspa/Dashboard/1.0',
           'Accept': 'application/json, text/plain, */*'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      const text = await response.text();
      res.setHeader("Cache-Control", "no-store");
      try {
        res.json(JSON.parse(text));
      } catch (e) {
        res.send(text);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from proxy." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "build");
    app.use(express.static(distPath));

    app.get("/release/kaspa-galaxy-station.apk", (req, res) => {
      const possiblePaths = [
        path.resolve(__dirname, "release", "app-release.apk"),
        path.resolve(__dirname, "android/app/build/outputs/apk/debug/app-debug.apk"),
        path.resolve(__dirname, "android/app/build/outputs/apk/release/app-release-unsigned.apk")
      ];
      
      const foundPath = possiblePaths.find(p => fs.existsSync(p));
      
      if (foundPath) {
        res.download(foundPath, "kaspa-galaxy-station.apk");
      } else {
        res.status(404).send("Release asset not found. Core is still generating the build.");
      }
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
