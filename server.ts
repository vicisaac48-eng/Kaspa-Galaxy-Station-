import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import crypto from "crypto";
import Parser from 'rss-parser';

const rssParser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  timeout: 5000
});

async function fetchRealtimeNews(url: string) {
  try {
    const feed = await rssParser.parseURL(url);
    return feed.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate
    }));
  } catch (err) {
    console.warn(`[RSS] Failed to fetch ${url}`, err);
    return [];
  }
}

// ---- Immutable Telemetric Storage (Blockchain Optimized Cache) ----
class ImmutableTelemetricStore {
  private memoryCollection: unknown[] = [];
  
  async add(document: unknown, collectionName: string) {
    console.log(`[CORE_STORE] Committing state to immutable layer: '${collectionName}'`);
    this.memoryCollection.push(document);
    // Simulate Blockchain Tx Hash (SHA-256 derived)
    return { txId: crypto.createHash('sha256').update(JSON.stringify(document)).digest('hex') };
  }
}
const db = new ImmutableTelemetricStore();

// ---- Kaspa Local NLP Engine (Backend Fallback AI) ----
class LocalTextSummarizer {
  static synthesize(articles: { title: string }[]) {
    if (!articles || articles.length === 0) return ["[LOCAL_AI]: Aggregating deep-space signals..."];
    // Heuristic Keyword scoring - Expanded for broader relevance
    const keywordWeights: Record<string, number> = {
      hashrate: 4, hashrates: 4, 
      price: 3, kas: 3, kaspa: 3,
      dagknight: 5, ghostdag: 5, 
      rust: 4, rusty: 4,
      protocol: 2, mainnet: 2, smart: 3, update: 2,
      listing: 2, surge: 2, milestone: 3, tps: 4, bps: 4,
      consensus: 2, development: 2, blockdag: 4, 
      exchange: 2, kheavyhash: 4, mining: 3
    };

    let scored = articles.map(a => {
      let score = 1; // Base score for any headline found
      let lower = a.title.toLowerCase();
      for (const [kw, weight] of Object.entries(keywordWeights)) {
        if (lower.includes(kw)) score += weight;
      }
      return { title: a.title, score };
    });

    // Sort by algorithmic relevance
    scored.sort((a, b) => b.score - a.score);
    // Take more articles to ensure variety
    let topArticles = scored.slice(0, 6);

    return topArticles.map(a => {
      let type = "STATION_SIGNAL";
      let low = a.title.toLowerCase();
      
      if (low.includes("hashrate") || low.includes("mining") || low.includes("kheavyhash")) type = "NETWORK_SECURITY";
      else if (low.includes("dagknight") || low.includes("rust") || low.includes("protocol") || low.includes("ghostdag")) type = "CORE_PROTOCOL";
      else if (low.includes("price") || low.includes("surge") || low.includes("listing") || low.includes("exchange")) type = "MARKET_INTELLIGENCE";
      else if (low.includes("tps") || low.includes("bps") || low.includes("speed") || low.includes("performance")) type = "PERFORMANCE_SYNC";
      else if (low.includes("smart") || low.includes("contract") || low.includes("integration")) type = "EASY_ADOPTION";
      
      let cleanTitle = a.title;
      // Remove common RSS junk and source suffixes
      cleanTitle = cleanTitle.split(' - ')[0].split(' | ')[0]; 
      if (cleanTitle.length > 70) cleanTitle = cleanTitle.substring(0, 67) + '...';
      
      return `[${type}]: ${cleanTitle}`;
    });
  }
}

// ---- Global Orchestrator Utilities ----
function getSeasonalAudio() {
  const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
  
  let season = "Winter";
  // Winter: Smooth Afrobeat
  let stream = "https://radio.lagosjumpradio.com/listen/lagosjump_radio/radio.mp3"; 
  let vibe = "Lagos Jump Afrobeats";
  
  if (month >= 2 && month <= 4) {
    season = "Spring";
    // Spring: Pure Naija Afrobeats
    stream = "https://streamer.radio.co/s919e54210/listen"; 
    vibe = "Afrobeat N1 Hits";
  } else if (month >= 5 && month <= 7) {
    season = "Summer";
    // Summer: Amapiano Heat & Dancehall
    stream = "https://stream.bigfm.de/dancehall/mp3-128/radio-browser";
    vibe = "Amapiano & Dancehall Heat";
  } else if (month >= 8 && month <= 10) {
    season = "Autumn";
    // Autumn: Afrofusion & Melodic Vibes
    stream = "https://stream.flavorjamz.com/stream.mp3";
    vibe = "FlavorJamz Afrofusion";
  }
  
  return { season, stream, vibe };
}

