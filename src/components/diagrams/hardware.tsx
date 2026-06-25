import type { ReactNode } from "react";
import type { DiagramDef } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Additional realistic hardware illustrations (connectors, internal cables,
// storage/memory, core components). Same conventions as defs.tsx: theme-aware
// card cells, clickable parts via data-part, fixed metallic/gold/PCB colors that
// read on light + dark backgrounds.
// ─────────────────────────────────────────────────────────────────────────────

const HW_DEFS = (
  <defs>
    <linearGradient id="hwMetal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#e3e9f0" />
      <stop offset="0.5" stopColor="#aab4c1" />
      <stop offset="1" stopColor="#7c8896" />
    </linearGradient>
    <linearGradient id="hwMetalH" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#eef2f7" />
      <stop offset="0.5" stopColor="#c0cad6" />
      <stop offset="1" stopColor="#8f9dad" />
    </linearGradient>
    <linearGradient id="hwGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f5d471" />
      <stop offset="1" stopColor="#c0942f" />
    </linearGradient>
    <linearGradient id="hwPcb" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2fa874" />
      <stop offset="1" stopColor="#13693f" />
    </linearGradient>
  </defs>
);

const METAL = "url(#hwMetal)";
const METALH = "url(#hwMetalH)";
const GOLD = "url(#hwGold)";
const PCB = "url(#hwPcb)";
const SH = "#586473"; // shell stroke
const DARK = "#2b333d"; // dark plastic / cavity
const BLACK = "#1c2127";

function cell(
  active: string | null,
  id: string,
  label: string,
  ox: number,
  oy: number,
  draw: () => ReactNode,
) {
  const on = active === id;
  const w = 126;
  const h = 122;
  return (
    <g key={id} data-part={id} className="cursor-pointer">
      <rect
        x={ox}
        y={oy}
        width={w}
        height={h}
        rx={12}
        strokeWidth={1.5}
        className={on ? "fill-primary/10 stroke-primary" : "fill-card stroke-border"}
      />
      <g transform={`translate(${ox + w / 2}, ${oy + h / 2 - 9})`}>{draw()}</g>
      <text
        x={ox + w / 2}
        y={oy + h - 13}
        fontSize={11}
        fontWeight={600}
        textAnchor="middle"
        className={on ? "fill-primary" : "fill-muted-foreground"}
      >
        {label}
      </text>
    </g>
  );
}

/** Lay out items in a 3-column grid (viewBox 420 × (rows*138 + 14)). */
function grid(
  active: string | null,
  items: [string, string, () => ReactNode][],
) {
  return items.map(([id, label, draw], i) =>
    cell(active, id, label, 14 + (i % 3) * 134, 14 + Math.floor(i / 3) * 138, draw),
  );
}

// ── More ports & connectors ──────────────────────────────────────────────────
const portsConnectors2: DiagramDef = {
  slug: "ports-connectors-2",
  title: "More ports & connectors",
  caption: "Tap a connector to identify it and where it's used.",
  viewBox: "0 0 420 290",
  parts: [
    { id: "vga", label: "VGA", description: "Analog video — blue 15-pin D-sub (DE-15) with thumbscrews. Legacy monitors/projectors." },
    { id: "dvi", label: "DVI", description: "Digital (and DVI-I analog) video — white connector with a pin grid plus a flat blade. Bridges VGA and HDMI eras." },
    { id: "microb", label: "USB Micro-B", description: "Small trapezoidal USB — older phones and peripherals (USB 2.0). Inserts one way." },
    { id: "rj11", label: "RJ11", description: "Telephone/DSL — 4–6 pin modular plug, narrower than RJ45." },
    { id: "ps2", label: "PS/2", description: "Round 6-pin mini-DIN — legacy keyboard (purple) and mouse (green)." },
    { id: "esata", label: "eSATA", description: "External SATA for storage — like internal SATA but shielded, no L-key, longer reach." },
  ],
  render: (active) => (
    <>
      {HW_DEFS}
      {grid(active, [
        ["vga", "VGA", () => (
          <>
            <circle cx={-44} cy={0} r={4} fill={METAL} stroke={SH} strokeWidth={1} />
            <circle cx={44} cy={0} r={4} fill={METAL} stroke={SH} strokeWidth={1} />
            <path d="M -36 -13 L 36 -13 L 29 13 L -29 13 Z" fill="#3f6fb5" stroke="#284f86" strokeWidth={1.5} strokeLinejoin="round" />
            {[-7, 0, 7].map((y, r) =>
              Array.from({ length: 5 - (r === 2 ? 1 : 0) }, (_, i) => -18 + i * 9).map((x) => (
                <circle key={`${y}-${x}`} cx={x + (r === 1 ? 4.5 : 0)} cy={y} r={1.7} fill={GOLD} />
              )),
            )}
          </>
        )],
        ["dvi", "DVI", () => (
          <>
            <rect x={-38} y={-15} width={76} height={30} rx={3} fill="#eef1f5" stroke="#b6c0cc" strokeWidth={1.5} />
            {[-10, -2, 6].map((y) =>
              [-32, -26, -20, -14, -8, -2, 4, 10].map((x) => (
                <rect key={`${x}-${y}`} x={x} y={y - 1.5} width={3} height={3} fill={METAL} stroke="#8593a3" strokeWidth={0.4} />
              )),
            )}
            <rect x={20} y={-9} width={12} height={18} rx={1.5} fill="#c9d2dc" stroke="#8593a3" strokeWidth={1} />
          </>
        )],
        ["microb", "USB Micro-B", () => (
          <>
            <path d="M -20 -8 L 20 -8 L 15 8 L -15 8 Z" fill={METAL} stroke={SH} strokeWidth={1.5} strokeLinejoin="round" />
            <path d="M -14 -3 L 14 -3 L 11 4 L -11 4 Z" fill={DARK} />
          </>
        )],
        ["rj11", "RJ11", () => (
          <>
            <rect x={-6} y={11} width={12} height={16} rx={3} fill="#6b7480" />
            <rect x={-22} y={-12} width={44} height={24} rx={3} fill="#e3edf3" stroke="#88a0ae" strokeWidth={1.5} />
            <path d="M -5 -12 L 5 -12 L 3.5 -19 L -3.5 -19 Z" fill="#d2e1ea" stroke="#88a0ae" strokeWidth={1.1} strokeLinejoin="round" />
            {[-9, -3, 3, 9].map((x) => <rect key={x} x={x} y={-11} width={3} height={9} rx={0.6} fill={GOLD} />)}
          </>
        )],
        ["ps2", "PS/2", () => (
          <>
            <circle cx={0} cy={0} r={20} fill={METALH} stroke={SH} strokeWidth={1.5} />
            <circle cx={0} cy={0} r={13} fill={DARK} />
            <rect x={-3} y={-13} width={6} height={5} rx={1} fill="#8593a3" />
            {[[-6, -4], [6, -4], [-8, 4], [8, 4], [-3, 8], [3, 8]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={1.7} fill={GOLD} />
            ))}
          </>
        )],
        ["esata", "eSATA", () => (
          <>
            <rect x={-30} y={-13} width={60} height={26} rx={3} fill={METAL} stroke={SH} strokeWidth={1.5} />
            <rect x={-23} y={-7} width={46} height={14} rx={1.5} fill={DARK} />
            {Array.from({ length: 7 }, (_, i) => -20 + i * 6).map((x) => (
              <rect key={x} x={x} y={-5} width={3} height={10} fill={GOLD} />
            ))}
          </>
        )],
      ])}
    </>
  ),
};

