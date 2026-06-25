import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Multi-view 2D illustrations. For each hardware part we draw it from several
// angles (front / back / top / bottom / connector) so a learner can recognise it
// the way it actually looks in hand. Rendered enlarged in the info panel when a
// part is selected (replaces the old 3D viewer with accurate flat drawings).
//
// Drawing convention: each draw() returns SVG content centred on the origin and
// fits within roughly x∈[-56,56], y∈[-38,38]. PartViewsPanel drops it into a
// 120×92 viewBox card translated to the centre.
// ─────────────────────────────────────────────────────────────────────────────

interface View {
  name: string;
  draw: () => ReactNode;
}
type ViewSet = View[];

// Shared palette (matches the grid thumbnails in hardware.tsx / defs.tsx).
const METAL = "url(#mvMetal)";
const METALH = "url(#mvMetalH)";
const GOLD = "url(#mvGold)";
const PCB = "url(#mvPcb)";
const SH = "#586473"; // shell stroke
const DARK = "#2b333d"; // dark plastic / cavity
const BLACK = "#1c2127";
const WHITE = "#eef1f5"; // tongue / nylon
const BOOT = "#3a424c"; // grey over-mould
const CABLE = "#2a2f38";
const PCBE = "#0f5a37"; // PCB edge/stroke
const BLUE = "#3f6fb5"; // VGA shell
const BLUEK = "#284f86";

function Defs() {
  return (
    <defs>
      <linearGradient id="mvMetal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e3e9f0" />
        <stop offset="0.5" stopColor="#aab4c1" />
        <stop offset="1" stopColor="#7c8896" />
      </linearGradient>
      <linearGradient id="mvMetalH" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#eef2f7" />
        <stop offset="0.5" stopColor="#c0cad6" />
        <stop offset="1" stopColor="#8f9dad" />
      </linearGradient>
      <linearGradient id="mvGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f5d471" />
        <stop offset="1" stopColor="#c0942f" />
      </linearGradient>
      <linearGradient id="mvPcb" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2fa874" />
        <stop offset="1" stopColor="#13693f" />
      </linearGradient>
    </defs>
  );
}

// ── tiny shared helpers ──────────────────────────────────────────────────────
const sheen = (x: number, y: number, w: number, h = 4) => (
  <rect x={x} y={y} width={w} height={h} rx={Math.min(h / 2, 2)} fill="#ffffff" opacity={0.28} />
);
const cable = (x: number, w = 24, h = 13) => (
  <rect x={x} y={-h / 2} width={w} height={h} rx={h / 2} fill={CABLE} />
);