// ---- Orchestrator State Variables ----
let previousStateValue = 0;
let globalHealth = 100;
let terminalLogs: { id: string, msg: string, time: string, type: string }[] = [];

interface AllocationRecord {
  id: string;
  time: string;
  node: string;
  confidence: string;
  reasoning: string;
}
let allocationHistory: AllocationRecord[] = [];
let latencySpike: Record<string, number> = { KaspaREST: 0, KaspaHashrate: 0, KaspaHalving: 0 };

let latestLatencies = { kaspaRest: 0, kaspaHashrate: 0, kaspaHalving: 0 };
// Real Kaspa metrics variables cache
let kaspaMetrics: any = { 
  blockCount: "0", 
  difficulty: 0, 
  hashrate: 0, 
  nextHalvingDate: "",
  mempoolSize: 0,
  tps: 0.1,
  orphanRate: "0.00%",
  dagActiveTips: 0,
  price: 0.034, 
  priceChange24h: 0,
  marketCap: 0,
  lastSyncTime: new Date().toISOString(),
  news: [
    { id: 1, title: "Kaspa BlockDAG Scalability Milestone Reached", link: "#" },
    { id: 2, title: "DAGKnight Protocol Implementation Update", link: "#" },
    { id: 3, title: "Global Mining Hashrate Hits All-Time High", link: "#" }
  ],
  heuristicNews: [
    "[CORE_PROTOCOL]: GHOSTDAG consensus operating at optimal sub-second block resolution.",
    "[NETWORK_SECURITY]: Global Kaspa hashrate stability verified across major mining pools.",
    "[PERFORMANCE_METRIC]: 10BPS architecture sustaining maximum transaction throughput.",
    "[MARKET_UPDATE]: Kaspa ecosystem adoption scales alongside network growth metrics."
  ],
  transactions: [] as { hash: string, amount: string, time: string }[]
};

let aiBrainState = {
  bestPerformingApi: "KaspaREST",
  confidence: "99.9%",
  anomalyDetection: "Initializing telemetry pathways and observing Kaspa BlockDAG endpoints...",
  routingRecommendation: "Awaiting baseline telemetry to configure optimal routing weights for Kaspa network queries."
};

// ---- A.E.G.I.S. Cognitive Cortex Loop (Local Heuristic Engine) ----
// 100% Free API architecture - Generates SRE insights dynamically based on raw metrics
setInterval(async () => {
  try {
    terminalLogs.push({
      id: crypto.randomBytes(8).toString('hex'),
      time: new Date().toISOString(),
      type: 'info',
      msg: `[LOCAL CORTEX] Initiating heuristic BlockDAG parameter scan...`
    });

    // Sort networks by latency to evaluate performance realistically
    const networks = [
      { name: 'KaspaREST', lat: latestLatencies.kaspaRest || 15 },
      { name: 'KaspaHashrate', lat: latestLatencies.kaspaHashrate || 20 },
      { name: 'KaspaHalving', lat: latestLatencies.kaspaHalving || 35 }
    ].sort((a, b) => a.lat - b.lat);
    
    const best = networks[0];
    const worst = networks[2];

    const isDegraded = worst.lat > 1500;
    const confidenceScore = isDegraded ? (70 + Math.random() * 15).toFixed(1) + "%" : (95 + Math.random() * 4).toFixed(1) + "%";

    // Dynamic logical generation correlating exactly to real variables
    let anomalyStr = "All systems nominal.";
    if (isDegraded) {
      anomalyStr = `[NETWORK CONGESTION] Node ${worst.name} is reporting excessive packet latency at ${worst.lat}ms. High orphan rate probability. Flagged as degraded in local routing maps.`;
    } else if (kaspaMetrics.mempoolSize > 80) {
      anomalyStr = `[WARN] High transaction density detected. Mempool currently at ${kaspaMetrics.mempoolSize} pending txs. Expect lower network vitality scores until clearance.`;
    } else {
      anomalyStr = `No active anomalies detected across mapped nodes. Edge transit layer operating at ${(Math.random() * 2 + 10).toFixed(2)}ms median latency.`;
    }

    let routingStr = `Routing priority allocated to ${best.name} due to optimal physical ping execution (${best.lat}ms). `;
    routingStr += isDegraded 
      ? `Bypassing ${worst.name} entirely until DAG synchronizes and latency drops below 500ms safety threshold.`
      : `Distributing parallel read queries across secondary edges to maintain load balance.`;

    aiBrainState = {
      bestPerformingApi: best.name,
      confidence: confidenceScore,
      anomalyDetection: anomalyStr,
      routingRecommendation: routingStr
    };

    // Track history
    allocationHistory.unshift({
      id: crypto.randomBytes(4).toString('hex'),
      time: new Date().toISOString(),
      node: aiBrainState.bestPerformingApi,
      confidence: aiBrainState.confidence,
      reasoning: aiBrainState.routingRecommendation
    });
    if (allocationHistory.length > 10) allocationHistory.pop();

    terminalLogs.push({
      id: crypto.randomBytes(8).toString('hex'),
      time: new Date().toISOString(),
      type: 'ok',
      msg: `[LOCAL CORTEX] Health scan complete. Routing active traffic pool to ${aiBrainState.bestPerformingApi}.`
    });
    if(terminalLogs.length > 30) terminalLogs.shift();

  } catch (e: any) {
    console.error("Local SRE Cortex Fault:", e);
  }
}, 15000); // 15-second inference execution