// ── Internal power & data cables ─────────────────────────────────────────────
const internalCables: DiagramDef = {
  slug: "internal-cables",
  title: "Internal power & data cables",
  caption: "Tap a connector to identify what it powers or carries.",
  viewBox: "0 0 420 290",
  parts: [
    { id: "sata-data", label: "SATA data", description: "Flat 7-pin L-keyed connector — carries data to one drive (HDD/SSD/optical). Thin cable." },
    { id: "sata-power", label: "SATA power", description: "Wider 15-pin L-keyed connector from the PSU — powers a drive (3.3/5/12 V)." },
    { id: "atx24", label: "24-pin ATX", description: "The main motherboard power connector from the PSU (often 20+4). Large, keyed, with a clip." },
    { id: "molex", label: "Molex", description: "Legacy 4-pin peripheral power (12 V + 5 V) — fans, older drives, accessories." },
    { id: "pcie", label: "PCIe power", description: "6-pin or 6+2 (8-pin) supplemental power for graphics cards." },
    { id: "eps", label: "CPU (EPS) power", description: "4+4 / 8-pin connector that powers the CPU, separate from the 24-pin." },
  ],
  render: (active) => (
    <>
      {HW_DEFS}
      {grid(active, [
        ["sata-data", "SATA data", () => (
          <>
            <rect x={6} y={-5} width={42} height={10} rx={2} fill="#c0392b" />
            <path d="M -34 -11 H 10 V 6 H 2 V 11 H -34 Z" fill={BLACK} stroke="#3a424c" strokeWidth={1} strokeLinejoin="round" />
            {Array.from({ length: 7 }, (_, i) => -30 + i * 5).map((x) => (
              <rect key={x} x={x} y={-8} width={2.4} height={7} fill={GOLD} />
            ))}
          </>
        )],
        ["sata-power", "SATA power", () => (
          <>
            {[-7, -2.5, 2, 6.5].map((y, i) => (
              <rect key={i} x={8} y={y - 1} width={42} height={2.6} fill={["#e0a800", "#c0392b", "#1c2127", "#1c2127"][i]} />
            ))}
            <path d="M -36 -12 H 12 V 8 H 3 V 12 H -36 Z" fill={BLACK} stroke="#3a424c" strokeWidth={1} strokeLinejoin="round" />
            {Array.from({ length: 9 }, (_, i) => -32 + i * 4.6).map((x) => (
              <rect key={x} x={x} y={-9} width={2.2} height={8} fill={GOLD} />
            ))}
          </>
        )],
        ["atx24", "24-pin ATX", () => (
          <>
            <rect x={-26} y={-24} width={52} height={48} rx={4} fill={BLACK} stroke="#3a424c" strokeWidth={1.2} />
            <rect x={26} y={-7} width={6} height={14} rx={2} fill="#3a424c" />
            {Array.from({ length: 12 }, (_, r) => r).flatMap((r) =>
              [-13, 13].map((x) => (
                <rect key={`${r}-${x}`} x={x - 4} y={-21 + r * 3.6} width={8} height={2.6} rx={0.6} fill="#aeb8c4" />
              )),
            )}
          </>
        )],
        ["molex", "Molex", () => (
          <>
            {["#e0a800", "#1c2127", "#1c2127", "#c0392b"].map((c, i) => (
              <rect key={i} x={16} y={-10 + i * 6.5} width={30} height={4} fill={c} />
            ))}
            <path d="M -38 -13 H 16 V 13 H -32 Q -38 13 -38 7 V -7 Q -38 -13 -32 -13 Z" fill="#e8e3d2" stroke="#b9b39c" strokeWidth={1.2} strokeLinejoin="round" />
            {[-27, -15, -3, 9].map((x) => (
              <circle key={x} cx={x} cy={0} r={4.2} fill="#c0cad6" stroke="#8593a3" strokeWidth={1} />
            ))}
          </>
        )],
        ["pcie", "PCIe power", () => (
          <>
            {["#1c2127", "#e0a800", "#1c2127"].map((c, i) => (
              <rect key={i} x={16} y={-9 + i * 7} width={32} height={4} fill={c} />
            ))}
            <rect x={-34} y={-13} width={48} height={26} rx={3} fill={BLACK} stroke="#3a424c" strokeWidth={1.2} />
            <rect x={-37} y={-5} width={5} height={10} rx={2} fill="#3a424c" />
            {[-9, 4].map((y) =>
              [-28, -20, -12, -4].map((x) => (
                <rect key={`${x}-${y}`} x={x} y={y} width={6} height={6} rx={1} fill="#aeb8c4" stroke="#73808f" strokeWidth={0.4} />
              )),
            )}
          </>
        )],
        ["eps", "CPU (EPS) power", () => (
          <>
            {["#1c2127", "#e0a800"].map((c, i) => (
              <rect key={i} x={16} y={-7 + i * 8} width={32} height={4.5} fill={c} />
            ))}
            <rect x={-34} y={-13} width={48} height={26} rx={3} fill="#2a2f38" stroke="#3a424c" strokeWidth={1.2} />
            {[-9, 4].map((y) =>
              [-28, -20, -12, -4].map((x) => (
                <rect key={`${x}-${y}`} x={x} y={y} width={6} height={6} rx={2.5} fill="#aeb8c4" stroke="#73808f" strokeWidth={0.4} />
              )),
            )}
          </>
        )],
      ])}
    </>
  ),
};