// ── CONNECTORS (the plug as you hold it) ─────────────────────────────────────
const CONNECTOR_VIEWS: Record<string, ViewSet> = {
  "usb-a": [
    {
      name: "Front",
      draw: () => (
        <>
          <rect x={-40} y={-22} width={80} height={44} rx={3} fill={METAL} stroke={SH} strokeWidth={1.5} />
          {sheen(-40, -22, 80, 5)}
          <rect x={-33} y={-15} width={66} height={30} rx={2} fill="#39434f" />
          <rect x={-29} y={-12} width={58} height={11} rx={1.5} fill={WHITE} />
          {[-25, -11, 3, 17].map((x) => (
            <rect key={x} x={x} y={-9} width={9} height={6} rx={1} fill={GOLD} />
          ))}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-30} y={-20} width={50} height={40} rx={8} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {sheen(-26, -16, 42, 5)}
          {cable(18, 34)}
          {[24, 30, 36, 42].map((x) => <rect key={x} x={x} y={-7} width={1.6} height={14} fill={BLACK} opacity={0.4} />)}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-50} y={-12} width={60} height={24} rx={2} fill={METAL} stroke={SH} strokeWidth={1.4} />
          <line x1={-50} y1={0} x2={8} y2={0} stroke={SH} strokeWidth={0.8} opacity={0.6} />
          {sheen(-48, -10, 56, 4)}
          <rect x={6} y={-14} width={24} height={28} rx={8} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {cable(28, 26)}
        </>
      ),
    },
  ],
  "usb-c": [
    {
      name: "Front",
      draw: () => (
        <>
          <rect x={-44} y={-17} width={88} height={34} rx={17} fill={METAL} stroke={SH} strokeWidth={1.6} />
          {sheen(-30, -14, 60, 4)}
          <rect x={-37} y={-11} width={74} height={22} rx={11} fill="#20262e" />
          <rect x={-30} y={-5} width={60} height={10} rx={5} fill="#36404b" />
          {[-26, -18, -10, -2, 6, 14, 22].map((x) => (
            <rect key={`t${x}`} x={x} y={-4} width={5} height={2.4} rx={0.6} fill={GOLD} />
          ))}
          {[-26, -18, -10, -2, 6, 14, 22].map((x) => (
            <rect key={`b${x}`} x={x} y={1.8} width={5} height={2.4} rx={0.6} fill={GOLD} />
          ))}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-28} y={-19} width={48} height={38} rx={14} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {sheen(-22, -15, 38, 5)}
          {cable(16, 34)}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-50} y={-9} width={62} height={18} rx={9} fill={METAL} stroke={SH} strokeWidth={1.4} />
          {sheen(-46, -7, 54, 3)}
          <rect x={8} y={-13} width={24} height={26} rx={10} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {cable(30, 24)}
        </>
      ),
    },
  ],
  rj45: [
    {
      name: "Front",
      draw: () => (
        <>
          <path d="M -30 -16 H 30 V 12 H 8 V 20 H -8 V 12 H -30 Z" fill="#e3edf3" stroke="#88a0ae" strokeWidth={1.6} strokeLinejoin="round" opacity={0.95} />
          {Array.from({ length: 8 }, (_, i) => -25 + i * 6.7).map((x) => (
            <rect key={x} x={x} y={-14} width={3.4} height={13} rx={0.6} fill={GOLD} />
          ))}
          <rect x={-30} y={-16} width={60} height={5} rx={1} fill="#ffffff" opacity={0.4} />
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-26} y={-16} width={40} height={32} rx={4} fill="#cfe0e9" stroke="#88a0ae" strokeWidth={1.4} opacity={0.92} />
          <path d="M -10 -16 L 8 -16 L 5 -25 L -7 -25 Z" fill="#bcd3df" stroke="#88a0ae" strokeWidth={1.2} strokeLinejoin="round" />
          {cable(12, 34, 16)}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-44} y={-13} width={56} height={26} rx={3} fill="#dceaf1" stroke="#88a0ae" strokeWidth={1.4} opacity={0.94} />
          {/* locking clip raised along the top */}
          <path d="M -30 -13 L -6 -13 L -10 -22 L -26 -22 Z" fill="#cfe0e9" stroke="#88a0ae" strokeWidth={1.2} strokeLinejoin="round" />
          {cable(10, 30, 18)}
        </>
      ),
    },
  ],
  hdmi: [
    {
      name: "Front",
      draw: () => (
        <>
          <path d="M -40 -14 L 40 -14 L 31 14 L -31 14 Z" fill={METAL} stroke={SH} strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M -32 -8 L 32 -8 L 26 8 L -26 8 Z" fill="#39434f" />
          {/* 19 contacts in two offset rows */}
          {Array.from({ length: 10 }, (_, i) => -27 + i * 6).map((x) => (
            <rect key={`a${x}`} x={x} y={-6} width={3.4} height={4} fill={GOLD} />
          ))}
          {Array.from({ length: 9 }, (_, i) => -24 + i * 6).map((x) => (
            <rect key={`b${x}`} x={x} y={1.5} width={3.4} height={4} fill={GOLD} />
          ))}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-30} y={-17} width={46} height={34} rx={6} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {sheen(-24, -13, 38, 5)}
          {cable(14, 34, 16)}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <path d="M -50 -9 L 8 -9 L 6 9 L -50 9 Z" fill={METAL} stroke={SH} strokeWidth={1.4} strokeLinejoin="round" />
          {sheen(-46, -7, 50, 3)}
          <rect x={6} y={-13} width={24} height={26} rx={6} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {cable(28, 24)}
        </>
      ),
    },
  ],
  dp: [
    {
      name: "Front",
      draw: () => (
        <>
          <path d="M -38 -14 L 30 -14 L 38 -5 L 38 14 L -38 14 Z" fill={METAL} stroke={SH} strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M -30 -8 L 26 -8 L 31 -3 L 31 8 L -30 8 Z" fill="#39434f" />
          {Array.from({ length: 10 }, (_, i) => -25 + i * 5.6).map((x) => (
            <rect key={x} x={x} y={-5} width={3} height={4} fill={GOLD} />
          ))}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-30} y={-17} width={46} height={34} rx={5} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {sheen(-24, -13, 38, 5)}
          {cable(14, 34, 16)}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-50} y={-9} width={58} height={18} rx={3} fill={METAL} stroke={SH} strokeWidth={1.4} />
          {sheen(-46, -7, 50, 3)}
          {/* push-latch button */}
          <rect x={-20} y={-13} width={14} height={4} rx={1} fill={BOOT} />
          <rect x={6} y={-13} width={24} height={26} rx={5} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {cable(28, 24)}
        </>
      ),
    },
  ],
  audio: [
    {
      name: "Side",
      draw: () => (
        <>
          {/* TRS plug: tip, two insulator rings, sleeve, then barrel */}
          <path d="M -50 0 L -44 -5 L -16 -5 L -16 5 L -44 5 Z" fill={GOLD} stroke="#8f6e22" strokeWidth={1} strokeLinejoin="round" />
          <rect x={-30} y={-5} width={3} height={10} fill="#222a33" />
          <rect x={-18} y={-5} width={3} height={10} fill="#222a33" />
          <rect x={-15} y={-7} width={20} height={14} rx={3} fill={GOLD} stroke="#8f6e22" strokeWidth={1} />
          <rect x={3} y={-10} width={34} height={20} rx={6} fill={METALH} stroke={SH} strokeWidth={1.3} />
          {sheen(8, -7, 26, 4)}
          {cable(35, 18)}
        </>
      ),
    },
    {
      name: "Tip",
      draw: () => (
        <>
          <circle cx={0} cy={0} r={22} fill={METALH} stroke={SH} strokeWidth={1.4} />
          <circle cx={0} cy={0} r={15} fill={GOLD} stroke="#8f6e22" strokeWidth={1} />
          <circle cx={0} cy={0} r={9} fill="#d9ad44" />
          <circle cx={0} cy={0} r={3.5} fill="#8f6e22" />
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-22} y={-12} width={40} height={24} rx={7} fill={METALH} stroke={SH} strokeWidth={1.3} />
          {sheen(-17, -9, 30, 4)}
          {cable(16, 32, 16)}
        </>
      ),
    },
  ],
  // ── ports-connectors-2 ──────────────────────────────────────────────────
  vga: [
    {
      name: "Front",
      draw: () => (
        <>
          <circle cx={-46} cy={0} r={5} fill={METAL} stroke={SH} strokeWidth={1} />
          <circle cx={46} cy={0} r={5} fill={METAL} stroke={SH} strokeWidth={1} />
          <path d="M -38 -15 L 38 -15 L 30 15 L -30 15 Z" fill={BLUE} stroke={BLUEK} strokeWidth={1.6} strokeLinejoin="round" />
          {[-9, 0, 9].map((y, r) =>
            Array.from({ length: r === 1 ? 4 : 5 }, (_, i) => -19 + i * 9.5 + (r === 1 ? 4.75 : 0)).map((x) => (
              <circle key={`${y}-${x}`} cx={x} cy={y} r={1.9} fill={GOLD} />
            )),
          )}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-30} y={-16} width={50} height={32} rx={6} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {[-30, 20].map((x) => <circle key={x} cx={x} cy={0} r={4} fill="#6b7480" />)}
          {cable(18, 34, 18)}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <circle cx={-48} cy={0} r={4} fill={METAL} stroke={SH} strokeWidth={0.8} />
          <circle cx={6} cy={0} r={4} fill={METAL} stroke={SH} strokeWidth={0.8} />
          <path d="M -44 -8 L 2 -8 L 0 8 L -44 8 Z" fill={BLUE} stroke={BLUEK} strokeWidth={1.3} strokeLinejoin="round" />
          <rect x={4} y={-13} width={22} height={26} rx={6} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {cable(26, 24)}
        </>
      ),
    },
  ],
  dvi: [
    {
      name: "Front",
      draw: () => (
        <>
          <rect x={-40} y={-16} width={70} height={32} rx={3} fill="#eef1f5" stroke="#b6c0cc" strokeWidth={1.6} />
          {[-11, -2, 7].map((y) =>
            [-34, -28, -22, -16, -10, -4, 2, 8].map((x) => (
              <rect key={`${x}-${y}`} x={x} y={y - 1.6} width={3.2} height={3.2} fill={METAL} stroke="#8593a3" strokeWidth={0.4} />
            )),
          )}
          {/* DVI-I flat blade + 4 analog pins */}
          <rect x={18} y={-10} width={14} height={20} rx={1.5} fill="#dfe5ec" stroke="#8593a3" strokeWidth={1} />
          <rect x={22} y={-6} width={4} height={12} rx={1} fill="#c9d2dc" />
          {[[-6], [6]].map(([dy]) => [22, 28].map((x) => <rect key={`${x}-${dy}`} x={x} y={dy - 1.5} width={3} height={3} fill={METAL} />))}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-32} y={-16} width={52} height={32} rx={5} fill={WHITE} stroke="#b6c0cc" strokeWidth={1.4} />
          {[-32, 20].map((x) => <circle key={x} cx={x} cy={0} r={4} fill="#9aa6b4" />)}
          {cable(18, 34, 18)}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-48} y={-9} width={56} height={18} rx={2} fill="#eef1f5" stroke="#b6c0cc" strokeWidth={1.3} />
          <rect x={6} y={-13} width={22} height={26} rx={5} fill="#dfe5ec" stroke="#b6c0cc" strokeWidth={1} />
          {cable(26, 24)}
        </>
      ),
    },
  ],
  microb: [
    {
      name: "Front",
      draw: () => (
        <>
          <path d="M -26 -10 L 26 -10 L 20 10 L -20 10 Z" fill={METAL} stroke={SH} strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M -18 -4 L 18 -4 L 14 5 L -14 5 Z" fill={DARK} />
          <rect x={-10} y={-2} width={20} height={3} rx={1} fill={GOLD} opacity={0.85} />
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-26} y={-13} width={40} height={26} rx={6} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {sheen(-21, -10, 30, 4)}
          {cable(14, 34, 13)}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <path d="M -48 -7 L 6 -7 L 4 7 L -48 7 Z" fill={METAL} stroke={SH} strokeWidth={1.3} strokeLinejoin="round" />
          <rect x={4} y={-12} width={22} height={24} rx={6} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {cable(26, 24)}
        </>
      ),
    },
  ],
  rj11: [
    {
      name: "Front",
      draw: () => (
        <>
          <path d="M -22 -16 H 22 V 12 H 6 V 20 H -6 V 12 H -22 Z" fill="#e3edf3" stroke="#88a0ae" strokeWidth={1.6} strokeLinejoin="round" opacity={0.95} />
          {[-9, -3, 3, 9].map((x) => <rect key={x} x={x} y={-14} width={3.2} height={12} rx={0.6} fill={GOLD} />)}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-20} y={-14} width={32} height={28} rx={4} fill="#cfe0e9" stroke="#88a0ae" strokeWidth={1.4} opacity={0.92} />
          <path d="M -8 -14 L 6 -14 L 4 -22 L -6 -22 Z" fill="#bcd3df" stroke="#88a0ae" strokeWidth={1.1} strokeLinejoin="round" />
          {cable(10, 32, 12)}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-44} y={-11} width={52} height={22} rx={3} fill="#dceaf1" stroke="#88a0ae" strokeWidth={1.3} opacity={0.94} />
          <path d="M -26 -11 L -6 -11 L -10 -19 L -22 -19 Z" fill="#cfe0e9" stroke="#88a0ae" strokeWidth={1.1} strokeLinejoin="round" />
          {cable(8, 30, 14)}
        </>
      ),
    },
  ],
  ps2: [
    {
      name: "Front",
      draw: () => (
        <>
          <circle cx={0} cy={0} r={24} fill={METALH} stroke={SH} strokeWidth={1.6} />
          <circle cx={0} cy={0} r={16} fill={DARK} />
          <rect x={-4} y={-15} width={8} height={6} rx={1} fill="#8593a3" />
          {[[-7, -5], [7, -5], [-10, 5], [10, 5], [-4, 10], [4, 10]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2} fill={GOLD} />
          ))}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <circle cx={-6} cy={0} r={18} fill="#6f4aa0" stroke="#4a2f74" strokeWidth={1.2} />
          {sheen(-18, -12, 22, 5)}
          {cable(12, 32, 16)}
        </>
      ),
    },
    {
      name: "Side",
      draw: () => (
        <>
          <rect x={-46} y={-15} width={26} height={30} rx={6} fill={METALH} stroke={SH} strokeWidth={1.4} />
          <rect x={-22} y={-14} width={24} height={28} rx={7} fill="#6f4aa0" stroke="#4a2f74" strokeWidth={1.1} />
          {cable(2, 36, 18)}
        </>
      ),
    },
  ],
  esata: [
    {
      name: "Front",
      draw: () => (
        <>
          <rect x={-32} y={-13} width={64} height={26} rx={2} fill={METAL} stroke={SH} strokeWidth={1.6} />
          {sheen(-32, -13, 64, 4)}
          <rect x={-25} y={-7} width={50} height={14} rx={1.5} fill={DARK} />
          {Array.from({ length: 7 }, (_, i) => -21 + i * 6.4).map((x) => (
            <rect key={x} x={x} y={-5} width={3} height={10} fill={GOLD} />
          ))}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-28} y={-14} width={44} height={28} rx={5} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {sheen(-23, -11, 34, 4)}
          {cable(16, 34, 14)}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-50} y={-9} width={58} height={18} rx={2} fill={METAL} stroke={SH} strokeWidth={1.3} />
          {sheen(-46, -7, 50, 3)}
          <rect x={6} y={-13} width={22} height={26} rx={5} fill={BOOT} stroke={BLACK} strokeWidth={1} />
          {cable(26, 24)}
        </>
      ),
    },
  ],
};