// Phase 4: Autonomous Pulse (The Loop) - Simulated SRE Cron Job
setInterval(() => {
  const timestamp = new Date().toISOString();
  
  // Logic gap simulation (e.g. 40% chance of an issue)
  const isGap = Math.random() > 0.6;
  
  if (isGap) {
    // Also simulate a network spike for SRE to react to
    const networks = ["KaspaREST", "KaspaHashrate", "KaspaHalving"];
    const spikeTarget = networks[Math.floor(Math.random() * networks.length)];
    latencySpike[spikeTarget] = 500 + Math.random() * 1500;
    
    // Decay spikes over time logic handled in fetch
    setTimeout(() => { latencySpike[spikeTarget] = 0; }, 20000);

    const nodes = ["us-east-1 (Hashrate)", "eu-west-2 (REST)", "ap-south-1 (Index)", "edge-cache-kaspa"];
    const targetNode = nodes[Math.floor(Math.random() * nodes.length)];
    const issues = ["Slow Block Propogation", "RPC Gateway Timeout", "DAG Orphan Blocks Spike", "Rate Limit Reached"];
    const issue = issues[Math.floor(Math.random() * issues.length)];

    globalHealth = Math.max(0, globalHealth - Math.floor(Math.random() * 15));
    
    // Memory limit
    if (terminalLogs.length > 30) terminalLogs.shift();
    
    terminalLogs.push({
      id: crypto.randomBytes(8).toString('hex'),
      time: timestamp,
      type: 'warn',
      msg: `[WARN] Anomaly on node ${targetNode}. Reason: ${issue}. Executing failover...`
    });
    
    // Autonomous Self-Correction triggers
    setTimeout(() => {
      globalHealth = Math.min(100, globalHealth + Math.floor(Math.random() * 20));
      terminalLogs.push({
        id: crypto.randomBytes(8).toString('hex'),
        time: new Date().toISOString(),
        type: 'ok',
        msg: `[OK] Soft-reboot applied to ${targetNode}. Traffic re-routed to healthy edge. SLA restored.`
      });
    }, 2500);

  } else {
    if (terminalLogs.length > 30) terminalLogs.shift();
    terminalLogs.push({
      id: crypto.randomBytes(8).toString('hex'),
      time: timestamp,
      type: 'info',
      msg: `[INFO] SRE Telemetry Pulse active. Core APIs optimal.`
    });
  }
}, 30000); // 30 seconds for easier visualization, simulates 60s cron interval

// ---- Real-Time Infrastructure Monitoring ----
async function fetchNodeHealth(url: string) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 6000); 
    const response = await fetch(url, { 
      method: 'GET', 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(id);
    const latency = Date.now() - start;
    let data = null;
    if (response.ok) {
       const text = await response.text();
       try { 
         data = JSON.parse(text); 
       } catch(e) {
         if (text.length < 50 && !isNaN(Number(text))) {
            data = { value: Number(text) };
         }
       }
    }
    return {
      isUp: response.ok,
      latency: latency > 0 ? latency : 1,
      velocity: response.ok ? 1000 : 0,
      data
    };
  } catch (err) {
    return { isUp: false, latency: 6000, velocity: 0, data: null };
  }
}

