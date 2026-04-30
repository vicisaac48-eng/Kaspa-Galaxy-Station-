
import * as THREE from 'three';
import { getApiBaseUrl } from '../lib/api';

// ---- Kaspa Discovery Logic (Client-Side) ----

// Persistent Client-Side Memory for Telemetry Stability
let priceCache = 0;
let priceChangeCache: number | null = null;
let marketCapCache = 0;
let networkCache: any = null;
let hashrateCache = 0;
let blockdagCache: any = null;

async function resilientFetch(url: string, isCritical = false, isRaw = false, timeoutMs = 8000) {
  const needsProxy = url.includes('kucoin') || url.includes('coingecko') || url.includes('mexc') || url.includes('google.com/rss');
  
  const fetchWithTimeout = async (targetUrl: string, options: any) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(targetUrl, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  if (needsProxy) {
    try {
      const baseUrl = getApiBaseUrl();
      const proxyUrl = `${baseUrl}/api/proxy?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetchWithTimeout(proxyUrl, { cache: 'no-store' });
      if (proxyResponse.ok) {
        return isRaw ? await proxyResponse.text() : await proxyResponse.json();
      }
    } catch (e) {
      // Slient fail for telemetry
    }
    return null;
  }

  try {
    // Direct fetch for Kaspa API
    const response = await fetchWithTimeout(url, { cache: 'no-store' });
    if (response.ok) return isRaw ? await response.text() : await response.json();
    throw new Error(`Direct fetch failed with status ${response.status}`);
  } catch (err) {
    try {
      const baseUrl = getApiBaseUrl();
      const proxyUrl = `${baseUrl}/api/proxy?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetchWithTimeout(proxyUrl, { cache: 'no-store' });
      if (proxyResponse.ok) {
        return isRaw ? await proxyResponse.text() : await proxyResponse.json();
      }
    } catch (proxyErr) {
      // Silent fail
    }
    return null;
  }
}

export async function fetchLiveNews() {
  try {
    const baseUrl = getApiBaseUrl();
    const [rssResponse, xIntelResponse] = await Promise.allSettled([
      resilientFetch('https://news.google.com/rss/search?q=Kaspa+crypto+update+when:24h&hl=en-US&gl=US&ceid=US:en', false, true, 5000),
      fetch(`${baseUrl}/api/intel/x`).then(r => r.json())
    ]);

    const xml = rssResponse.status === 'fulfilled' ? rssResponse.value : null;
    const xIntel = xIntelResponse.status === 'fulfilled' ? xIntelResponse.value : [];
    
    let rssNews: string[] = [];
    if (xml) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const items = Array.from(doc.querySelectorAll("item")).slice(0, 4);
      
      rssNews = items.map(item => {
        const title = item.querySelector("title")?.textContent || "";
        const cleanTitle = title.split(' - ')[0].split(' | ')[0];
        return `[MARKET_INTEL]: ${cleanTitle}`;
      });
    }

    const combined = [...xIntel, ...rssNews];
    return combined.length > 0 ? combined.slice(0, 12) : STATION_LOGS;
  } catch (e) {
    return STATION_LOGS;
  }
}

