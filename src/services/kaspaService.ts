
import * as THREE from 'three';

// ---- Kaspa Discovery Logic (Client-Side) ----

// Persistent Client-Side Memory for Telemetry Stability
let priceCache = 0;
let priceChangeCache: number | null = null;
let marketCapCache = 0;

async function resilientFetch(url: string, isCritical = false, isRaw = false) {
  try {
    // 1. Direct fetch attempt without strict-breaking query params
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) return isRaw ? await response.text() : await response.json();
    throw new Error('Direct fetch failed');
  } catch (err) {
    try {
      // 2. Fallback to our own dedicated backend proxy to bypass arbitrary CORS/third-party rate limits
      // We encode the URL. The cache-busting is handled by our backend proxy securely.
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl, { cache: 'no-store' });
      if (proxyResponse.ok) {
        return isRaw ? await proxyResponse.text() : await proxyResponse.json();
      }
    } catch (proxyErr) {
      if (isCritical) {
        console.error(`[TELEMETRY] Critical link failure for ${url}`, proxyErr);
      } else {
        console.warn(`[TELEMETRY] Backup source unavailable: ${url}`);
      }
    }
    return null;
  }
}

export async function fetchLiveNews() {
  const rssUrl = 'https://news.google.com/rss/search?q=Kaspa+crypto+update+when:7d&hl=en-US&gl=US&ceid=US:en';
  try {
    const xml = await resilientFetch(rssUrl, false, true);
    if (!xml) return STATION_LOGS;

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const items = Array.from(doc.querySelectorAll("item")).slice(0, 5);
    
    if (items.length === 0) return STATION_LOGS;

    return items.map(item => {
      const title = item.querySelector("title")?.textContent || "";
      const cleanTitle = title.split(' - ')[0].split(' | ')[0];
      return `[MARKET_INTEL]: ${cleanTitle}`;
    });
  } catch (e) {
    return STATION_LOGS;
  }
}

export async function fetchKaspaStats() {
  try {
    const urls = {
      price: 'https://api.kaspa.org/info/price',
      marketcap: 'https://api.kaspa.org/info/marketcap',
      kucoin: 'https://api.kucoin.com/api/v1/market/stats?symbol=KAS-USDT',
      network: 'https://api.kaspa.org/info/network',
      hashrate: 'https://api.kaspa.org/info/hashrate',
      halving: 'https://api.kaspa.org/info/halving',
      blockdag: 'https://api.kaspa.org/info/blockdag'
    };

    // Parallel fetch with individual error boundaries to ensure incremental loading
    const stats = await Promise.allSettled([
      resilientFetch(urls.price, true),
      resilientFetch(urls.marketcap),
      // Use cache-busting exclusively for Kucoin since it gets stuck
      resilientFetch(`${urls.kucoin}&_t=${Date.now()}`),
      resilientFetch(urls.network, true),
      resilientFetch(urls.hashrate),
      resilientFetch(urls.halving),
      resilientFetch(urls.blockdag, true),
      fetchLiveNews()
    ]);

    const results = stats.map(s => s.status === 'fulfilled' ? s.value : null);
    const [price, mc, kucoinData, net, hash, halv, bdag, news] = results;

    // Use KuCoin for instant, rate-limit free actual trading price natively (open CORS)
    if (kucoinData?.data?.last) {
       priceCache = parseFloat(kucoinData.data.last);
       if (kucoinData.data.changeRate !== undefined && kucoinData.data.changeRate !== null) {
          priceChangeCache = parseFloat(kucoinData.data.changeRate) * 100;
       }
    } else if (price?.price) {
       priceCache = price.price;
    }

    const priceChange24h = priceChangeCache;

    const rawMarketCap = mc?.marketCap || mc?.marketcap || 0;
    marketCapCache = typeof rawMarketCap === 'string' ? parseFloat(rawMarketCap) : rawMarketCap;

    const rawDifficulty = bdag?.difficulty || bdag?.difficultyValue || 0;
    const difficulty = typeof rawDifficulty === 'string' ? parseFloat(rawDifficulty) : rawDifficulty;

    const rawHashrate = hash?.hashrate || hash?.hashRate || 0;
    const hashrate = typeof rawHashrate === 'string' ? parseFloat(rawHashrate) : rawHashrate;

    const metrics = {
       price: priceCache,
       priceChange24h: priceChange24h,
       marketCap: marketCapCache,
       difficulty: difficulty,
       hashrate: hashrate,
       blockCount: bdag?.blockCount || bdag?.blockcount || "0",
       mempoolSize: net?.mempoolSize || net?.mempoolsize || 0,
       tps: (net?.tps || 0.1),
       nextHalvingDate: halv?.nextHalvingDate || "",
       dagActiveTips: bdag?.dagActiveTips || 0,
       orphanRate: bdag?.orphanRate || bdag?.orphanrate || "0.00%",
       lastSyncTime: new Date().toISOString(),
       ambientTheme: getSeasonalAudio(),
       heuristicNews: news
    };

    // Synthesize Packet for 3D Nodes
    const packet = {
       polw: {
          nodes: {
             'dag-visualizer': { confidence: 0.98, status: 'synced' },
             'hashrate-monitor': { confidence: bdag ? 1.0 : 0.4, status: bdag ? 'active' : 'recovering' }
          },
          dominantNode: 'dag-visualizer'
       },
       networkHealth: (bdag?.difficulty > 0) ? 'optimal' : 'degraded'
    };

    return { metrics, packet };
  } catch (e) {
    console.error("Kaspa Telemetry Failed:", e);
    return null;
  }
}

export function getSeasonalAudio() {
  const month = new Date().getMonth();
  let season = "Winter", stream = "https://stream.radio.co/s919e54210/listen", vibe = "Lo-Fi Orbit", station = "Interstellar Lo-Fi";
  
  if (month >= 2 && month <= 4) {
    season = "Spring";
    stream = "https://streamer.radio.co/s919e54210/listen"; 
    vibe = "Afrobeat N1 Hits";
    station = "Naija Signal-1";
  } else if (month >= 5 && month <= 7) {
    season = "Summer";
    stream = "https://stream.bigfm.de/dancehall/mp3-128/radio-browser";
    vibe = "Amapiano Dancehall";
    station = "Big FM Dancehall";
  } else if (month >= 8 && month <= 10) {
    season = "Autumn";
    stream = "https://stream.flavorjamz.com/stream.mp3";
    vibe = "Afrofusion Vibes";
    station = "Flavor Jamz Radio";
  }
  
  return { season, stream, vibe, station };
}

export const STATION_LOGS = [
  "[STATION_IDLE]: Monitoring live BlockDAG pulse. Awaiting signal sync.",
  "[STATION_IDLE]: Network heartbeat active. Establishing telemetry link.",
  "[STATION_IDLE]: Orbital relays in standby. Scanning decentralized pathways.",
  "[STATION_IDLE]: Data synchronization in progress. Preparing HUD feed."
];