// ── Storage & memory ─────────────────────────────────────────────────────────
const storageMemory: DiagramDef = {
  slug: "storage-memory",
  title: "Storage & memory",
  caption: "Tap a part to identify the form factor.",
  viewBox: "0 0 420 290",
  parts: [
    { id: "dimm", label: "RAM (DIMM)", description: "Desktop memory module — long PCB with gold edge contacts and a keying notch. DDR3/4/5." },
    { id: "sodimm", label: "SO-DIMM", description: "Small-outline DIMM — laptop/SFF memory, shorter than a desktop DIMM." },
    { id: "m2", label: "M.2 SSD", description: "Gum-stick SSD that seats in an M.2 slot and runs over PCIe (NVMe) — fastest consumer storage." },
    { id: "ssd25", label: '2.5" SSD', description: "Flat 2.5-inch solid-state drive, usually SATA — no moving parts, silent and shock-resistant." },
    { id: "hdd35", label: '3.5" HDD', description: "3.5-inch mechanical hard drive — spinning platters; high capacity, lower cost per GB." },
    { id: "flash", label: "USB flash drive", description: "Pocket flash storage with a built-in USB-A plug — file transfer and boot media." },
  ],
  render: (active) => (
    <>
      {HW_DEFS}
      {grid(active, [
        ["dimm", "RAM (DIMM)", () => (
          <>
            <rect x={-48} y={-15} width={96} height={26} rx={2} fill={PCB} stroke="#0f5a37" strokeWidth={1} />
            {[-38, -18, 6, 28].map((x) => <rect key={x} x={x} y={-10} width={14} height={11} rx={1} fill="#2a2f38" />)}
            {Array.from({ length: 30 }, (_, i) => -46 + i * 3.1).filter((x) => x < -4 || x > 8).map((x) => (
              <rect key={x} x={x} y={11} width={2} height={5} fill={GOLD} />
            ))}
            <rect x={-2} y={11} width={6} height={5} fill={PCB} />
          </>
        )],
        ["sodimm", "SO-DIMM", () => (
          <>
            <rect x={-38} y={-14} width={76} height={24} rx={2} fill={PCB} stroke="#0f5a37" strokeWidth={1} />
            {[-30, -10, 14].map((x) => <rect key={x} x={x} y={-9} width={14} height={10} rx={1} fill="#2a2f38" />)}
            {Array.from({ length: 24 }, (_, i) => -36 + i * 3.1).filter((x) => x < 6 || x > 16).map((x) => (
              <rect key={x} x={x} y={10} width={2} height={5} fill={GOLD} />
            ))}
          </>
        )],
        ["m2", "M.2 SSD", () => (
          <>
            <rect x={-44} y={-10} width={84} height={20} rx={2} fill={PCB} stroke="#0f5a37" strokeWidth={1} />
            {Array.from({ length: 10 }, (_, i) => -42 + i * 2.4).map((x) => (
              <rect key={x} x={x} y={-9} width={1.4} height={18} fill={GOLD} />
            ))}
            <rect x={-22} y={-7} width={28} height={14} rx={1.5} fill="#2a2f38" />
            <circle cx={42} cy={0} r={5} fill="none" stroke="#0f5a37" strokeWidth={2} />
            <path d="M 40 -10 H 48 V 10 H 40" fill="none" stroke="#0f5a37" strokeWidth={1} />
          </>
        )],
        ["ssd25", '2.5" SSD', () => (
          <>
            <rect x={-34} y={-24} width={68} height={48} rx={4} fill={METALH} stroke={SH} strokeWidth={1.5} />
            <rect x={-26} y={-16} width={40} height={22} rx={2} fill="#39434f" />
            <rect x={-34} y={-2} width={8} height={5} fill={DARK} />
            <rect x={-34} y={6} width={11} height={6} fill={DARK} />
          </>
        )],
        ["hdd35", '3.5" HDD', () => (
          <>
            <rect x={-40} y={-26} width={80} height={52} rx={3} fill={METALH} stroke={SH} strokeWidth={1.5} />
            <circle cx={4} cy={0} r={19} fill="#c2ccd8" stroke="#8593a3" strokeWidth={1} />
            <circle cx={4} cy={0} r={6} fill="#8593a3" />
            <circle cx={-28} cy={-18} r={2.2} fill="#73808f" />
            <circle cx={-28} cy={18} r={2.2} fill="#73808f" />
          </>
        )],
        ["flash", "USB flash drive", () => (
          <>
            {/* plastic casing with a keyring loop */}
            <rect x={-6} y={-15} width={44} height={30} rx={6} fill="#2b333d" stroke="#1c2127" strokeWidth={1} />
            <rect x={-6} y={-15} width={44} height={7} rx={4} fill="#ffffff" opacity={0.07} />
            <circle cx={30} cy={0} r={5} fill="none" stroke="#6b7480" strokeWidth={2.2} />
            {/* seam where the connector meets the body */}
            <rect x={-8} y={-13} width={3} height={26} rx={1} fill="#1c2127" />
            {/* USB-A metal plug */}
            <rect x={-40} y={-10} width={34} height={20} rx={2} fill={METAL} stroke={SH} strokeWidth={1.3} />
            <rect x={-40} y={-10} width={34} height={4} rx={2} fill="#ffffff" opacity={0.3} />
            <rect x={-35} y={-5} width={24} height={10} rx={1} fill={DARK} />
            <rect x={-33} y={-1} width={17} height={5} rx={0.5} fill="#eef1f5" />
            <rect x={-30} y={0} width={5} height={3} fill={GOLD} />
            <rect x={-22} y={0} width={5} height={3} fill={GOLD} />
          </>
        )],
      ])}
    </>
  ),
};