export async function fetchKaspaStats() {
  try {
    // Using multiple community APIs for redundancy
    const endpoints = [
      'https://api.kaspa.org',
      'https://api.kaspanet.io'
    ];

    const statsPromises = endpoints.flatMap(endpoint => [
      resilientFetch(`${endpoint}/info/price`),
      resilientFetch(`${endpoint}/info/marketcap`),
      resilientFetch(`${endpoint}/info/network`),
      resilientFetch(`${endpoint}/info/hashrate`),
      resilientFetch(`${endpoint}/info/halving`),
      resilientFetch(`${endpoint}/info/blockdag`)
    ]);

    const [news, coingecko, mexc, kucoin, ...kaspaResults] = await Promise.allSettled([
      fetchLiveNews(),
      resilientFetch('https://api.coingecko.com/api/v3/simple/price?ids=kaspa&vs_currencies=usd&include_24hr_change=true&include_market_cap=true', false, false, 4000),
      resilientFetch('https://api.mexc.com/api/v3/ticker/24hr?symbol=KASUSDT', false, false, 4000),
      resilientFetch('https://api.kucoin.com/api/v1/market/stats?symbol=KAS-USDT', false, false, 4000),
      ...statsPromises
    ]);

    const results = kaspaResults.map(s => s.status === 'fulfilled' ? s.value : null);
    
    // Aggregate results from redundant endpoints
    const pickFirst = (index: number) => results[index] || results[index + 6];

    let price = pickFirst(0);
    let mc = pickFirst(1);
    let net = pickFirst(2);
    let hash = pickFirst(3);
    let halv = pickFirst(4);
    let bdag = pickFirst(5);

    const cg = coingecko.status === 'fulfilled' ? coingecko.value : null;
    const m = mexc.status === 'fulfilled' ? mexc.value : null;
    const k = kucoin.status === 'fulfilled' ? kucoin.value : null;
    const n = news.status === 'fulfilled' ? news.value : STATION_LOGS;

    // --- Price & Change Logic ---
    if (price?.price) {
      priceCache = price.price;
    }
    
    // Prioritize Coingecko for 24h change as it's the primary source
    if (cg?.kaspa) {
      if (cg.kaspa.usd) priceCache = cg.kaspa.usd;
      if (cg.kaspa.usd_24h_change !== undefined) {
        priceChangeCache = cg.kaspa.usd_24h_change;
      }
      if (cg.kaspa.usd_market_cap) {
        marketCapCache = cg.kaspa.usd_market_cap;
      }
    }

    // Fallback for 24h change from MEXC or Kucoin if Coingecko is missing
    if (priceChangeCache === null || priceChangeCache === 0) {
      if (m && m.priceChangePercent) {
        priceChangeCache = parseFloat(m.priceChangePercent);
      } else if (k && k.data && k.data.changeRate) {
        priceChangeCache = parseFloat(k.data.changeRate) * 100;
      }
    }

    // --- Market Cap Logic ---
    const rawMarketCap = mc?.marketcap || mc?.marketCap || marketCapCache;
    if (rawMarketCap) marketCapCache = typeof rawMarketCap === 'string' ? parseFloat(rawMarketCap) : rawMarketCap;

    // --- Network & Hashrate Cache ---
    if (net) networkCache = net;
    if (hash) {
      const rawHash = hash?.hashrate || hash?.hashRate;
      if (rawHash) hashrateCache = typeof rawHash === 'string' ? parseFloat(rawHash) : rawHash;
    }
    if (bdag) blockdagCache = bdag;

    // --- Metrics Synthesis (Always use cache as fallback to prevent blackout) ---
    const metrics = {
       price: priceCache,
       priceChange24h: priceChangeCache,
       marketCap: marketCapCache,
       difficulty: parseFloat(blockdagCache?.difficulty || blockdagCache?.difficultyValue || "0"),
       hashrate: hashrateCache,
       blockCount: blockdagCache?.blockCount || blockdagCache?.blockcount || "0",
       mempoolSize: networkCache?.mempoolSize || networkCache?.mempoolsize || 0,
       tps: (networkCache?.tps || 10.0),
       nextHalvingDate: halv?.nextHalvingDate || "",
       dagActiveTips: blockdagCache?.dagActiveTips || 0,
       orphanRate: blockdagCache?.orphanRate || blockdagCache?.orphanrate || "0.00%",
       lastSyncTime: new Date().toISOString(),
       ambientTheme: getSeasonalAudio(),
       heuristicNews: n || (priceCache > 0 ? ["[RESONANCE_DATA]: Frequency synchronization stable.", "[RESONANCE_DATA]: Spectral baseline within expected DAG parameters."] : STATION_LOGS)
    };

    const packet = {
       polw: {
          nodes: {
             'KaspaREST': { confidence: blockdagCache ? 0.98 : 0.0, status: blockdagCache ? 'SYNERGY' : 'SYNCING', latency: 420 },
             'KaspaHashrate': { confidence: hashrateCache > 0 ? 1.0 : 0.0, status: hashrateCache > 0 ? 'ACTIVE' : 'IDLE', latency: 120 },
             'KaspaHalving': { confidence: 0.95, status: 'STABLE', latency: 850 }
          },
          dominantNode: 'KaspaHashrate'
       },
       networkHealth: (metrics.hashrate > 0) ? 'optimal' : 'degraded',
       realMetrics: { tps: metrics.tps || 0.1 }
    };

    return { metrics, packet };
  } catch (e) {
    // Even on error, try to return a dummy state that doesn't trigger "VOICE_RESONANCE_DATA" blackout
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
  "[STATION_IDLE]: Monitoring live BlockDAG pulse. Scanning decentralized social nodes.",
  "[STATION_IDLE]: Network heartbeat active. Establishing planetary sentiment link.",
  "[STATION_IDLE]: Orbital relays in standby. Processing decentralized social signals.",
  "[STATION_IDLE]: Data synchronization in progress. Node Intelligence feed ready."
];