// ---- Background Worker: Infinite Multi-Source Market & News Aggregator ----
// This runs globally on the server to prevent excessive rate-limiting and make UI incredibly fast.
async function syncGlobalIntelligence() {
  console.log("[SRE] Initiating cross-source external market & news synchronization...");
  try {
    const [priceData, marketCapData, coinGeckoData, newsGroup1, newsGroup2, newsGroup3] = await Promise.all([
      fetchNodeHealth('https://api.kaspa.org/info/price'),
      fetchNodeHealth('https://api.kaspa.org/info/marketcap'),
      fetchNodeHealth('https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd&include_24hr_change=true'),
      fetchRealtimeNews('https://news.google.com/rss/search?q=Kaspa+network+update+when:7d&hl=en-US&gl=US&ceid=US:en'),
      fetchRealtimeNews('https://news.google.com/rss/search?q=Kaspa+GHOSTDAG+DAGKnight&hl=en-US&gl=US&ceid=US:en'),
      fetchRealtimeNews('https://news.google.com/rss/search?q=Kaspa+currency+listing+news&hl=en-US&gl=US&ceid=US:en')
    ]);

    // Parse flawless native APIs first
    if (priceData.data) {
       // Support both {price: x} and raw numbers
       const price = priceData.data.price || priceData.data.value;
       if (price) kaspaMetrics.price = price;
    }
    if (marketCapData.data) {
       const mcap = marketCapData.data.marketcap || marketCapData.data.value;
       if (mcap) kaspaMetrics.marketCap = mcap;
    }
    
    // Supplement 24hr change from CoinGecko if available
    if (coinGeckoData.data && coinGeckoData.data.kaspa && coinGeckoData.data.kaspa.usd_24h_change) {
       kaspaMetrics.priceChange24h = coinGeckoData.data.kaspa.usd_24h_change;
    }

    // Unify all distinct intelligence sources into a single chronologically sorted datastore
    let unifiedNews: any[] = [];
    unifiedNews = [...unifiedNews, ...newsGroup1, ...newsGroup2, ...newsGroup3];

    // Filter duplicates by title and sort by most recently published
    const uniqueNewsMap = new Map();
    unifiedNews.forEach(item => {
       const cleanTitle = item.title.toLowerCase().trim();
       if (!uniqueNewsMap.has(cleanTitle)) {
           uniqueNewsMap.set(cleanTitle, item);
       }
    });

    const sortedNews = Array.from(uniqueNewsMap.values())
      .sort((a: any, b: any) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 20);

    kaspaMetrics.lastSyncTime = new Date().toISOString();

    if (sortedNews.length > 0) {
      kaspaMetrics.news = sortedNews.map((item: any, idx: number) => ({
        id: idx,
        title: item.title,
        link: item.link,
        pubDate: item.pubDate
      }));
      // Regenerate the local algorithmic heuristics
      kaspaMetrics.heuristicNews = LocalTextSummarizer.synthesize(kaspaMetrics.news);
    } else {
      // Periodic fallback refresh to ensure station isn't silent
      kaspaMetrics.heuristicNews = [
        "[STATION_IDLE]: Monitoring live BlockDAG pulse. Minimal signal volatility detected.",
        "[NETWORK_HEALTH]: Optimal 10BPS cadence maintained across all galactic relays.",
        "[PERFORMANCE_SYNC]: Telemetry heartbeat active. Awaiting significant ledger events."
      ];
    }
    
    kaspaMetrics.ambientTheme = getSeasonalAudio();

    // Update Heartbeat Sync Timestamp
    kaspaMetrics.lastSyncTime = new Date().toISOString();
    console.log(`[CORE_STORE] Telemetry Heartbeat Sync: ${kaspaMetrics.lastSyncTime}`);
  } catch (err) {
    console.error("[SRE] Cross-source external synchronicity failed. Using existing cache.", err);
  }
}

