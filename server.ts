import express from "express";
import path from "path";
import cors from "cors";

// We'll dynamic import Vite only in development to keep the production build lean and Vercel-compatible
async function getViteServer() {
  const { createServer } = await import("vite");
  return createServer;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());

  // ---- Server-Side Telemetry Proxy ----
  // Bypasses browser CORS restrictions and prevents allOrigins rate-limiting
  app.get("/api/proxy", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) return res.status(400).json({ error: "Missing Target URL" });
      
      const response = await fetch(targetUrl, {
        headers: {
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Kaspa/Dashboard',
           'Accept': 'application/json, text/plain, */*'
        }
      });
      
      const text = await response.text();
      res.setHeader("Cache-Control", "no-store");
      try {
        res.json(JSON.parse(text));
      } catch (e) {
        res.send(text);
      }
    } catch (error) {
      console.error("[PROXY ERROR]:", error);
      res.status(500).json({ error: "Failed to fetch from proxy." });
    }
  });

  // ---- Vite Middleware (must be after API routes) ----
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const createViteServer = await getViteServer();
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production (including Vercel), serve the built dist folder
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Express 4 uses '*' for catch-all fallback
    app.get("*", (req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("[SERVER]: Critical Error - index.html not found at", indexPath);
          res.status(500).send("Galaxy Station: Static Assets Not Found. Ensure 'npm run build' was successful.");
        }
      });
    });
  }

  // On Vercel, we don't call app.listen() directly; Vercel handles the lifecycle.
  if (process.env.VERCEL) {
    console.log("[SERVER]: Galaxy Station initialized on Vercel Edge.");
  } else {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

// Export the app instance for Vercel's serverless handler
const appPromise = startServer();
export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