// ── INTERNAL POWER & DATA CABLES ─────────────────────────────────────────────
const YEL = "#e0a800";
const RED = "#c0392b";
const ORG = "#d98a2b";

const CABLE_VIEWS: Record<string, ViewSet> = {
  "sata-data": [
    {
      name: "Front",
      draw: () => (
        <>
          {/* L-keyed wafer */}
          <path d="M -26 -12 H 22 V 6 H 10 V 12 H -26 Z" fill={BLACK} stroke="#3a424c" strokeWidth={1.4} strokeLinejoin="round" />
          {Array.from({ length: 7 }, (_, i) => -22 + i * 5.6).map((x) => (
            <rect key={x} x={x} y={-9} width={2.8} height={9} fill={GOLD} />
          ))}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-30} y={-9} width={22} height={18} rx={2} fill={BLACK} stroke="#3a424c" strokeWidth={1.2} />
          <rect x={-8} y={-5} width={50} height={10} rx={2} fill={RED} />
          {sheen(-6, -4, 44, 2)}
        </>
      ),
    },
    {
      name: "Side",
      draw: () => (
        <>
          <path d="M -22 -12 H 12 V 2 H 2 V 12 H -22 Z" fill={DARK} stroke="#3a424c" strokeWidth={1.3} strokeLinejoin="round" />
          <rect x={10} y={-4} width={34} height={8} rx={3} fill={RED} />
        </>
      ),
    },
  ],
  "sata-power": [
    {
      name: "Front",
      draw: () => (
        <>
          <path d="M -34 -12 H 30 V 6 H 14 V 12 H -34 Z" fill={BLACK} stroke="#3a424c" strokeWidth={1.4} strokeLinejoin="round" />
          {Array.from({ length: 15 }, (_, i) => -31 + i * 4.3).map((x) => (
            <rect key={x} x={x} y={-9} width={2.2} height={9} fill={GOLD} />
          ))}
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-34} y={-12} width={24} height={24} rx={2} fill={BLACK} stroke="#3a424c" strokeWidth={1.2} />
          {[ORG, RED, BLACK, "#3a424c", YEL].map((c, i) => (
            <rect key={i} x={-10} y={-10 + i * 4.4} width={50} height={3.2} rx={1} fill={c} />
          ))}
        </>
      ),
    },
    {
      name: "Side",
      draw: () => (
        <>
          <path d="M -24 -12 H 14 V 2 H 4 V 12 H -24 Z" fill={DARK} stroke="#3a424c" strokeWidth={1.3} strokeLinejoin="round" />
          {[ORG, RED, YEL].map((c, i) => (
            <rect key={i} x={12} y={-7 + i * 5} width={34} height={3.4} rx={1} fill={c} />
          ))}
        </>
      ),
    },
  ],
  atx24: [
    {
      name: "Front",
      draw: () => (
        <>
          <rect x={-26} y={-26} width={48} height={52} rx={4} fill={BLACK} stroke="#3a424c" strokeWidth={1.4} />
          <rect x={22} y={-8} width={6} height={16} rx={2} fill="#3a424c" />
          {Array.from({ length: 12 }, (_, r) => r).flatMap((r) =>
            [-13, 13].map((x) => (
              <rect key={`${r}-${x}`} x={x - 4.5} y={-22 + r * 3.9} width={9} height={2.8} rx={0.6} fill="#aeb8c4" />
            )),
          )}
        </>
      ),
    },
    {
      name: "Side",
      draw: () => (
        <>
          <rect x={-12} y={-26} width={30} height={52} rx={3} fill={DARK} stroke="#3a424c" strokeWidth={1.3} />
          {/* retention latch */}
          <path d="M -12 -18 L -22 -14 L -22 14 L -12 18 Z" fill="#454e58" stroke="#3a424c" strokeWidth={1} strokeLinejoin="round" />
          {cable(16, 30, 44)}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-26} y={-26} width={40} height={52} rx={4} fill="#454e58" stroke="#3a424c" strokeWidth={1.2} />
          {Array.from({ length: 6 }, (_, r) => r).flatMap((r) =>
            [-14, 14].map((x, c) => (
              <rect key={`${r}-${c}`} x={14} y={-22 + r * 8} width={34} height={5} rx={2.5} fill={[YEL, BLACK, RED, ORG, "#7a51a8", BLACK][r]} />
            )),
          )}
        </>
      ),
    },
  ],
  molex: [
    {
      name: "Front",
      draw: () => (
        <>
          <path d="M -34 -13 H 30 V 13 H -28 Q -34 13 -34 7 V -7 Q -34 -13 -28 -13 Z" fill="#e8e3d2" stroke="#b9b39c" strokeWidth={1.5} strokeLinejoin="round" />
          {[-22, -8, 6, 20].map((x) => (
            <circle key={x} cx={x} cy={0} r={5} fill="#c0cad6" stroke="#8593a3" strokeWidth={1.2} />
          ))}
          {[-22, -8, 6, 20].map((x) => <circle key={`c${x}`} cx={x} cy={0} r={2} fill="#73808f" />)}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-30} y={-15} width={26} height={30} rx={4} fill="#d8d2bd" stroke="#b9b39c" strokeWidth={1.3} />
          {[YEL, BLACK, BLACK, RED].map((c, i) => (
            <rect key={i} x={-6} y={-12 + i * 6.4} width={44} height={4} rx={2} fill={c} />
          ))}
        </>
      ),
    },
    {
      name: "Side",
      draw: () => (
        <>
          <path d="M -22 -13 H 16 V 13 H -16 Q -22 13 -22 7 V -7 Q -22 -13 -16 -13 Z" fill="#e0dac7" stroke="#b9b39c" strokeWidth={1.3} strokeLinejoin="round" />
          {[YEL, RED].map((c, i) => <rect key={i} x={14} y={-7 + i * 8} width={32} height={5} rx={2.5} fill={c} />)}
        </>
      ),
    },
  ],
  pcie: [
    {
      name: "Front",
      draw: () => (
        <>
          <rect x={-32} y={-14} width={64} height={28} rx={3} fill={BLACK} stroke="#3a424c" strokeWidth={1.4} />
          <rect x={-36} y={-6} width={5} height={12} rx={2} fill="#3a424c" />
          {[-10, 4].map((y) =>
            [-26, -18, -10, -2].map((x) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={6.5} height={6.5} rx={1} fill="#aeb8c4" stroke="#73808f" strokeWidth={0.4} />
            )),
          )}
          {/* the detachable +2 pins shaded */}
          <rect x={6} y={-12} width={24} height={24} rx={2} fill="#2a2f38" opacity={0.5} />
          {[-10, 4].map((y) =>
            [6, 14].map((x) => (
              <rect key={`x${x}-${y}`} x={x} y={y} width={6.5} height={6.5} rx={1} fill="#aeb8c4" stroke="#73808f" strokeWidth={0.4} />
            )),
          )}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-30} y={-15} width={26} height={30} rx={4} fill="#454e58" stroke="#3a424c" strokeWidth={1.2} />
          {Array.from({ length: 4 }, (_, i) => i).map((i) => (
            <rect key={i} x={-6} y={-12 + i * 6.6} width={44} height={4.4} rx={2} fill={[BLACK, BLACK, BLACK, BLACK][i]} />
          ))}
        </>
      ),
    },
    {
      name: "Side",
      draw: () => (
        <>
          <rect x={-14} y={-14} width={28} height={28} rx={3} fill={DARK} stroke="#3a424c" strokeWidth={1.3} />
          <path d="M -14 -10 L -22 -7 L -22 7 L -14 10 Z" fill="#454e58" stroke="#3a424c" strokeWidth={1} strokeLinejoin="round" />
          {cable(12, 32, 22)}
        </>
      ),
    },
  ],
  eps: [
    {
      name: "Front",
      draw: () => (
        <>
          <rect x={-30} y={-14} width={60} height={28} rx={3} fill="#2a2f38" stroke="#3a424c" strokeWidth={1.4} />
          <rect x={-34} y={-6} width={5} height={12} rx={2} fill="#3a424c" />
          {[-10, 4].map((y) =>
            [-24, -16, -8, 0].map((x) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={6.5} height={6.5} rx={2.5} fill="#aeb8c4" stroke="#73808f" strokeWidth={0.4} />
            )),
          )}
          {[-10, 4].map((y) =>
            [8, 16].map((x) => (
              <rect key={`r${x}-${y}`} x={x} y={y} width={6.5} height={6.5} rx={1} fill="#aeb8c4" stroke="#73808f" strokeWidth={0.4} />
            )),
          )}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-30} y={-15} width={26} height={30} rx={4} fill="#454e58" stroke="#3a424c" strokeWidth={1.2} />
          {[YEL, YEL, BLACK, BLACK].map((c, i) => (
            <rect key={i} x={-6} y={-12 + i * 6.6} width={44} height={4.4} rx={2} fill={c} />
          ))}
        </>
      ),
    },
    {
      name: "Side",
      draw: () => (
        <>
          <rect x={-14} y={-14} width={28} height={28} rx={3} fill={DARK} stroke="#3a424c" strokeWidth={1.3} />
          <path d="M -14 -10 L -22 -7 L -22 7 L -14 10 Z" fill="#454e58" stroke="#3a424c" strokeWidth={1} strokeLinejoin="round" />
          {cable(12, 32, 22)}
        </>
      ),
    },
  ],
};