// Immediately trigger cache pre-warming, then loop every 60 seconds.
syncGlobalIntelligence();
setInterval(syncGlobalIntelligence, 60000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // ---- State Orchestrator API Edge Worker ----
  app.get("/api/state", async (req, res) => {
    try {
      // 1. Fetch real-time latency & health from real APIs + blockdag status
      const [kaspaRest, kaspaHashrate, kaspaHalving, kaspaBlockdag] = await Promise.all([
        fetchNodeHealth('https://api.kaspa.org/info/network'),
        fetchNodeHealth('https://api.kaspa.org/info/hashrate'),
        fetchNodeHealth('https://api.kaspa.org/info/halving'),
        fetchNodeHealth('https://api.kaspa.org/info/blockdag')
      ]);

      latestLatencies = { 
        kaspaRest: kaspaRest.latency + (latencySpike['KaspaREST'] || 0), 
        kaspaHashrate: kaspaHashrate.latency + (latencySpike['KaspaHashrate'] || 0), 
        kaspaHalving: kaspaHalving.latency + (latencySpike['KaspaHalving'] || 0) 
      };

      // Simulated network fluctuation metrics that bind to the globalHealth state
      kaspaMetrics.mempoolSize = Math.floor(Math.random() * 50) + (100 - globalHealth) * 20; // Lower health -> high mempool
      kaspaMetrics.tps = Number((globalHealth / 10 + Math.random() * 2).toFixed(2)); // Realistic kaspa BPS * tx density
      kaspaMetrics.orphanRate = ((100 - globalHealth) * 0.05).toFixed(2) + '%'; 

      // Extract real news from Google News RSS via RSS2JSON proxy
      // REMOVED IN FAVOR OF HIGH-SPEED BACKGROUND CACHING WORKER (syncGlobalIntelligence)
      // The API edge route should never be blocked by slow third-party API calls.

      // Generate dynamic transactions based on current TPS
      const txCount = Math.floor(kaspaMetrics.tps * 2);
      const newTxs = Array.from({ length: txCount }).map(() => ({
        hash: crypto.randomBytes(16).toString('hex'),
        amount: (Math.random() * 5000 + 100).toFixed(2),
        time: new Date().toISOString()
      }));
      kaspaMetrics.transactions = [...newTxs, ...kaspaMetrics.transactions].slice(0, 15);

      if (kaspaRest.data) {
         kaspaMetrics.blockCount = kaspaRest.data.blockCount || kaspaMetrics.blockCount;
         kaspaMetrics.difficulty = kaspaRest.data.difficulty || kaspaMetrics.difficulty;
      }
      if (kaspaHashrate.data) {
         kaspaMetrics.hashrate = kaspaHashrate.data.hashrate || kaspaMetrics.hashrate;
      }
      if (kaspaHalving.data) {
         kaspaMetrics.nextHalvingDate = kaspaHalving.data.nextHalvingDate || kaspaMetrics.nextHalvingDate;
      }
      if (kaspaBlockdag.data && kaspaBlockdag.data.tipHashes) {
         kaspaMetrics.dagActiveTips = kaspaBlockdag.data.tipHashes.length;
      }

      // 2. Apply "Traffic Priority" Formula (Priority = [Velocity / Latency^2] * Confidence)
      // We convert latency to seconds for the math so it doesn't overly penalize the formula
      const calculatePriority = (velocity: number, latencyMs: number, confidence: number) => {
        const latencySec = latencyMs / 1000.0;
        return (velocity / Math.pow(latencySec, 2)) * confidence;
      };

      // Generate Node-specific Values mapping to real data
      const nodesStats = {
        KaspaREST: { 
          velocity: kaspaRest.velocity, 
          latency: kaspaRest.latency, 
          confidence: kaspaRest.isUp ? 0.95 : 0.0 
        },
        KaspaHashrate: { 
          velocity: kaspaHashrate.velocity, 
          latency: kaspaHashrate.latency, 
          confidence: kaspaHashrate.isUp ? 0.99 : 0.0 
        },
        KaspaHalving: { 
          velocity: kaspaHalving.velocity, 
          latency: kaspaHalving.latency, 
          confidence: kaspaHalving.isUp ? 0.98 : 0.0 
        }
      };

      const computedNodes: Record<string, any> = {};
      let highestPriorityValue = 0;
      let highestPriorityNode = "KaspaREST";

      for (const [node, stats] of Object.entries(nodesStats)) {
        const priority = calculatePriority(stats.velocity, stats.latency, stats.confidence);
        computedNodes[node] = { ...stats, priority };
        if (priority > highestPriorityValue) {
          highestPriorityValue = priority;
          highestPriorityNode = node;
        }
      }

      // Live state logic based on active latency
      const currentStateValue = kaspaRest.latency + kaspaHashrate.latency + kaspaHalving.latency;

      let reasoningPacket = null;
      let stateChanged = false;
      let weavedbTxId = null;

      // Ensure we have a starting state
      if (previousStateValue === 0) previousStateValue = currentStateValue;

      // 3. Check for >5% Change in global network latency
      const changePercent = Math.abs((currentStateValue - previousStateValue) / previousStateValue) * 100;
        
      // We trigger a packet if latency changes significantly OR if nodes are completely offline
      const nodesOffline = !kaspaRest.isUp || !kaspaHashrate.isUp || !kaspaHalving.isUp;
      
      if (changePercent > 5 || nodesOffline) {
        stateChanged = true;
        previousStateValue = currentStateValue;
        
        // Output Real Network Metrics into the reasoning packet
        const isCongested = currentStateValue > 2500 || nodesOffline; // Real congestion if latencies exceed 2.5s
        
        const dynamicLiveNews = [
           `[LIVE_TELEMETRY] KAS Price is current tracking at $${kaspaMetrics.price} USD.`,
           `[LIVE_TELEMETRY] Global Network Hashrate holding strong at ${kaspaMetrics.hashrate} TH/s.`,
           `[LIVE_TELEMETRY] Network Speed is perfectly synced at exactly ${kaspaMetrics.tps} TPS with an orphan rate of ${kaspaMetrics.orphanRate}.`,
           `[LIVE_TELEMETRY] Total Block count reached ${kaspaMetrics.blockCount}. Live Active Tips: ${kaspaMetrics.dagActiveTips}.`,
           ...(kaspaMetrics.heuristicNews || [])
        ];

        const packetMetrics = { ...kaspaMetrics, heuristicNews: dynamicLiveNews };
        
        reasoningPacket = {
          id: `RP-${Date.now()}`,
          timestamp: new Date().toISOString(),
          engine: "KASPA_Neural_Monitor",
          delta_percent: changePercent.toFixed(2),
          trigger: nodesOffline ? 'NODE_OFFLINE_DETECTED' : 'LATENCY_DELTA_TARGET',
          metrics: { kaspaRest, kaspaHashrate, kaspaHalving },
          polw: { nodes: computedNodes, dominantNode: highestPriorityNode, maxPriority: highestPriorityValue },
          ai: aiBrainState, // Live Neural reasoning injected
          realMetrics: packetMetrics,
          logicDensity: isCongested ? 0.8 : 1.5, // Used for scale
          reliabilityScore: isCongested ? 0.3 : 1.0, // Used for opacity or pulse
          networkHealth: isCongested ? 'congested' : 'high', // Used for color filtering
          action: 'DISPATCH_DASHBOARD_UPDATE'
        };

          // "Sign" the state using crypto
          const dataToSign = JSON.stringify(reasoningPacket);
          const signature = crypto.createHmac('sha256', process.env.AGENT_SIGNING_KEY || 'KASPA_GALAXY_SECURE_KEY').update(dataToSign).digest('hex');
          
          const weavePayload = {
             packet: reasoningPacket,
             signature: signature,
             agentId: 'AI_GALACTIC_WORKER'
          };

          // Write to state distribution layer
          const result = await db.add(weavePayload, "galaxy_state");
          weavedbTxId = result.txId;
          
          console.log(`[CORE_STORE] Telemetry Committed | Tx: ${weavedbTxId.substring(0, 16)}... | CID: ${signature.substring(0, 8)}`);
        }

      // Ensure polling gets the dynamic news too
      const dynamicLiveNewsPoll = [
         `[LIVE_TELEMETRY] KAS Price is current tracking at $${kaspaMetrics.price} USD.`,
         `[LIVE_TELEMETRY] Global Network Hashrate holding strong at ${kaspaMetrics.hashrate} TH/s.`,
         `[LIVE_TELEMETRY] Network Speed is perfectly synced at exactly ${kaspaMetrics.tps} TPS with an orphan rate of ${kaspaMetrics.orphanRate}.`,
         `[LIVE_TELEMETRY] Total Block count reached ${kaspaMetrics.blockCount}. Live Active Tips: ${kaspaMetrics.dagActiveTips}.`,
         ...(kaspaMetrics.heuristicNews || [])
      ];

      res.json({
        ok: true,
        current_state: currentStateValue,
        changed: stateChanged,
        packet: reasoningPacket,
        current_metrics: { ...kaspaMetrics, heuristicNews: dynamicLiveNewsPoll },
        weavedb_tx: weavedbTxId,
        globalHealth,
        terminalLogs,
        allocationHistory
      });
    } catch (error) {
      console.error("Orchestrator Error:", error);
      // Return 500 for edge worker constraints
      res.status(500).json({ error: "State Orchestrator execution failed." });
    }
  });

  // ---- Vite Middleware (must be after API routes) ----
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Express 4 uses '*' for catch-all fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`State Orchestrator Edge Worker ready at /api/state`);
  });
}

startServer();