// ── Core PC components ───────────────────────────────────────────────────────
const pcComponents: DiagramDef = {
  slug: "pc-components",
  title: "Core PC components",
  caption: "Tap a component to identify it.",
  viewBox: "0 0 420 290",
  parts: [
    { id: "cpu", label: "CPU", description: "The processor — a chip under a metal heat spreader (IHS). Socket type (LGA/AM5) must match the board." },
    { id: "gpu", label: "Graphics card", description: "Expansion card with its own GPU + VRAM and cooling fans; seats in a PCIe x16 slot and drives displays." },
    { id: "mobo", label: "Motherboard", description: "The main board that interconnects the CPU, RAM, storage, and expansion cards." },
    { id: "psu", label: "Power supply", description: "Converts AC mains to the DC rails (3.3/5/12 V) the PC uses; rated in watts and 80 PLUS efficiency." },
    { id: "cooler", label: "CPU cooler", description: "Heatsink fins + a fan (or liquid block) that move heat away from the CPU." },
    { id: "fan", label: "Case fan", description: "Moves air through the case for airflow; common sizes 120/140 mm." },
  ],
  render: (active) => (
    <>
      {HW_DEFS}
      {grid(active, [
        ["cpu", "CPU", () => (
          <>
            <rect x={-26} y={-26} width={52} height={52} rx={3} fill="#2a2f38" stroke="#1c2127" strokeWidth={1} />
            <rect x={-19} y={-19} width={38} height={38} rx={3} fill={METALH} stroke={SH} strokeWidth={1.2} />
            <path d="M -19 13 L -13 19 L -19 19 Z" fill={GOLD} />
          </>
        )],
        ["gpu", "Graphics card", () => (
          <>
            <rect x={-50} y={-18} width={94} height={30} rx={2} fill="#2a2f38" stroke="#1c2127" strokeWidth={1} />
            <rect x={-48} y={-22} width={86} height={20} rx={3} fill="#3a424c" />
            <circle cx={-22} cy={-12} r={9} fill="#1c2127" stroke="#5a6573" strokeWidth={1} />
            <circle cx={2} cy={-12} r={9} fill="#1c2127" stroke="#5a6573" strokeWidth={1} />
            <circle cx={-22} cy={-12} r={2} fill="#73808f" />
            <circle cx={2} cy={-12} r={2} fill="#73808f" />
            <rect x={-52} y={-22} width={5} height={34} rx={1} fill={METAL} stroke={SH} strokeWidth={0.6} />
            {Array.from({ length: 7 }, (_, i) => -34 + i * 8).map((x) => (
              <rect key={x} x={x} y={12} width={6} height={5} fill={GOLD} />
            ))}
          </>
        )],
        ["mobo", "Motherboard", () => (
          <>
            <rect x={-32} y={-28} width={64} height={56} rx={3} fill={PCB} stroke="#0f5a37" strokeWidth={1.2} />
            <rect x={-24} y={-22} width={22} height={22} rx={2} fill="#2a2f38" stroke="#9aa6b4" strokeWidth={1} />
            {[6, 12, 18].map((x) => <rect key={x} x={x} y={-22} width={4} height={28} rx={1} fill="#1c2127" />)}
            <rect x={-24} y={8} width={42} height={5} rx={1} fill="#1c2127" />
            <rect x={-24} y={16} width={30} height={4} rx={1} fill="#1c2127" />
          </>
        )],
        ["psu", "Power supply", () => (
          <>
            <rect x={-40} y={-24} width={80} height={48} rx={4} fill={METALH} stroke={SH} strokeWidth={1.5} />
            <circle cx={-12} cy={0} r={19} fill="#39434f" stroke="#73808f" strokeWidth={1} />
            {[-35, -18, 0, 18, 35].map((a) => {
              const r1 = 4, r2 = 18;
              const rad = (a * Math.PI) / 180;
              return <line key={a} x1={-12 + r1 * Math.cos(rad)} y1={r1 * Math.sin(rad)} x2={-12 + r2 * Math.cos(rad)} y2={r2 * Math.sin(rad)} stroke="#8593a3" strokeWidth={1.4} />;
            })}
            <circle cx={-12} cy={0} r={3} fill="#73808f" />
            <rect x={20} y={-9} width={14} height={18} rx={2} fill="#2a2f38" />
            {[-4, 1, 6].map((x) => <rect key={x} x={x + 24} y={-2} width={2} height={4} fill="#aeb8c4" />)}
          </>
        )],
        ["cooler", "CPU cooler", () => (
          <>
            {Array.from({ length: 13 }, (_, i) => -30 + i * 5).map((x) => (
              <rect key={x} x={x} y={-6} width={2.4} height={28} fill={METAL} stroke={SH} strokeWidth={0.4} />
            ))}
            <rect x={-32} y={-22} width={64} height={18} rx={3} fill="#39434f" stroke={SH} strokeWidth={1} />
            <circle cx={0} cy={-13} r={8} fill="#1c2127" />
            <circle cx={0} cy={-13} r={2} fill="#73808f" />
          </>
        )],
        ["fan", "Case fan", () => (
          <>
            <rect x={-26} y={-26} width={52} height={52} rx={6} fill="#2a2f38" stroke="#1c2127" strokeWidth={1} />
            {[-20, 20].map((x) => [-20, 20].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} fill="#73808f" />))}
            <circle cx={0} cy={0} r={20} fill="#39434f" />
            {Array.from({ length: 7 }, (_, i) => (i * 360) / 7).map((a) => {
              const rad = (a * Math.PI) / 180;
              return <path key={a} d={`M ${6 * Math.cos(rad)} ${6 * Math.sin(rad)} Q ${18 * Math.cos(rad + 0.5)} ${18 * Math.sin(rad + 0.5)} ${19 * Math.cos(rad + 0.9)} ${19 * Math.sin(rad + 0.9)}`} fill="none" stroke="#8593a3" strokeWidth={2.4} strokeLinecap="round" />;
            })}
            <circle cx={0} cy={0} r={6} fill="#1c2127" />
          </>
        )],
      ])}
    </>
  ),
};

export const HARDWARE_DIAGRAMS: DiagramDef[] = [
  portsConnectors2,
  internalCables,
  storageMemory,
  pcComponents,
];