// ── STORAGE & MEMORY ─────────────────────────────────────────────────────────
const dimmFingers = (notchLo: number, notchHi: number, x0: number, x1: number) =>
  Array.from({ length: Math.round((x1 - x0) / 3) }, (_, i) => x0 + i * 3)
    .filter((x) => x < notchLo || x > notchHi)
    .map((x) => <rect key={x} x={x} y={11} width={1.9} height={6} fill={GOLD} />);

const STORAGE_VIEWS: Record<string, ViewSet> = {
  dimm: [
    {
      name: "Front",
      draw: () => (
        <>
          <rect x={-54} y={-17} width={108} height={34} rx={2} fill={PCB} stroke={PCBE} strokeWidth={1.2} />
          {[-50, -38, -26, -14, 14, 26, 38, 50].map((x) => (
            <rect key={x} x={x - 5} y={-12} width={10} height={14} rx={1} fill="#2a2f38" />
          ))}
          <rect x={-9} y={-13} width={18} height={11} rx={1} fill="#dfe5ec" />
          {dimmFingers(-5, 3, -52, 52)}
          {/* keying notch (cut through the gold edge) */}
          <rect x={-4} y={11} width={6} height={8} className="fill-card" />
        </>
      ),
    },
    {
      name: "Edge (key)",
      draw: () => (
        <>
          <rect x={-54} y={-7} width={108} height={14} rx={1.5} fill={PCB} stroke={PCBE} strokeWidth={1.2} />
          {Array.from({ length: 34 }, (_, i) => -52 + i * 3)
            .filter((x) => x < -5 || x > 3)
            .map((x) => <rect key={x} x={x} y={-5} width={1.9} height={10} fill={GOLD} />)}
          <rect x={-5} y={-7} width={8} height={14} className="fill-card" />
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-54} y={-5} width={108} height={10} rx={2} fill={PCB} stroke={PCBE} strokeWidth={1} />
          {[-46, -32, -18, 18, 32, 46].map((x) => <rect key={x} x={x - 5} y={-9} width={10} height={5} rx={1} fill="#2a2f38" />)}
          {sheen(-50, -4, 100, 2)}
        </>
      ),
    },
  ],
  sodimm: [
    {
      name: "Front",
      draw: () => (
        <>
          <rect x={-44} y={-16} width={88} height={32} rx={2} fill={PCB} stroke={PCBE} strokeWidth={1.2} />
          {[-38, -26, -14, 16, 28, 40].map((x) => (
            <rect key={x} x={x - 5} y={-11} width={10} height={13} rx={1} fill="#2a2f38" />
          ))}
          <rect x={-9} y={-12} width={18} height={10} rx={1} fill="#dfe5ec" />
          {Array.from({ length: 28 }, (_, i) => -42 + i * 3)
            .filter((x) => x < 6 || x > 14)
            .map((x) => <rect key={x} x={x} y={10} width={1.8} height={6} fill={GOLD} />)}
          <rect x={7} y={10} width={6} height={8} className="fill-card" />
        </>
      ),
    },
    {
      name: "Edge (key)",
      draw: () => (
        <>
          <rect x={-44} y={-7} width={88} height={14} rx={1.5} fill={PCB} stroke={PCBE} strokeWidth={1.2} />
          {Array.from({ length: 28 }, (_, i) => -42 + i * 3)
            .filter((x) => x < 6 || x > 14)
            .map((x) => <rect key={x} x={x} y={-5} width={1.8} height={10} fill={GOLD} />)}
          <rect x={7} y={-7} width={7} height={14} className="fill-card" />
        </>
      ),
    },
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-44} y={-5} width={88} height={10} rx={2} fill={PCB} stroke={PCBE} strokeWidth={1} />
          {[-36, -22, 22, 36].map((x) => <rect key={x} x={x - 5} y={-9} width={10} height={5} rx={1} fill="#2a2f38" />)}
          {sheen(-40, -4, 80, 2)}
        </>
      ),
    },
  ],
  m2: [
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-52} y={-12} width={92} height={24} rx={2} fill={PCB} stroke={PCBE} strokeWidth={1.2} />
          {/* M-key edge fingers (left) */}
          {Array.from({ length: 16 }, (_, i) => -50 + i * 1.7).map((x) => (
            <rect key={x} x={x} y={-10} width={1} height={20} fill={GOLD} />
          ))}
          <rect x={-30} y={-3} width={3} height={13} className="fill-card" />
          {/* controller + NAND */}
          <rect x={-20} y={-8} width={14} height={16} rx={1} fill="#2a2f38" />
          <rect x={-2} y={-8} width={16} height={16} rx={1} fill="#1c2127" />
          <rect x={18} y={-8} width={16} height={16} rx={1} fill="#1c2127" />
          {/* mounting semicircle + screw notch (right) */}
          <circle cx={42} cy={0} r={6} fill="none" stroke={PCBE} strokeWidth={2} />
          <path d="M 40 -12 H 50 V 12 H 40" fill="none" stroke={PCBE} strokeWidth={1} />
        </>
      ),
    },
    {
      name: "Bottom",
      draw: () => (
        <>
          <rect x={-52} y={-12} width={92} height={24} rx={2} fill="#16713f" stroke={PCBE} strokeWidth={1.2} />
          {Array.from({ length: 16 }, (_, i) => -50 + i * 1.7).map((x) => (
            <rect key={x} x={x} y={-10} width={1} height={20} fill={GOLD} />
          ))}
          <rect x={-22} y={-8} width={42} height={12} rx={1} fill="#cfd6de" />
          <circle cx={42} cy={0} r={6} fill="none" stroke={PCBE} strokeWidth={2} />
        </>
      ),
    },
    {
      name: "Edge (key)",
      draw: () => (
        <>
          <rect x={-50} y={-7} width={100} height={14} rx={1.5} fill={PCB} stroke={PCBE} strokeWidth={1.2} />
          {Array.from({ length: 50 }, (_, i) => -48 + i * 2)
            .filter((x) => x < 24 || x > 30)
            .map((x) => <rect key={x} x={x} y={-5} width={1.2} height={10} fill={GOLD} />)}
          <rect x={24} y={-7} width={6} height={14} className="fill-card" />
        </>
      ),
    },
  ],
  ssd25: [
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-38} y={-28} width={76} height={56} rx={4} fill={METALH} stroke={SH} strokeWidth={1.6} />
          {sheen(-34, -24, 68, 5)}
          <rect x={-28} y={-18} width={50} height={28} rx={2} fill="#39434f" />
          <rect x={-24} y={-13} width={34} height={6} rx={1} fill="#aeb8c4" opacity={0.6} />
        </>
      ),
    },
    {
      name: "Bottom",
      draw: () => (
        <>
          <rect x={-38} y={-28} width={76} height={56} rx={4} fill="#b6c0cc" stroke={SH} strokeWidth={1.6} />
          {[[-30, -20], [30, -20], [-30, 20], [30, 20]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3} fill="#73808f" />
          ))}
          <rect x={-20} y={-10} width={40} height={20} rx={2} fill="#9aa6b4" />
        </>
      ),
    },
    {
      name: "Connector",
      draw: () => (
        <>
          <rect x={-44} y={-16} width={88} height={32} rx={3} fill="#9aa6b4" stroke={SH} strokeWidth={1.4} />
          {/* SATA data (7) + power (15) L-keyed slots */}
          <path d="M -38 -8 H -10 V 4 H -16 V 8 H -38 Z" fill={BLACK} />
          {Array.from({ length: 7 }, (_, i) => -36 + i * 3.6).map((x) => <rect key={`d${x}`} x={x} y={-6} width={1.8} height={6} fill={GOLD} />)}
          <path d="M -4 -8 H 38 V 4 H 32 V 8 H -4 Z" fill={BLACK} />
          {Array.from({ length: 15 }, (_, i) => -2 + i * 2.6).map((x) => <rect key={`p${x}`} x={x} y={-6} width={1.4} height={6} fill={GOLD} />)}
        </>
      ),
    },
  ],
  hdd35: [
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-48} y={-30} width={96} height={60} rx={3} fill={METALH} stroke={SH} strokeWidth={1.6} />
          {sheen(-44, -26, 88, 6)}
          <rect x={-34} y={-18} width={56} height={32} rx={2} fill="#cdd6df" stroke="#9aa6b4" strokeWidth={1} />
          <rect x={-30} y={-13} width={40} height={6} rx={1} fill="#9aa6b4" />
          {[[-40, -23], [40, -23], [-40, 23], [40, 23]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.6} fill="#73808f" />
          ))}
        </>
      ),
    },
    {
      name: "Bottom (PCB)",
      draw: () => (
        <>
          <rect x={-48} y={-30} width={96} height={60} rx={3} fill="#9aa6b4" stroke={SH} strokeWidth={1.4} />
          <rect x={-40} y={-22} width={70} height={44} rx={2} fill={PCB} stroke={PCBE} strokeWidth={1.2} />
          <rect x={-30} y={-14} width={20} height={20} rx={1} fill="#1c2127" />
          <rect x={-4} y={-12} width={14} height={14} rx={1} fill="#2a2f38" />
          <rect x={14} y={-10} width={10} height={20} rx={1} fill="#2a2f38" />
        </>
      ),
    },
    {
      name: "Connector",
      draw: () => (
        <>
          <rect x={-46} y={-15} width={92} height={30} rx={2} fill="#39434f" stroke={SH} strokeWidth={1.2} />
          {/* jumper pins, SATA data, SATA power */}
          {[[-40, -6], [-40, 2], [-34, -6], [-34, 2]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={3} height={3} fill={GOLD} />
          ))}
          <rect x={-24} y={-8} width={26} height={14} rx={1.5} fill={BLACK} />
          {Array.from({ length: 7 }, (_, i) => -22 + i * 3.4).map((x) => <rect key={`d${x}`} x={x} y={-6} width={1.8} height={6} fill={GOLD} />)}
          <rect x={6} y={-8} width={38} height={14} rx={1.5} fill={BLACK} />
          {Array.from({ length: 15 }, (_, i) => 8 + i * 2.4).map((x) => <rect key={`p${x}`} x={x} y={-6} width={1.3} height={6} fill={GOLD} />)}
        </>
      ),
    },
  ],
  flash: [
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-6} y={-15} width={46} height={30} rx={6} fill="#2b333d" stroke={BLACK} strokeWidth={1} />
          {sheen(-2, -12, 38, 5)}
          <circle cx={32} cy={0} r={5} fill="none" stroke="#6b7480" strokeWidth={2.2} />
          <rect x={-40} y={-11} width={36} height={22} rx={2} fill={METAL} stroke={SH} strokeWidth={1.4} />
          {sheen(-38, -9, 30, 4)}
          <rect x={-35} y={-5} width={26} height={11} rx={1} fill={DARK} />
        </>
      ),
    },
    {
      name: "Bottom",
      draw: () => (
        <>
          <rect x={-6} y={-15} width={46} height={30} rx={6} fill="#222932" stroke={BLACK} strokeWidth={1} />
          <rect x={2} y={-9} width={28} height={18} rx={2} fill="#cfd6de" opacity={0.7} />
          <circle cx={32} cy={0} r={5} fill="none" stroke="#6b7480" strokeWidth={2.2} />
          <rect x={-40} y={-11} width={36} height={22} rx={2} fill="#9aa6b4" stroke={SH} strokeWidth={1.4} />
        </>
      ),
    },
    {
      name: "Connector",
      draw: () => (
        <>
          <rect x={-34} y={-20} width={68} height={40} rx={3} fill={METAL} stroke={SH} strokeWidth={1.6} />
          {sheen(-34, -20, 68, 5)}
          <rect x={-26} y={-13} width={52} height={26} rx={2} fill="#39434f" />
          <rect x={-22} y={-4} width={44} height={11} rx={1.5} fill={WHITE} />
          {[-18, -6, 6, 18].map((x) => <rect key={x} x={x - 3} y={-2} width={7} height={6} rx={1} fill={GOLD} />)}
        </>
      ),
    },
  ],
};

