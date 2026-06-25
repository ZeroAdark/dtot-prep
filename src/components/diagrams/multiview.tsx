import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Multi-view 2D illustrations. When a part is selected in an interactive
// diagram, its enlarged front/back/top (etc.) views render in the info panel.
// Only parts that appear in a currently-shown diagram (the "Common ports &
// connectors" figure and the motherboard figure) have view-sets here.
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

// Shared palette.
const METAL = "url(#mvMetal)";
const METALH = "url(#mvMetalH)";
const GOLD = "url(#mvGold)";
const PCB = "url(#mvPcb)";
const SH = "#586473"; // shell stroke
const DARK = "#2b333d"; // dark plastic / cavity
const BLACK = "#1c2127";
const WHITE = "#eef1f5"; // tongue
const BOOT = "#3a424c"; // grey over-mould
const CABLE = "#2a2f38";
const PCBE = "#0f5a37"; // PCB edge/stroke

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

export const PART_VIEWS: Record<string, ViewSet> = {
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
  // ── motherboard parts that have a recognisable standalone form ──────────────
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
            <rect key={i} x={-6} y={-12 + i * 6.6} width={44} height={4.4} rx={2} fill={BLACK} />
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
