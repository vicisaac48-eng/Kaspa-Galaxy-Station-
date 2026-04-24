import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Html, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { playSelectSound } from './lib/audio';
import { fetchKaspaStats, STATION_LOGS, getSeasonalAudio } from './services/kaspaService';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { VolumeX, Radio, Zap, Settings, X, Volume2, Bell, BellOff } from 'lucide-react';

interface KaspaMetrics {
  tps: number;
  difficulty: number;
  hashrate: number;
  price: number;
  priceChange24h: number | null;
  marketCap: number;
  lastSyncTime: string;
  news?: any[];
  transactions?: any[];
  heuristicNews?: string[];
  ambientTheme?: {
    season: string;
    stream: string;
    vibe: string;
    station: string;
  };
}

interface StationState {
  current_metrics: KaspaMetrics;
}

function HorizontalNewsTicker({ newsItems, isProcessing }: { newsItems: string[], isProcessing: boolean }) {
  if (isProcessing) {
    return (
      <div className="flex-1 overflow-hidden h-[12px] relative flex items-center">
        <div className="text-[9px] text-white/70 font-medium tracking-tight animate-pulse">
           SYSTEM_INITIALIZING: CONNECTING_GLOBAL_SIGNALS...
        </div>
      </div>
    );
  }

  // Join the AI news updates cleanly to allow smooth horizontal marquee
  const combinedNews = newsItems.length > 0 ? newsItems.join(" • ") : "[NO SIGNAL]";

  return (
    <div className="flex-1 overflow-hidden h-[12px] relative flex items-center w-full">
      <div className="whitespace-nowrap text-[9px] text-white/70 font-medium tracking-tight animate-marquee inline-block">
        {combinedNews} • {combinedNews}
      </div>
    </div>
  );
}