// ── CORE PC COMPONENTS ───────────────────────────────────────────────────────
const COMPONENT_VIEWS: Record<string, ViewSet> = {
  cpu: [
    {
      name: "Top (IHS)",
      draw: () => (
        <>
          <rect x={-28} y={-28} width={56} height={56} rx={3} fill="#2a2f38" stroke={BLACK} strokeWidth={1.2} />
          <rect x={-20} y={-20} width={40} height={40} rx={3} fill={METALH} stroke={SH} strokeWidth={1.3} />
          {sheen(-16, -16, 32, 5)}
          <path d="M -20 12 L -12 20 L -20 20 Z" fill={GOLD} />
          <rect x={-12} y={-6} width={24} height={2.4} rx={1} fill="#8593a3" />
          <rect x={-12} y={0} width={18} height={2} rx={1} fill="#8593a3" />
          {[[-24, -24], [24, -24], [-24, 24], [24, 24]].map(([x, y], i) => (
            <rect key={i} x={x - 2.5} y={y - 2.5} width={5} height={5} rx={1} fill="#1c2127" />
          ))}
        </>
      ),
    },
    {
      name: "Bottom (pins)",
      draw: () => (
        <>
          <rect x={-28} y={-28} width={56} height={56} rx={3} fill="#161a20" stroke={BLACK} strokeWidth={1.2} />
          {Array.from({ length: 11 }, (_, r) => r).flatMap((r) =>
            Array.from({ length: 11 }, (_, c) => c).map((c) => (
              <circle key={`${r}-${c}`} cx={-22 + c * 4.4} cy={-22 + r * 4.4} r={1.3} fill={GOLD} />
            )),
          )}
          <path d="M -26 18 L -18 26 L -26 26 Z" fill="#d9ad44" />
          {[[-6, 0], [6, 0], [0, 8]].map(([x, y], i) => <rect key={i} x={x - 3} y={y - 1.5} width={6} height={3} fill="#2a2f38" />)}
        </>
      ),
    },
    {
      name: "Side",
      draw: () => (
        <>
          <rect x={-28} y={2} width={56} height={7} rx={1} fill="#2a2f38" stroke={BLACK} strokeWidth={1} />
          <rect x={-22} y={-6} width={44} height={9} rx={1.5} fill={METALH} stroke={SH} strokeWidth={1.1} />
          {[-24, -16, 16, 22].map((x) => <rect key={x} x={x} y={9} width={3} height={4} fill="#1c2127" />)}
        </>
      ),
    },
  ],
  gpu: [
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-52} y={-18} width={92} height={34} rx={2} fill="#2a2f38" stroke={BLACK} strokeWidth={1.2} />
          <rect x={-50} y={-22} width={84} height={22} rx={3} fill="#39434f" />
          {[-26, 8].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-7} r={13} fill="#1c2127" stroke="#5a6573" strokeWidth={1} />
              {Array.from({ length: 7 }, (_, i) => (i * 360) / 7).map((a) => {
                const rad = (a * Math.PI) / 180;
                return <path key={a} d={`M ${cx + 3 * Math.cos(rad)} ${-7 + 3 * Math.sin(rad)} Q ${cx + 11 * Math.cos(rad + 0.5)} ${-7 + 11 * Math.sin(rad + 0.5)} ${cx + 12 * Math.cos(rad + 0.9)} ${-7 + 12 * Math.sin(rad + 0.9)}`} fill="none" stroke="#5a6573" strokeWidth={1.6} strokeLinecap="round" />;
              })}
              <circle cx={cx} cy={-7} r={3} fill="#73808f" />
            </g>
          ))}
          <rect x={-54} y={-22} width={5} height={38} rx={1} fill={METAL} stroke={SH} strokeWidth={0.6} />
          {Array.from({ length: 8 }, (_, i) => -34 + i * 8).map((x) => <rect key={x} x={x} y={16} width={6} height={5} fill={GOLD} />)}
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-52} y={-20} width={94} height={40} rx={3} fill="#b6c0cc" stroke={SH} strokeWidth={1.5} />
          {sheen(-48, -16, 86, 5)}
          {[[-30, 0], [10, 0]].map(([x, y], i) => (
            <path key={i} d={`M ${x} ${y - 10} L ${x + 16} ${y - 10} L ${x + 8} ${y + 10} L ${x - 8} ${y + 10} Z`} fill="#9aa6b4" opacity={0.7} />
          ))}
          <rect x={28} y={-6} width={10} height={12} rx={1} fill="#8593a3" />
        </>
      ),
    },
    {
      name: "I/O ports",
      draw: () => (
        <>
          <rect x={-10} y={-30} width={20} height={60} rx={1} fill="#cdd6df" stroke={SH} strokeWidth={1.2} />
          {[-22, -6, 10].map((y) => (
            <rect key={y} x={-7} y={y} width={14} height={9} rx={1.5} fill="#1c2127" />
          ))}
          {[-22, -6, 10].map((y) => <rect key={`g${y}`} x={-5} y={y + 6} width={10} height={1.6} fill={GOLD} />)}
          {/* PCIe gold edge below the bracket */}
          <rect x={-44} y={22} width={70} height={8} rx={1} fill={PCB} />
          {Array.from({ length: 18 }, (_, i) => -42 + i * 4).map((x) => <rect key={x} x={x} y={24} width={2} height={6} fill={GOLD} />)}
        </>
      ),
    },
  ],
  mobo: [
    {
      name: "Top",
      draw: () => (
        <>
          <rect x={-40} y={-30} width={80} height={60} rx={3} fill={PCB} stroke={PCBE} strokeWidth={1.4} />
          <rect x={-32} y={-24} width={22} height={22} rx={2} fill="#39434f" stroke="#9aa6b4" strokeWidth={1} />
          {[-2, 4, 10, 16].map((x) => <rect key={x} x={x} y={-26} width={3.4} height={26} rx={1} fill="#1c2127" />)}
          <rect x={-32} y={6} width={26} height={22} rx={2} fill="#2a2f38" />
          <rect x={-30} y={10} width={40} height={5} rx={1} fill="#1c2127" />
          <rect x={-30} y={18} width={30} height={5} rx={1} fill="#1c2127" />
          <rect x={20} y={6} width={16} height={16} rx={2} fill="#454e58" />
        </>
      ),
    },
    {
      name: "Rear I/O",
      draw: () => (
        <>
          <rect x={-52} y={-14} width={104} height={28} rx={2} fill="#cdd6df" stroke={SH} strokeWidth={1.3} />
          {/* PS2 + USB stacks + HDMI + LAN + audio */}
          <circle cx={-44} cy={-4} r={4} fill="#6f4aa0" />
          {[-30, -18].map((x) => <rect key={x} x={x} y={-8} width={9} height={6} rx={1} fill="#1c2127" />)}
          {[-30, -18].map((x) => <rect key={`b${x}`} x={x} y={2} width={9} height={6} rx={1} fill="#3f6fb5" />)}
          <rect x={-4} y={-7} width={14} height={12} rx={1} fill="#2a2f38" />
          <rect x={16} y={-7} width={12} height={11} rx={1} fill="#e8b34a" />
          {[38, 47].map((x) => <circle key={x} cx={x} cy={0} r={3.5} fill={["#2fa874", "#e85d75", "#3f6fb5"][x === 38 ? 0 : 1]} />)}
        </>
      ),
    },
    {
      name: "Edge",
      draw: () => (
        <>
          <rect x={-50} y={6} width={100} height={6} rx={1} fill={PCB} stroke={PCBE} strokeWidth={1} />
          <rect x={-40} y={-6} width={6} height={12} rx={1} fill="#2a2f38" />
          <rect x={-10} y={-14} width={40} height={6} rx={1} fill="#1c2127" />
          {[-30, -22, 34, 42].map((x) => <rect key={x} x={x} y={-2} width={3} height={8} rx={1} fill="#454e58" />)}
        </>
      ),
    },
  ],
  psu: [
    {
      name: "Front (fan)",
      draw: () => (
        <>
          <rect x={-30} y={-26} width={60} height={52} rx={4} fill={METALH} stroke={SH} strokeWidth={1.6} />
          <circle cx={0} cy={0} r={22} fill="#39434f" stroke="#73808f" strokeWidth={1.2} />
          {Array.from({ length: 9 }, (_, i) => (i * 360) / 9).map((a) => {
            const rad = (a * Math.PI) / 180;
            return <path key={a} d={`M ${4 * Math.cos(rad)} ${4 * Math.sin(rad)} Q ${14 * Math.cos(rad + 0.5)} ${14 * Math.sin(rad + 0.5)} ${21 * Math.cos(rad + 0.9)} ${21 * Math.sin(rad + 0.9)}`} fill="none" stroke="#8593a3" strokeWidth={2} strokeLinecap="round" />;
          })}
          <circle cx={0} cy={0} r={4} fill="#73808f" />
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-30} y={-26} width={60} height={52} rx={4} fill="#b6c0cc" stroke={SH} strokeWidth={1.6} />
          {/* honeycomb vent (hex grid hint) */}
          {Array.from({ length: 4 }, (_, r) => r).flatMap((r) =>
            Array.from({ length: 5 }, (_, c) => c).map((c) => (
              <circle key={`${r}-${c}`} cx={-20 + c * 9 + (r % 2) * 4.5} cy={-18 + r * 9} r={3} fill="#73808f" opacity={0.6} />
            )),
          )}
          <rect x={4} y={6} width={22} height={16} rx={2} fill="#2a2f38" />
          <rect x={8} y={9} width={6} height={10} rx={1} fill="#1c2127" />
          <rect x={-26} y={8} width={14} height={12} rx={2} fill="#39434f" />
        </>
      ),
    },
    {
      name: "Cables",
      draw: () => (
        <>
          <rect x={-44} y={-22} width={28} height={44} rx={4} fill={METALH} stroke={SH} strokeWidth={1.4} />
          {[-16, -6, 4, 14].map((y, i) => (
            <g key={i}>
              <path d={`M -16 ${y} Q 6 ${y} 24 ${y - 6 + i * 2}`} fill="none" stroke={[BLACK, YEL, RED, "#3f6fb5"][i]} strokeWidth={3} strokeLinecap="round" />
              <rect x={24} y={y - 10 + i * 2} width={14} height={9} rx={1.5} fill="#2a2f38" />
            </g>
          ))}
        </>
      ),
    },
  ],
  cooler: [
    {
      name: "Front",
      draw: () => (
        <>
          {Array.from({ length: 13 }, (_, i) => -32 + i * 5).map((x) => (
            <rect key={x} x={x} y={-8} width={2.6} height={30} fill={METAL} stroke={SH} strokeWidth={0.4} />
          ))}
          <rect x={-34} y={-24} width={68} height={18} rx={3} fill="#39434f" stroke={SH} strokeWidth={1} />
          <circle cx={0} cy={-15} r={9} fill="#1c2127" />
          {Array.from({ length: 7 }, (_, i) => (i * 360) / 7).map((a) => {
            const rad = (a * Math.PI) / 180;
            return <path key={a} d={`M ${2 * Math.cos(rad)} ${-15 + 2 * Math.sin(rad)} Q ${7 * Math.cos(rad + 0.5)} ${-15 + 7 * Math.sin(rad + 0.5)} ${8 * Math.cos(rad + 0.9)} ${-15 + 8 * Math.sin(rad + 0.9)}`} fill="none" stroke="#5a6573" strokeWidth={1.4} strokeLinecap="round" />;
          })}
        </>
      ),
    },
    {
      name: "Top (fan)",
      draw: () => (
        <>
          <rect x={-28} y={-28} width={56} height={56} rx={6} fill="#2a2f38" stroke="#1c2127" strokeWidth={1} />
          <circle cx={0} cy={0} r={24} fill="#39434f" />
          {Array.from({ length: 9 }, (_, i) => (i * 360) / 9).map((a) => {
            const rad = (a * Math.PI) / 180;
            return <path key={a} d={`M ${5 * Math.cos(rad)} ${5 * Math.sin(rad)} Q ${16 * Math.cos(rad + 0.5)} ${16 * Math.sin(rad + 0.5)} ${23 * Math.cos(rad + 0.9)} ${23 * Math.sin(rad + 0.9)}`} fill="none" stroke="#8593a3" strokeWidth={2.4} strokeLinecap="round" />;
          })}
          <circle cx={0} cy={0} r={6} fill="#1c2127" />
        </>
      ),
    },
    {
      name: "Side",
      draw: () => (
        <>
          {Array.from({ length: 16 }, (_, i) => -30 + i * 4).map((x) => (
            <rect key={x} x={x} y={-22} width={2} height={36} fill={METAL} stroke={SH} strokeWidth={0.3} />
          ))}
          <rect x={-32} y={16} width={64} height={8} rx={2} fill="#8593a3" stroke={SH} strokeWidth={1} />
          {[-14, 0, 14].map((x) => (
            <path key={x} d={`M ${x - 5} 16 V -18 Q ${x - 5} -26 ${x} -26 Q ${x + 5} -26 ${x + 5} -18 V 16`} fill="none" stroke="#c0392b" strokeWidth={2.4} />
          ))}
        </>
      ),
    },
  ],
  fan: [
    {
      name: "Front",
      draw: () => (
        <>
          <rect x={-28} y={-28} width={56} height={56} rx={7} fill="#2a2f38" stroke="#1c2127" strokeWidth={1.2} />
          {[[-22, -22], [22, -22], [-22, 22], [22, 22]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.6} fill="#73808f" />
          ))}
          <circle cx={0} cy={0} r={23} fill="#39434f" />
          {Array.from({ length: 7 }, (_, i) => (i * 360) / 7).map((a) => {
            const rad = (a * Math.PI) / 180;
            return <path key={a} d={`M ${7 * Math.cos(rad)} ${7 * Math.sin(rad)} Q ${20 * Math.cos(rad + 0.5)} ${20 * Math.sin(rad + 0.5)} ${22 * Math.cos(rad + 0.95)} ${22 * Math.sin(rad + 0.95)}`} fill="none" stroke="#8593a3" strokeWidth={2.6} strokeLinecap="round" />;
          })}
          <circle cx={0} cy={0} r={7} fill="#1c2127" />
        </>
      ),
    },
    {
      name: "Back",
      draw: () => (
        <>
          <rect x={-28} y={-28} width={56} height={56} rx={7} fill="#242a32" stroke="#1c2127" strokeWidth={1.2} />
          {[[-22, -22], [22, -22], [-22, 22], [22, 22]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.6} fill="#73808f" />
          ))}
          {Array.from({ length: 4 }, (_, i) => (i * 360) / 4 + 45).map((a) => {
            const rad = (a * Math.PI) / 180;
            return <line key={a} x1={0} y1={0} x2={26 * Math.cos(rad)} y2={26 * Math.sin(rad)} stroke="#454e58" strokeWidth={4} />;
          })}
          <circle cx={0} cy={0} r={11} fill="#1c2127" stroke="#454e58" strokeWidth={1.5} />
          <path d="M 8 -7 Q 30 -14 38 -22" fill="none" stroke={BLACK} strokeWidth={3} strokeLinecap="round" />
        </>
      ),
    },
    {
      name: "Side",
      draw: () => (
        <>
          <rect x={-10} y={-28} width={20} height={56} rx={4} fill="#2a2f38" stroke="#1c2127" strokeWidth={1.2} />
          <rect x={-6} y={-24} width={12} height={48} rx={2} fill="#39434f" />
          <rect x={-3} y={-10} width={6} height={20} rx={2} fill="#1c2127" />
        </>
      ),
    },
  ],
};

export const PART_VIEWS: Record<string, ViewSet> = {
  ...CONNECTOR_VIEWS,
  ...CABLE_VIEWS,
  ...STORAGE_VIEWS,
  ...COMPONENT_VIEWS,
};

/**
 * Enlarged multi-angle illustrations of the selected part, shown under the
 * diagram's info panel. Each angle is its own small SVG card.
 */
export function PartViewsPanel({ id, label }: { id: string; label: string }) {
  const views = PART_VIEWS[id];
  if (!views) return null;
  return (
    <div className="mt-3">
      <div className="mb-2 text-xs font-semibold text-muted-foreground">
        {label} — multiple views
      </div>
      <div className="grid grid-cols-3 gap-2">
        {views.map((v) => (
          <figure key={v.name} className="rounded-md border bg-card p-1.5">
            <svg viewBox="0 0 120 92" role="img" aria-label={`${label} — ${v.name} view`} className="mx-auto h-auto w-full">
              <Defs />
              <g transform="translate(60, 46)">{v.draw()}</g>
            </svg>
            <figcaption className="mt-0.5 text-center text-[10px] font-medium text-muted-foreground">
              {v.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