function MasterDetailsPanel({ data, subType, typeColor, stats, agentData, fullState, onClose, onInteractionState, className, isMobile }: any) {
  return (
    <div className="relative group z-[200]">
      {/* High-Precision Technical Tether (Professional HUD Anchoring) */}
      {isMobile ? (
        <div className="absolute left-1/2 -bottom-4 w-[1px] h-4 bg-blue-500/60 -translate-x-1/2 flex items-center justify-center">
           <div className="w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_white]" />
        </div>
      ) : (
        <div className="absolute -left-12 -bottom-12 w-[1px] h-[72px] bg-blue-500/40 origin-top rotate-[45deg] flex items-center justify-center">
           <div className="absolute bottom-0 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_12px_#60a5fa] animate-pulse" />
           <div className="absolute top-0 w-full h-full bg-linear-to-b from-blue-500/0 to-blue-500/60" />
        </div>
      )}

      <div 
        onPointerDown={(e) => {
          e.stopPropagation();
          onInteractionState?.(true);
        }}
        onPointerUp={() => onInteractionState?.(false)}
        onPointerLeave={() => onInteractionState?.(false)}
        className={`bg-[#0c0c14]/90 border border-blue-500/30 rounded-lg p-2 md:p-5 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col gap-1.5 md:gap-4 text-left transition-all duration-500 overflow-hidden border-t-2 border-t-blue-500 max-h-[35vh] md:max-h-none ${className}`}
      >
      <div className="flex justify-between items-center border-b border-white/10 pb-1 md:pb-3">
        <div className="flex flex-col text-left">
          <span className={`text-[6px] md:text-[9px] ${typeColor === 'blue' ? 'text-blue-300' : 'text-emerald-300'} font-mono tracking-[0.2em] uppercase font-bold`}>{subType}</span>
          <span className={`text-[9px] md:text-[18px] text-white tracking-[0.05em] font-black uppercase`}>{(data.title || data.label || "").replace(/_/g, ' ')}</span>
        </div>
        <button 
          onClick={(e) => { 
            playSelectSound();
            e.stopPropagation(); 
            onClose();
          }}
          className="p-1 bg-white/5 rounded border border-white/10 text-white/40 hover:text-white transition-all flex items-center justify-center"
        >
          <svg className="w-2 md:w-3.5 h-2 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-2 md:gap-4">
        <div className="text-[8px] md:text-[14px] text-white/80 font-medium leading-[1.3]">
          {data.desc}
        </div>
        
        {/* Compact Details on Mobile */}
        <div className="text-[7.5px] md:text-[13px] text-blue-200/60 font-light bg-blue-500/5 p-1.5 md:p-3 rounded border border-blue-500/10 italic">
          "{data.details}"
        </div>

        {/* Technical Specs Table (Hidden on mobile to save critical space) */}
        {data.specs && !isMobile && (
          <div className="flex flex-col gap-2 md:gap-2 bg-white/5 p-3 md:p-3 rounded-lg border border-white/10">
            <span className="text-[8px] md:text-[9px] text-blue-400/60 font-mono uppercase tracking-widest pl-1">Technical_Specifications</span>
            <div className="grid grid-cols-1 gap-1">
              {data.specs.map((spec: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-[10px] md:text-[11px] font-mono py-1.5 border-b border-white/5 last:border-0 uppercase">
                  <span className="text-white/40">{spec.key}</span>
                  <span className="text-white font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live TPS Metrology */}
        {subType === "PROTOCOL_LAYER" && (
          <div className="flex flex-col gap-2 md:gap-2">
            <span className="text-[8.5px] md:text-[9px] text-blue-400 font-mono uppercase tracking-widest pl-1 flex items-center gap-2">
              <Zap className="w-2.5 h-2.5 animate-pulse" /> Live_TPS_Pulse
            </span>
            <div className="h-16 md:h-20 bg-black/30 rounded-lg p-1 border border-white/5">
               <TpsChart currentTps={agentData?.realMetrics?.tps || 0.1} />
            </div>
          </div>
        )}

        {/* On-Chain Transaction Feed (Hidden on mobile) */}
        {fullState?.current_metrics?.transactions && !isMobile && (
          <div className="bg-black/90 rounded-lg p-3 md:p-3 border border-white/10 flex flex-col gap-1.5 h-[120px] md:h-[130px] overflow-hidden relative">
             <span className="text-[8.5px] md:text-[9px] text-emerald-400 font-mono uppercase tracking-widest sticky top-0 bg-black/90 z-10 py-1 flex items-center gap-2">
               <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE_CHAIN_DATA
             </span>
             <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
                {fullState.current_metrics.transactions.map((tx: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] md:text-[10px] font-mono border-b border-white/5 pb-1.5 last:border-0">
                    <span className="text-white/40 truncate w-32">{tx.hash.substring(0, 16)}...</span>
                    <span className="text-emerald-400 font-bold">{tx.amount} KAS</span>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Essential Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mt-1">
          <div className="bg-white/10 p-2 md:p-3 rounded-lg border border-white/20">
            <span className="text-[7.5px] md:text-[9px] text-white/50 uppercase font-mono block mb-1">
              {data.planet === 'Jupiter' ? 'LATENCY_MODE' : (stats ? 'PING' : 'NETWORK')}
            </span>
            <span className="text-[10px] md:text-[12px] text-white font-mono block font-bold">
              {data.planet === 'Jupiter' ? 'ADAPTIVE' : (stats ? `${stats.latency}ms` : '10 BPS')}
            </span>
          </div>
          <div className="bg-white/10 p-2 md:p-3 rounded-lg border border-white/20 text-right">
            <span className="text-[7.5px] md:text-[9px] text-white/50 uppercase font-mono block mb-1">
               {data.planet === 'Earth' ? 'THROUGHPUT' : (data.planet === 'Mars' ? 'HASHRATE' : 'STATUS')}
            </span>
            <span className={`text-[10px] md:text-[12px] ${stats && stats.confidence === 0 ? 'text-red-400' : 'text-blue-400'} font-mono block uppercase font-bold truncate`}>
               {data.planet === 'Earth' ? `${(agentData?.realMetrics?.tps || fullState?.current_metrics?.tps || 0.1).toFixed(1)} TPS` : 
                (data.planet === 'Mars' ? `${(fullState?.current_metrics?.hashrate/1000 || 0).toFixed(1)} PH/s` : 
                (data.status || (stats && stats.confidence === 0 ? 'Offline' : 'Active')))}
            </span>
          </div>
        </div>

        {/* Essential Metrics Grid - Row 2 (Difficulty & Hashrate) */}
        <div className="grid grid-cols-2 gap-3 md:gap-3 mt-0.5 pb-4">
          <div className="bg-white/10 p-3 rounded-lg border border-white/20">
            <span className="text-[8.5px] md:text-[9px] text-white/50 uppercase font-mono block mb-1.5">
              DIFFICULTY
            </span>
            <span className="text-[11px] md:text-[12px] text-white font-mono block font-bold">
              {fullState?.current_metrics?.difficulty ? Number(fullState.current_metrics.difficulty).toPrecision(4) : '---'}
            </span>
          </div>
          <div className="bg-white/10 p-3 rounded-lg border border-white/20 text-right">
            <span className="text-[8.5px] md:text-[9px] text-white/50 uppercase font-mono block mb-1.5">
               NETWORK_HASH
            </span>
            <span className="text-[11px] md:text-[12px] text-white font-mono block font-bold">
               {fullState?.current_metrics?.hashrate ? (fullState.current_metrics.hashrate/1000).toFixed(2) + ' PH/s' : '---'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-[6px] md:text-[10px] text-white/20 uppercase tracking-[0.25em] text-center pt-0.5 md:pt-4 font-mono border-t border-white/10">
        v2.2_STATION
      </div>
    </div>
  </div>
  );
}

function TpsChart({ currentTps }: { currentTps: number }) {
  const [data, setData] = useState<{ time: string, tps: number }[]>([]);

  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    setData(prev => {
      const newData = [...prev, { time: timeStr, tps: currentTps || 0 }];
      if (newData.length > 20) return newData.slice(1);
      return newData;
    });
  }, [currentTps]);

  return (
    <div className="w-full h-full bg-black/40 rounded border border-white/5 p-0.5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '8px' }} 
            itemStyle={{ color: '#60a5fa' }}
            labelStyle={{ display: 'none' }}
          />
          <Line 
            type="monotone" 
            dataKey="tps" 
            stroke="#60a5fa" 
            strokeWidth={1.5} 
            dot={false} 
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const SUN_DATA = {
  title: 'KASPA_BLOCKDAG_CORE',
  desc: 'The world\'s first scalable PoW digital asset engine.',
  details: 'Kaspa is a proof-of-work cryptocurrency which implements the PHANTOM GHOSTDAG protocol. Unlike traditional blockchains, GHOSTDAG does not orphan blocks created in parallel. Instead, it allows them to coexist and orders them in consensus. This enables 10 blocks per second today, and much more in the near future, while maintaining the security level of Bitcoin.'
};

const KASPA_MODULES = [
  { 
    title: 'MERCURY_PROTOCOL', 
    planet: 'Mercury',
    desc: 'The innermost layer of the consensus engine.', 
    details: 'Approximating the core speed of GHOSTDAG. Mercury represents the high-frequency edge nodes that require sub-second synchronization to maintain the 10bps block cadence.',
    color: '#8c8c94',
    specs: [
      { key: 'Cadence', value: '1.0s (10 BPS)' },
      { key: 'Algorithm', value: 'PHANTOM_GHOST' },
      { key: 'Sync_Threshold', value: '500ms' }
    ],
    status: 'OPTIMAL_BPS'
  },
  { 
    title: 'VENUS_CONSENSUS', 
    planet: 'Venus',
    desc: 'Sulfuric high-pressure ordering logic.', 
    details: 'Venus handles the heavy matrix multiplication of kHeavyHash. Its high atmospheric pressure reflects the computational density required for Kaspa\'s optical ASIC efficiency.',
    color: '#e3bb76',
    specs: [
      { key: 'Algorithm', value: 'kHeavyHash' },
      { key: 'Security', value: 'ASIC_HARDENED' },
      { key: 'Hash_Power', value: 'Secured_PoW' }
    ],
    status: 'ASIC_SECURED'
  },
  { 
    title: 'EARTH_BLOCKDAG', 
    planet: 'Earth',
    desc: 'The living ledger of the global network.', 
    details: 'The primary settlement layer where 10bps throughput meets real-world utility. Earth serves as the standard for decentralized security and fair token distribution.',
    color: '#2b82c9',
    specs: [
      { key: 'Throughput', value: '100 BPS Ready' },
      { key: 'Topology', value: 'DAG (BlockDAG)' },
      { key: 'Utility', value: 'Daily_Settlement' }
    ],
    status: 'LIVE_TPS'
  },
  { 
    title: 'MARS_ARCHIVAL', 
    planet: 'Mars',
    desc: 'Rusty Kaspa high-performance node.', 
    details: 'Mars represents the transition from Go to Rust. Its iron-rich surface mirrors the industrial-grade performance needed to process tens of thousands of transactions per second.',
    color: '#c1440e',
    specs: [
      { key: 'Core_Engine', value: 'Rusty-Kaspad' },
      { key: 'Concurrency', value: 'Lock-Free' },
      { key: 'Performance', value: 'High_Bandwidth' }
    ],
    status: 'RUST_NODE_STABLE'
  },
  { 
    title: 'JUPITER_KNIGHT', 
    planet: 'Jupiter',
    desc: 'The gas giant of consensus protocols.', 
    details: 'DAGKnight: The first parameterless protocol. Jupiter\'s massive scale represents the infinite scalability of Kaspa, automatically adapting to any network latency.',
    color: '#c9906d',
    specs: [
      { key: 'Protocol', value: 'DAGKnight' },
      { key: 'Adaptivity', value: 'Parameterless' },
      { key: 'Scalability', value: 'Near-Infinite' }
    ],
    status: 'ADAPTIVE_LATENCY'
  },
  { 
    title: 'SATURN_PRUNING', 
    planet: 'Saturn',
    desc: 'Ringed history compression layer.', 
    details: 'Saturn\'s rings symbolize the periodic pruning cycles. It keeps the node state lightweight by discarding old data while maintaining proof of the entire historical record.',
    color: '#ebd496',
    specs: [
      { key: 'Retention', value: '24h_Pruning' },
      { key: 'DB_Engine', value: 'LevelDB_Optimized' },
      { key: 'Efficiency', value: 'Header-Only' }
    ],
    status: 'DATA_PRUNED'
  },
  { 
    title: 'URANUS_TRANSPORT', 
    planet: 'Uranus',
    desc: 'Cool-flowing P2P propagation layer.', 
    details: 'Advanced P2P discovery and bandwidth management. Uranus ensures that blocks are propagated across the galaxy at near-light speeds to support the 100bps roadmap.',
    color: '#93caed',
    specs: [
      { key: 'P2P_Version', value: 'v2.0_RPC' },
      { key: 'Propagation', value: 'Multicast_Mesh' },
      { key: 'Discovery', value: 'Kademlia_Based' }
    ],
    status: 'PEER_CONNECTED'
  },
  { 
    title: 'NEPTUNE_SMART', 
    planet: 'Neptune',
    desc: 'Deep-ocean smart contract integration.', 
    details: 'Upcoming EVM compatibility and L2 scaling solutions. Neptune represents the deep potential of Kaspa\'s programmable settlement layer for DeFi and DAOs.',
    color: '#3f54ba',
    specs: [
      { key: 'Framework', value: 'SmartDAG' },
      { key: 'EVM', value: 'Upcoming_Compatibility' },
      { key: 'Layering', value: 'L2_Rollups' }
    ],
    status: 'RESEARCH_DEVELOPMENT'
  },
  { 
    title: 'PLUTO_GENESIS', 
    planet: 'Pluto',
    desc: 'The distant sentinel of the 2021 genesis.', 
    details: 'Pluto guards the historical 2021 genesis data. Though distant, it remains a vital anchor for the network\'s historical integrity and long-term immutability.',
    color: '#d1b1a5',
    specs: [
      { key: 'Genesis', value: 'Nov_7_2021' },
      { key: 'Max_Supply', value: '28.7B KAS' },
      { key: 'Emission', value: 'Chromatic_Halving' }
    ],
    status: 'IMMUTABLE_GENESIS'
  }
];

const FLOATING_NODES = [
  { 
    id: 'KaspaREST', 
    pos: [35, 12, 5], 
    label: 'DEEP_SPACE_RELAY_A',
    desc: 'High-speed archival rpc bridge.',
    details: 'Deep space telemetry node orbiting near the outer planets. Maintains sub-second GHOSTDAG resolution for deep-spectrum synchronization.' 
  },
  { 
    id: 'KaspaHashrate', 
    pos: [-28, -12, 18], 
    label: 'DEEP_SPACE_RELAY_B',
    desc: 'Primary PoW orchestration gateway.',
    details: 'Managing cross-galactic mining hashrate. Ensures block-template delivery within the tight 10bps window across all planetary modules.'
  },
  { 
    id: 'KaspaHalving', 
    pos: [12, 22, -30], 
    label: 'DEEP_SPACE_RELAY_C',
    desc: 'Global history ledger preservation.',
    details: 'High-altitude deep storage node containing the complete BlockDAG history. Vital for the upcoming archival pruning upgrades.'
  }
];

const CAMERA_SETTINGS = {
  home: { mobile: { x: 0, y: 120, z: 140 }, desktop: { x: 0, y: 65, z: 105 } },
  follow: { lerp: 0.15, posLerp: 0.12 },
  idle: { lerp: 0.08, posLerp: 0.06 }
};

function CameraController({ focusTarget, selectedId, isMobile }: { focusTarget: THREE.Vector3 | null, selectedId: string | null, isMobile: boolean }) {
  const { camera, controls, scene } = useThree<any>();
  const lastTarget = useRef(new THREE.Vector3());
  const activeFocusId = useRef<string | null>(null);

  // One-time transitions for non-moving targets or Home reset
  useEffect(() => {
    if (!controls) return;
    
    if (!selectedId) {
      activeFocusId.current = null;
      // Push camera back drastically to see the outermost planets (Pluto is at distance 81)
      const homePos = isMobile ? CAMERA_SETTINGS.home.mobile : CAMERA_SETTINGS.home.desktop;
      
      gsap.to(camera.position, {
        ...homePos,
        duration: 4, // beautiful, smooth
        ease: "power3.inOut"
      });
      gsap.to(controls.target, {
        x: 0, y: 0, z: 0,
        duration: 4,
        ease: "power3.inOut"
      });
    }
  }, [selectedId, controls, camera]);

  // Live Follow Loop (Only active when a moving planet/node is selected)
  useFrame((state) => {
    if (!controls || !selectedId) return;

    const targetObj = scene.getObjectByName(selectedId);
    if (targetObj) {
      const currentPos = new THREE.Vector3();
      targetObj.getWorldPosition(currentPos);
      
      // Reset tracking anchor on target switch
      if (activeFocusId.current !== selectedId) {
        activeFocusId.current = selectedId;
        lastTarget.current.copy(currentPos);
      }

      // Calculate dynamic ideal position
      const isMobile = state.size.width < 768;
      const isSun = selectedId === 'kaspa-sun' || currentPos.length() < 0.1;
      const dirVec = isSun ? new THREE.Vector3(0, 0, 1) : currentPos.clone().normalize();
      
      const dist = isSun ? (isMobile ? 35 : 25) : (isMobile ? 22 : 15);
      const idealPos = currentPos.clone().add(new THREE.Vector3(
        dirVec.x * dist,
        isSun ? 12 : (isMobile ? 14 : 9),
        dirVec.z * dist
      ));

      // Smoothly interpolate to the dynamic target (beautiful human intelligence glide)
      // High-performance liquid follow logic
      const isSelected = !!selectedId;
      const followLerp = isSelected ? CAMERA_SETTINGS.follow.lerp : CAMERA_SETTINGS.idle.lerp; 
      const posLerp = isSelected ? CAMERA_SETTINGS.follow.posLerp : CAMERA_SETTINGS.idle.posLerp;
      
      // Dynamic framing: move target UP on mobile to push the focused object DOWN on screen
      const focusPoint = currentPos.clone();
      if (isMobile && isSelected) {
        focusPoint.y += isSun ? 3 : 5;
      }

      controls.target.lerp(focusPoint, followLerp); 
      camera.position.lerp(idealPos, posLerp);

      lastTarget.current.copy(currentPos);
    }
  });

  return null;
}

function TimeScaleController({ isInteracting, timeScaleRef }: { isInteracting: boolean, timeScaleRef: React.MutableRefObject<number> }) {
  useFrame(() => {
    // Zero target on interaction for a complete freeze during reading, 
    // ensuring the panel stays locked to its visual target.
    const targetScale = isInteracting ? 0 : 1;
    timeScaleRef.current = THREE.MathUtils.lerp(timeScaleRef.current, targetScale, 0.1);
  });
  return null;
}

export default function App() {
  const [agentData, setAgentData] = useState<any>(null);
  const [fullState, setFullState] = useState<StationState>({
    current_metrics: {
      tps: 0.1,
      difficulty: 0,
      hashrate: 0,
      price: 0,
      priceChange24h: null,
      marketCap: 0,
      lastSyncTime: "",
      heuristicNews: [
        "[STATION_ONLINE]: Establishing direct BlockDAG uplink...",
        "[STATION_ONLINE]: Synchronizing telemetry pathways..."
      ],
      ambientTheme: getSeasonalAudio()
    }
  });
  const [intelligentNews, setIntelligentNews] = useState<string[]>([
    "[STATION_ONLINE]: Awaiting decentralized signal from Kaspa relays...",
    "[STATION_ONLINE]: Reconfirming cryptographic integrity of incoming news feed..."
  ]);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [isInteractingWithPanel, setIsInteractingWithPanel] = useState<boolean>(false);
  const timeScaleRef = useRef<number>(1);
  const [focusTarget, setFocusTarget] = useState<THREE.Vector3 | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const [isAutoTourMode, setIsAutoTourMode] = useState<boolean>(true); // Start fully auto
  const [tourIndex, setTourIndex] = useState<number>(-1);
  const tourTimeoutRef = useRef<any>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.20);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // Unified Resize Handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Safely mount audio element to avoid ref issues when dynamically switching src
  useEffect(() => {
    // Only create it once
    if (!audioRef.current) {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = volume;
        audio.crossOrigin = "anonymous";
        
        // Listen for errors to reset state
        audio.onerror = () => {
          console.warn("[AUDIO]: Stream connection interrupted. Ready for retry.");
          setAudioEnabled(false);
        };
        
        audioRef.current = audio;
    }
  }, []);

  // Attempt to autoplay music beautifully when state loads
  useEffect(() => {
    const startAudio = async () => {
      const audio = audioRef.current;
      if (!audio || !fullState?.current_metrics?.ambientTheme?.stream || audioEnabled) return;
      
      const streamUrl = fullState.current_metrics.ambientTheme.stream;
      if (audio.src !== streamUrl) {
          audio.src = streamUrl;
          audio.load();
      }
      
      try {
        playPromiseRef.current = audio.play();
        await playPromiseRef.current;
        setAudioEnabled(true);
      } catch (e) {
        console.log("Autoplay blocked or interrupted.");
      } finally {
        playPromiseRef.current = null;
      }
    };
    
    const t = setTimeout(startAudio, 1000);
    return () => clearTimeout(t);
  }, [fullState?.current_metrics?.ambientTheme?.stream]);

  const toggleAudio = async () => {
    playSelectSound();
    const audio = audioRef.current;
    if (!audio) return;
    
    // Explicitly handle Chrome/Safari user interaction requirements by attempting to resume context if needed
    if (audioEnabled) {
      audio.pause();
      setAudioEnabled(false);
    } else {
      const streamUrl = fullState?.current_metrics?.ambientTheme?.stream;
      if (!streamUrl) return;

      if (audio.src !== streamUrl) {
          audio.src = streamUrl;
          audio.load(); // Re-trigger load for the new source
      }
      
      try {
        // We use a simpler direct play call to ensure responsiveness
        await audio.play();
        setAudioEnabled(true);
      } catch (e) {
        console.warn("Audio Playback: Retrying with direct load...", e);
        // Force a reload and retry on failure
        audio.load();
        try {
           await audio.play();
           setAudioEnabled(true);
        } catch (err) {
           console.error("Audio playback total failure:", err);
           setAudioEnabled(false);
        }
      }
    }
  };

  // Sync volume safely
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [audioEnabled, volume]);
  
  // Auto Tour Orchestration
  const tourSequence = useMemo(() => {
    return [
      'kaspa-sun',
      ...KASPA_MODULES.map(m => m.title),
      ...FLOATING_NODES.map(n => n.id)
    ];
  }, []);

  useEffect(() => {
    if (!isAutoTourMode) {
       clearTimeout(tourTimeoutRef.current);
       setTourIndex(-1);
       return;
    }

    const gazeDuration = 10000; // Look and wait for user to read (10 seconds)
    const travelBackDuration = 4000; // Beautiful physical zoom out duration
    const waitBeforeNextDuration = 6000; // Wait and view the vast beautifully spinning galaxy
    
    if (tourIndex === -1) {
       // On initial load, wait a few seconds at the galaxy view before starting the tour!
       tourTimeoutRef.current = setTimeout(() => {
            setTourIndex(0);
       }, waitBeforeNextDuration);
       return;
    }

    const targetId = tourSequence[tourIndex];
    setSelectedObjectId(targetId);

    // 1. Look at the object
    tourTimeoutRef.current = setTimeout(() => {
        // 2. Deselect to reverse back to the global galaxy view
        setSelectedObjectId(null);
        
        // 3. Wait for travel back + waiting duration BEFORE selecting the next one
        tourTimeoutRef.current = setTimeout(() => {
            setTourIndex(prev => {
                let next = prev + 1;
                if (next >= tourSequence.length) next = 0;
                return next;
            });
        }, travelBackDuration + waitBeforeNextDuration);

    }, gazeDuration);

    return () => clearTimeout(tourTimeoutRef.current);
  }, [isAutoTourMode, tourIndex, tourSequence]);

  // Poll the Kaspa Network Directly (Decentralized Architecture)
  useEffect(() => {
    const fetchTelemetry = async () => {
      const data = await fetchKaspaStats();
      if (data) {
        setFullState(prevState => ({ 
          current_metrics: {
            ...prevState.current_metrics,
            ...data.metrics,
            news: [], 
            heuristicNews: data.metrics.heuristicNews || STATION_LOGS
          }
        }));
        setAgentData(data.packet);
      }
    };

    fetchTelemetry(); // Initial burst
    const orchestratorPoll = setInterval(fetchTelemetry, 1500); 
    
    return () => clearInterval(orchestratorPoll);
  }, []);

  // Local News Synchronization (Balanced Visual Feedback)
  const heuristicNewsStr = JSON.stringify(fullState?.current_metrics?.heuristicNews || []);
  useEffect(() => {
    const heuristicNews = fullState?.current_metrics?.heuristicNews || STATION_LOGS;
    
    const syncNews = () => {
      // Remove intentional latency for instant-on behavior
      setIntelligentNews(heuristicNews);
      setIsAiProcessing(false);
    };

    syncNews();
  }, [heuristicNewsStr]);

  return (
    <div className="w-full h-[100dvh] bg-[#020205] overflow-hidden relative text-white font-sans">
      {/* Background Atmosphere */}
      <div className="nebula-bg" />
      
      {/* UI Overlay (Advanced Kaspa Branding) */}
      <div className="absolute top-safe pt-4 md:pt-10 left-4 md:left-10 w-fit z-50 pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="relative">
             <div className="absolute -inset-4 bg-blue-500/10 blur-xl rounded-full" />
             <h1 className="text-[20px] sm:text-[44px] md:text-[80px] font-black tracking-[-1px] md:tracking-[-4px] leading-[0.85] uppercase text-white m-0 drop-shadow-2xl">
               KASPA<br/>
               <span className="text-[8px] sm:text-[14px] md:text-[18px] tracking-[4px] sm:tracking-[6px] md:tracking-[10px] text-blue-400 font-mono mt-0.5 block font-medium">GALAXY STATION</span>
             </h1>
          </div>

          {/* Action Buttons (Music) */}
          <div className="flex items-center gap-2 mt-1">
            {/* Ambient Music Player */}
            {fullState?.current_metrics?.ambientTheme && (
              <button 
                onClick={toggleAudio}
                title={`${fullState.current_metrics.ambientTheme.season} Phase: ${fullState.current_metrics.ambientTheme.vibe}`}
                className="group pointer-events-auto flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md transition-all w-fit shadow-md"
              >
                 <div className={`transition-colors flex items-center justify-center ${audioEnabled ? 'text-blue-400' : 'text-white/40'}`}>
                    {audioEnabled ? <Radio size={14} className="animate-pulse" /> : <VolumeX size={14} />}
                 </div>
                 
                 {audioEnabled ? (
                   <div className="flex gap-[2px] items-end h-[10px] mr-1">
                       <div className="w-[2px] bg-blue-400/80 rounded-t-sm animate-[bounce_0.9s_infinite] h-[6px]" />
                       <div className="w-[2px] bg-blue-400/80 rounded-t-sm animate-[bounce_1.1s_infinite] h-[10px]" />
                       <div className="w-[2px] bg-blue-400/80 rounded-t-sm animate-[bounce_0.8s_infinite] h-[4px]" />
                   </div>
                 ) : (
                   <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider pr-1">Music</span>
                 )}
              </button>
            )}

            <button 
              onClick={() => { playSelectSound(); setIsSettingsOpen(true); }}
              className="pointer-events-auto bg-white/5 hover:bg-white/10 border border-white/10 rounded-full p-1.5 px-3 backdrop-blur-md transition-all shadow-md text-white/40 hover:text-white"
              title="System Preferences"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </div>



      {/* Market Telemetry - Top Right (Professional HUD Layout) */}
      {fullState?.current_metrics && (
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50 flex flex-col items-end gap-2 font-mono pointer-events-none select-none max-w-[200px] sm:max-w-none">
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg shadow-2xl border-r-4 border-r-blue-500">
            <div className="flex flex-col">
               <span className="text-[7px] text-blue-400 font-bold tracking-widest uppercase">MARKET_PRICE</span>
               <div className="flex items-baseline gap-1.5">
                  <span className="text-[12px] md:text-[14px] text-white font-black leading-none">
                    {fullState.current_metrics.price > 0 ? (
                      `$${fullState.current_metrics.price.toFixed(4)}`
                    ) : (
                      <span className="opacity-50 animate-pulse">$-.----</span>
                    )}
                  </span>
                  {fullState.current_metrics.price > 0 && typeof fullState.current_metrics.priceChange24h === 'number' && (
                    <span className={`text-[8px] font-bold ${fullState.current_metrics.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {fullState.current_metrics.priceChange24h >= 0 ? '▲' : '▼'}{Math.abs(fullState.current_metrics.priceChange24h).toFixed(2)}%
                    </span>
                  )}
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-1 w-full">
            <div className="flex justify-between items-center bg-white/5 border border-white/5 px-2 py-1 rounded">
               <span className="text-[6px] text-white/40 uppercase">Market Cap</span>
               <span className="text-[8px] text-white/80 font-bold">
                 {fullState.current_metrics.marketCap > 0 ? (
                   `$${(fullState.current_metrics.marketCap / 1e9).toFixed(2)}B`
                 ) : (
                   <span className="opacity-50 animate-pulse">$--.--B</span>
                 )}
               </span>
            </div>
            <div className="flex justify-between items-center bg-white/5 border border-white/5 px-2 py-1 rounded">
               <span className="text-[6px] text-white/40 uppercase">Hashrate</span>
               <span className="text-[8px] text-blue-400/80 font-bold">
                 {fullState.current_metrics.hashrate > 0 ? (
                   `${(fullState.current_metrics.hashrate / 1000).toFixed(2)} PH/s`
                 ) : (
                   <span className="opacity-50 animate-pulse">--.-- PH/s</span>
                 )}
               </span>
            </div>
            {fullState.current_metrics.lastSyncTime && (
              <div className="flex justify-end pr-1 mt-1">
                 <span className="text-[5px] text-white/20 uppercase tracking-[0.2em]">LiveData: {new Date(fullState.current_metrics.lastSyncTime).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Professional Signal News Feed - Bottom Full Width Ticker */}
      {fullState?.current_metrics?.news && (
        <div className="absolute bottom-0 left-0 w-full z-50 pointer-events-none pb-safe sm:pb-0">
           <div className="flex items-center gap-3 bg-black/80 backdrop-blur-xl px-4 py-2 sm:py-1.5 border-t border-blue-500/20 shadow-[0_-5px_30px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-2 border-r border-white/10 pr-3 shrink-0">
                 <div className={`w-1.5 h-1.5 ${isAiProcessing ? 'bg-amber-500' : 'bg-blue-500'} rounded-full animate-pulse shadow-[0_0_8px_currentColor]`} />
                 <span className="text-[8px] sm:text-[9px] text-blue-400 font-black tracking-widest uppercase hidden sm:inline">{isAiProcessing ? 'AI_PROCESSING' : 'LIVE_SIGNAL'}</span>
                 <span className="text-[8px] text-blue-400 font-black tracking-widest uppercase sm:hidden">LIVE</span>
              </div>
              <div className="flex-1 overflow-hidden">
                 <HorizontalNewsTicker newsItems={intelligentNews} isProcessing={isAiProcessing} />
              </div>
           </div>
        </div>
      )}

      {/* Kaspa Global Consensus Telemetry - Top Right (MOVED TO HOLOGRAM) */}
      
      {/* Settings Modal overlay */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0c14]/90 border border-blue-500/30 rounded-xl p-6 w-full max-w-xs shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-white text-sm font-bold tracking-widest uppercase flex items-center gap-2 font-mono">
                <Settings size={16} className="text-blue-400" /> System Params
              </h2>
              <button onClick={() => { playSelectSound(); setIsSettingsOpen(false); }} className="text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Volume Control */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-[10px] text-white/70 font-mono tracking-widest uppercase">
                  <span className="flex items-center gap-2"><Volume2 size={12} className="text-blue-400"/> Audio Level</span>
                  <span className="text-blue-200">{Math.round(volume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="1" step="0.01" 
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Notifications Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-white/70 font-mono tracking-widest uppercase">
                  {notifications ? <Bell size={12} className="text-blue-400"/> : <BellOff size={12} className="text-white/40"/>}
                  <span>HUD Notifications</span>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${notifications ? 'bg-blue-500' : 'bg-white/10 border border-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifications ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [0, 65, 105], fov: 50 }} 
        gl={{ alpha: true, antialias: true, logarithmicDepthBuffer: true }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5 }}
        onPointerMissed={() => {
          setSelectedObjectId(null);
          setFocusTarget(null);
        }}
      >
        
        {/* Lighting */}
        <ambientLight intensity={0.03} />
        {/* Core light from the center of the galaxy */}
        <pointLight position={[0, 0, 0]} intensity={400} color="#ffbb77" distance={80} decay={1.5} />
        <pointLight position={[0, 3, 0]} intensity={150} color="#77bbff" distance={100} decay={2} />
        
        <TimeScaleController isInteracting={isInteractingWithPanel} timeScaleRef={timeScaleRef} />
        <CameraController focusTarget={focusTarget} selectedId={selectedObjectId} isMobile={isMobile} />
        <Galaxy isPaused={isInteractingWithPanel} speedFactor={timeScaleRef.current} />
        <Planets 
          agentData={agentData} 
          fullState={fullState}
          setFocusTarget={setFocusTarget} 
          selectedPlanet={selectedObjectId} 
          setSelectedPlanet={setSelectedObjectId}
          onInteractionState={setIsInteractingWithPanel}
          isPaused={isInteractingWithPanel}
          speedFactor={timeScaleRef.current}
          isMobile={isMobile}
        />
        <KaspaSun 
          agentData={agentData}
          fullState={fullState}
          setFocusTarget={setFocusTarget} 
          isSelected={selectedObjectId === 'kaspa-sun'} 
          onInteract={() => setSelectedObjectId(selectedObjectId === 'kaspa-sun' ? null : 'kaspa-sun')}
          onInteractionState={setIsInteractingWithPanel}
          isPaused={isInteractingWithPanel}
          speedFactor={timeScaleRef.current}
          isMobile={isMobile}
        />
        <DataNodes 
          agentData={agentData} 
          fullState={fullState}
          setFocusTarget={setFocusTarget} 
          selectedNode={selectedObjectId} 
          setSelectedNode={setSelectedObjectId}
          onInteractionState={setIsInteractingWithPanel}
          isPaused={isInteractingWithPanel}
          speedFactor={timeScaleRef.current}
          isMobile={isMobile}
        />
        <BinaryAurora agentData={agentData} />
        
        <Stars radius={100} depth={50} count={12000} factor={6} saturation={0.5} fade speed={1} />
        
        <OrbitControls 
          makeDefault
          autoRotate={!selectedObjectId} 
          autoRotateSpeed={0.3} 
          enableDamping
          dampingFactor={0.06}
          maxDistance={120} 
          minDistance={3} 
          enablePan={true}
        />
      </Canvas>
    </div>
  );
}

function Galaxy({ isPaused, speedFactor = 1 }: { isPaused?: boolean, speedFactor?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 20000;
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Scientific star color range
    const starColors = [
      new THREE.Color('#ffffff'), // Pure white
      new THREE.Color('#fff4e8'), // Soft yellow (G-type)
      new THREE.Color('#e8f4ff'), // Soft blue (B-type)
      new THREE.Color('#ffeadb'), // Soft orange (K-type)
    ];
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        const arms = 4;
        const radius = Math.pow(Math.random(), 1.6) * 60; 
        const branchAngle = (i % arms) * ((Math.PI * 2) / arms);
        const spinAngle = radius * 0.3;
        
        const randomX = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * (1 + radius * 0.12);
        const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (1 + radius * 0.06); 
        const randomZ = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * (1 + radius * 0.12);
        
        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
        
        const starColor = starColors[Math.floor(Math.random() * starColors.length)].clone();
        const brightness = 0.5 + Math.random() * 0.5;
        
        colors[i3] = starColor.r * brightness;
        colors[i3 + 1] = starColor.g * brightness;
        colors[i3 + 2] = starColor.b * brightness;
    }
    
    return [positions, colors];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
        pointsRef.current.rotation.y -= delta * 0.03 * speedFactor;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={true}
        transparent={true}
        opacity={0.6}
      />
    </points>
  );
}

function KaspaSun({ agentData, fullState, setFocusTarget, isSelected, onInteract, isPaused, onInteractionState, speedFactor = 1, isMobile }: { agentData: any, fullState: any, setFocusTarget: any, isSelected: boolean, onInteract: any, isPaused?: boolean, onInteractionState?: any, speedFactor?: number, isMobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const accretionDiskRef = useRef<THREE.Mesh>(null);

  const groupRef = useRef<THREE.Group>(null);
  
  const handleInteraction = (e: any) => {
    playSelectSound();
    e.stopPropagation();
    if (isSelected) {
      onInteract();
      setFocusTarget(null);
    } else {
      onInteract();
      setFocusTarget(new THREE.Vector3(0, 0, 0));
    }
  };

  useFrame((state, delta) => {
    if (accretionDiskRef.current) {
      accretionDiskRef.current.rotation.z -= delta * 0.8 * speedFactor;
    }
    if (groupRef.current) {
      // Gentle rhythmic bobbing and scaling (dance to the melody rhythm)
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(t * 3) * 0.5;
      const pulse = 1 + Math.sin(t * 6) * 0.05;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* The actual Sun / Core */}
      <mesh 
        ref={meshRef}
        name="kaspa-sun"
        onPointerDown={handleInteraction}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Sun glow layer */}
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#ffcc33" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <Html position={[0, 4, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <div className="group flex flex-col items-center justify-center">
          <div 
            onPointerDown={handleInteraction}
            className="opacity-60 group-hover:opacity-100 transition-opacity bg-white/10 px-3 py-1 rounded-full text-[10px] font-mono whitespace-nowrap border border-white/20 text-white shadow-xl cursor-pointer pointer-events-auto backdrop-blur-md"
          >
             KASPA_CORE_GENESIS
          </div>
        </div>
      </Html>

      {/* Floating Detail */}
      {isSelected && (
        <Html position={[isMobile ? 1.5 : 5, isMobile ? 3.5 : 5, 0]} center zIndexRange={[1000, 0]} className="pointer-events-none">
          <MasterDetailsPanel 
            data={SUN_DATA}
            subType="CORE_ENGINE"
            typeColor="blue"
            agentData={agentData}
            fullState={fullState}
            onClose={() => onInteract()}
            onInteractionState={onInteractionState}
            isMobile={isMobile}
            className="w-[240px] md:w-[500px]"
          />
        </Html>
      )}

      {/* Event horizon glow layer */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#ffaa33" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Accretion disk inner */}
      <mesh ref={accretionDiskRef} rotation={[Math.PI / 2 + 0.15, 0, 0]}>
        <ringGeometry args={[2.2, 4.5, 64]} />
        <meshBasicMaterial 
          color="#ffaa44" 
          side={THREE.DoubleSide} 
          transparent opacity={0.6} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
        />
      </mesh>
      
      {/* Outer gas ring */}
      <mesh rotation={[Math.PI / 2 + 0.15, 0, 0]}>
        <ringGeometry args={[4.5, 8, 64]} />
        <meshBasicMaterial 
          color="#ff5500" 
          side={THREE.DoubleSide} 
          transparent opacity={0.2} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
        />
      </mesh>

      {/* Perpendicular solar winds */}
      <mesh rotation={[0, 0, 0]} position={[0, 6, 0]}>
        <cylinderGeometry args={[0.1, 2.5, 15, 32, 1, true]} />
        <meshBasicMaterial color="#ffcc66" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Planets({ agentData, fullState, setFocusTarget, selectedPlanet, setSelectedPlanet, onInteractionState, isPaused, speedFactor = 1, isMobile }: { agentData: any, fullState: any, setFocusTarget: any, selectedPlanet: string | null, setSelectedPlanet: any, onInteractionState: any, isPaused?: boolean, speedFactor?: number, isMobile: boolean }) {
  const planetsData = useMemo(() => {
    // Relative sizes and distances based on scientific approx, massively scaled up for visibility
    const orbitalDistances = [10, 16, 22, 29, 39, 50, 61, 71, 81];
    const planetSizes = [0.8, 1.4, 1.6, 1.1, 2.8, 2.3, 1.8, 1.7, 0.7];

    return KASPA_MODULES.map((module, i) => {
      const distance = orbitalDistances[i];
      const size = planetSizes[i];
      
      // Kepler's law approximation: speed decreases as distance increases
      const speedBase = 1.6 / Math.sqrt(distance); 
      const speed = speedBase * 0.16; // Scientists' observation speed
      
      const angle = (i / KASPA_MODULES.length) * Math.PI * 2 + (Math.random() * 0.4);
      const startY = (Math.random() - 0.5) * 1.5; 
      
      const hasRings = module.title.includes('SATURN');
      const hasMoons = i >= 4; 
      
      return { distance, size, speed, angle, startY, color: new THREE.Color(module.color), hasRings, hasMoons, id: module.title, module };
    });
  }, []);

  return (
    <>
      {planetsData.map((data) => (
        <Planet 
          key={data.id} 
          {...data} 
          isSelected={selectedPlanet === data.id}
          onInteract={(id: string | null) => setSelectedPlanet(id)}
          agentData={agentData}
          fullState={fullState}
          setFocusTarget={setFocusTarget}
          onInteractionState={onInteractionState}
          isPaused={isPaused}
          speedFactor={speedFactor}
          isMobile={isMobile}
        />
      ))}
    </>
  );
}

function Planet({ distance, size, speed, angle, startY, color, hasRings, hasMoons, id, module, isSelected, onInteract, agentData, fullState, setFocusTarget, onInteractionState, isPaused, speedFactor = 1, isMobile }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const moonsGroupRef = useRef<THREE.Group>(null);
  const currentAngle = useRef(angle);
  
  const orbitLine = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * distance, startY, Math.sin(theta) * distance));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [distance, startY]);

  useFrame((state, delta) => {
    // Planets now orbit continuously even when selected, 
    // the CameraController handles live tracking for a cinematic effect.
    currentAngle.current += delta * speed * speedFactor;
    
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(currentAngle.current) * distance;
      groupRef.current.position.z = Math.sin(currentAngle.current) * distance;
      groupRef.current.position.y = startY;
      
      // Keep rotating the meshes regardless of orbit, but gently
      if (meshRef.current) {
          meshRef.current.rotation.y += Math.abs(speed * 2) * delta * 50 * speedFactor;
          // Beautiful dancing / rhythmic bobbing to the music tempo applied ONLY to the inner mesh
          const rhythmBob = Math.sin(state.clock.elapsedTime * 3 + distance) * 0.4;
          meshRef.current.position.y = rhythmBob;
      }
      if (moonsGroupRef.current) {
          moonsGroupRef.current.rotation.y -= speed * 4 * delta * 50 * speedFactor;
      }
    }
  });

  return (
    <>
      {/* Scientific Orbit Line with AU Markers */}
      <group>
        {/* @ts-expect-error react-three-fiber intrinsic clash with SVG element */}
        <line geometry={orbitLine}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.15} />
        </line>
        
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, idx) => (
          <group key={idx} position={[Math.cos(angle) * distance, startY, Math.sin(angle) * distance]}>
            <Html center style={{ pointerEvents: 'none' }}>
              <div className="flex flex-col items-center">
                <div className="w-[1px] h-2 bg-white/20" />
                <div className="text-[6px] font-mono text-white/30 uppercase tracking-tighter mt-1">
                  {((distance / 10) + idx * 0.1).toFixed(2)} AU
                </div>
              </div>
            </Html>
          </group>
        ))}
      </group>
      
      <group ref={groupRef} name={id}
          onPointerDown={(e) => { 
             playSelectSound();
             e.stopPropagation(); 
             if (isSelected) {
                onInteract(null);
                setFocusTarget(null);
             } else {
                onInteract(id);
                if (groupRef.current) {
                   const worldPos = new THREE.Vector3();
                   groupRef.current.getWorldPosition(worldPos);
                   setFocusTarget(worldPos);
                }
             }
          }}
          onPointerOver={() => document.body.style.cursor = 'pointer'}
          onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        {/* Planet */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, 64, 64]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.4} 
            metalness={0.2} 
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Floating Detail */}
        {isSelected && (
          <Html position={[isMobile ? size : size + 4, isMobile ? size + 2 : size + 4, 0]} center zIndexRange={[1000, 0]} className="pointer-events-none">
            <MasterDetailsPanel 
              data={module}
              subType="PROTOCOL_LAYER"
              typeColor="blue"
              agentData={agentData}
              fullState={fullState}
              onClose={() => onInteract(null)}
              onInteractionState={onInteractionState}
              isMobile={isMobile}
              className="w-[240px] md:w-[500px]"
            />
          </Html>
        )}

        {/* Saturn's Rings (Scientific) */}
        {hasRings && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[size * 1.5, size * 2.6, 128]} />
            <meshStandardMaterial 
              color={color} 
              transparent 
              opacity={0.3} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        )}
        
        {/* Moons */}
        {hasMoons && (
          <group ref={moonsGroupRef}>
            <mesh position={[size * 2 + 0.3, 0, 0]}>
              <sphereGeometry args={[size * 0.18, 16, 16]} />
              <meshStandardMaterial color="#aaaaaa" roughness={0.9} />
            </mesh>
          </group>
        )}

        <Html position={[0, size + 1, 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
           <div className="group flex flex-col items-center justify-center">
              <div 
                 onPointerDown={(e) => { 
                   e.stopPropagation(); 
                   if (isSelected) {
                      onInteract(null);
                      setFocusTarget(null);
                   } else {
                      onInteract(id);
                   }
                 }}
                 className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-[8px] font-mono whitespace-nowrap border border-white/10 text-white shadow-xl cursor-pointer pointer-events-auto"
              >
                 {module.title.replace(/_/g, ' ')}
              </div>
            </div>
        </Html>
      </group>
    </>
  );
}

export function DataNodes({ agentData, fullState, setFocusTarget, selectedNode, setSelectedNode, onInteractionState, isPaused, speedFactor = 1, isMobile }: { agentData: any, fullState: any, setFocusTarget: any, selectedNode: string | null, setSelectedNode: any, onInteractionState: any, isPaused?: boolean, speedFactor?: number, isMobile: boolean }) {
  return (
    <>
      {FLOATING_NODES.map((node) => (
         <DataNodeItem 
           key={node.id} 
           node={node} 
           agentData={agentData} 
           fullState={fullState}
           setFocusTarget={setFocusTarget} 
           selectedNode={selectedNode} 
           setSelectedNode={setSelectedNode}
           onInteractionState={onInteractionState}
           isPaused={isPaused} 
           speedFactor={speedFactor}
           isMobile={isMobile}
         />
      ))}
    </>
  );
}

function DataNodeItem({ node, agentData, fullState, setFocusTarget, selectedNode, setSelectedNode, onInteractionState, isPaused, speedFactor = 1, isMobile }: any) {
  const visualGroupRef = useRef<THREE.Group>(null);
  const isSelected = selectedNode === node.id;
  const nodeStats = agentData?.polw?.nodes?.[node.id];
  const isOffline = nodeStats && nodeStats.confidence === 0;
  const isDominant = agentData?.polw?.dominantNode === node.id;

  useFrame((state) => {
    if (visualGroupRef.current) {
      const t = state.clock.elapsedTime;
      // Rhythmic bobbing to the music applied ONLY to the inner HTML container, so the camera tracker stays still!
      visualGroupRef.current.position.y = Math.sin(t * 3 + node.pos[0]) * 0.8 * speedFactor;
      const pulse = 1 + Math.sin(t * 6 + node.pos[0]) * 0.05 * speedFactor;
      visualGroupRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group name={node.id} position={node.pos as any}>
      <group ref={visualGroupRef}>
        <Html center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div className="flex flex-col items-center">
            {isSelected && isMobile && (
              <div className="mb-4 ml-6 pointer-events-none relative">
                 <MasterDetailsPanel 
                  data={node}
                  subType="NODE_STATUS"
                  typeColor="emerald"
                  stats={nodeStats}
                  agentData={agentData}
                  fullState={fullState}
                  onClose={() => {
                    setSelectedNode(null);
                    setFocusTarget(null);
                  }}
                  onInteractionState={onInteractionState}
                  isMobile={isMobile}
                  className="w-[240px] md:w-[500px]"
                />
              </div>
            )}
            
            <div 
              onPointerDown={(e) => { 
                playSelectSound();
                e.stopPropagation(); 
                if (isSelected) {
                   setSelectedNode(null);
                   setFocusTarget(null);
                } else {
                   setSelectedNode(node.id);
                   setFocusTarget(new THREE.Vector3(...node.pos));
                }
              }}
              className="group flex flex-col items-center justify-center cursor-pointer pointer-events-auto"
            >
              <div className="relative">
                 {isDominant && <div className="absolute -inset-8 bg-blue-500/20 blur-2xl rounded-full animate-pulse z-0" />}
                 <div className={`w-6 h-6 rounded-full relative z-10 transition-all duration-500 ${isOffline ? 'bg-red-500 animate-pulse' : isDominant ? 'bg-white animate-pulse' : 'bg-blue-400 group-hover:bg-white'}`} />
              </div>
              <div className="mt-4 flex flex-col items-center gap-1 opacity-80 group-hover:opacity-100">
                 <div className="text-white font-mono text-[9px] tracking-widest uppercase bg-black/80 px-3 py-1 rounded border border-white/5 backdrop-blur-xl transition-colors">{node.label}</div>
                 {isDominant && <div className="text-[7px] font-mono text-blue-400 tracking-[0.3em] uppercase animate-bounce mt-1">Primary_Route</div>}
              </div>
            </div>

            {isSelected && !isMobile && (
              <div className="mt-8 ml-8 pointer-events-none">
                <MasterDetailsPanel 
                  data={node}
                  subType="NODE_STATUS"
                  typeColor="emerald"
                  stats={nodeStats}
                  agentData={agentData}
                  fullState={fullState}
                  onClose={() => {
                    setSelectedNode(null);
                    setFocusTarget(null);
                  }}
                  onInteractionState={onInteractionState}
                  isMobile={isMobile}
                  className="w-[240px] md:w-[500px]"
                />
              </div>
            )}
          </div>
        </Html>
      </group>
    </group>
  );
}

// ---- The Binary Aurora Overlay ----
const NODES_VECTORS = {
  KaspaREST: new THREE.Vector3(...FLOATING_NODES[0].pos as [number, number, number]),
  KaspaHashrate: new THREE.Vector3(...FLOATING_NODES[1].pos as [number, number, number]),
  KaspaHalving: new THREE.Vector3(...FLOATING_NODES[2].pos as [number, number, number])
};

function DataPackets({ start, end, mid, count, isCongested }: { start: THREE.Vector3, end: THREE.Vector3, mid: THREE.Vector3, count: number, isCongested: boolean }) {
  const activeCount = Math.min(30, Math.max(3, Math.floor(count / 10))); // Scale limits safely
  const packetsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!packetsRef.current) return;
    const time = state.clock.elapsedTime;
    
    packetsRef.current.children.forEach((child, i) => {
       const t = (time * (isCongested ? 0.3 : 0.8) + (i / activeCount)) % 1;
       const invT = 1 - t;
       
       child.position.x = invT * invT * start.x + 2 * invT * t * mid.x + t * t * end.x;
       child.position.y = invT * invT * start.y + 2 * invT * t * mid.y + t * t * end.y;
       child.position.z = invT * invT * start.z + 2 * invT * t * mid.z + t * t * end.z;
    });
  });

  return (
    <group ref={packetsRef}>
      {Array.from({ length: activeCount }).map((_, i) => (
         <mesh key={i}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color={isCongested ? "#ff8888" : "#ffffff"} />
         </mesh>
      ))}
    </group>
  );
}

function AuroraStream({ start, end, isCongested, tps }: { start: THREE.Vector3, end: THREE.Vector3, isCongested: boolean, tps: number }) {
  const lineRef = useRef<any>(null);
  
  const mid = useMemo(() => {
    // Calculate a sweeping arc between the nodes
    const m = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    m.y += Math.random() * 8 + 4; 
    m.x += (Math.random() - 0.5) * 6;
    m.z += (Math.random() - 0.5) * 6;
    return m;
  }, [start, end]);

  useFrame((_, delta) => {
    if (lineRef.current?.material) {
      // 120Hz Snaking effect logic
      lineRef.current.material.dashOffset -= delta * 1.5; 
    }
  });

  return (
    <group>
       <QuadraticBezierLine
          ref={lineRef}
          start={start}
          end={end}
          mid={mid}
          color={isCongested ? "#ff4444" : "#00ffff"} 
          lineWidth={2.5}
          dashed={true}
          dashScale={20}
          dashSize={4}
          transparent
          opacity={0.6}
       />
       <DataPackets start={start} end={end} mid={mid} count={tps} isCongested={isCongested} />
    </group>
  );
}

export function BinaryAurora({ agentData }: { agentData: any }) {
  const aiTarget = agentData?.ai?.optimalNode;
  const isCongested = agentData?.networkHealth === 'congested';
  const tps = agentData?.realMetrics?.tps || 10;
  
  if (!aiTarget) return null;

  const targetVec = NODES_VECTORS[aiTarget as keyof typeof NODES_VECTORS];
  if (!targetVec) return null;
  
  const centerVec = new THREE.Vector3(0, 0, 0);

  return (
    <group>
      <AuroraStream 
         start={centerVec} 
         end={targetVec} 
         isCongested={isCongested}
         tps={tps}
      />
    </group>
  );
}

