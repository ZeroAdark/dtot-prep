import type { DiagramDef } from "./types";
import { HARDWARE_DIAGRAMS } from "./hardware";

// ─────────────────────────────────────────────────────────────────────────────
// Original schematic SVG diagrams for the study hub + test engine.
//
// Every diagram is theme-aware (Tailwind fill-/stroke- utilities map to the app
// color tokens), and exposes clickable parts via `data-part="<id>"`. The
// InteractiveDiagram wrapper handles selection, highlighting, and the info panel.
// ─────────────────────────────────────────────────────────────────────────────

const ON = "fill-primary stroke-primary";
const OFF = "fill-muted stroke-border";
const TXT_ON = "fill-primary-foreground";
const TXT_OFF = "fill-foreground";

// ── Networking: OSI model ────────────────────────────────────────────────────
const osiModel: DiagramDef = {
  slug: "osi-model",
  title: "OSI 7-layer model",
  caption: "Tap a layer to see what it does. Routers live at L3, switches at L2.",
  viewBox: "0 0 320 300",
  parts: [
    { id: "application", label: "7 Application", description: "User-facing protocols — HTTP, SMTP, DNS, FTP. Where apps request network services." },
    { id: "presentation", label: "6 Presentation", description: "Translation, encryption, and compression — TLS, character encoding, JPEG." },
    { id: "session", label: "5 Session", description: "Establishes, manages, and tears down sessions/dialogs between two hosts." },
    { id: "transport", label: "4 Transport", description: "End-to-end delivery and reliability — TCP (reliable) and UDP, plus port numbers." },
    { id: "network", label: "3 Network", description: "Logical addressing and routing between networks — IP addresses and routers." },
    { id: "datalink", label: "2 Data Link", description: "Framing and physical (MAC) addressing on the local link — switches, ARP." },
    { id: "physical", label: "1 Physical", description: "Raw bits on the medium — cables, connectors, voltages, radio signaling." },
  ],
  render: (active) => {
    const rows = [
      ["application", "7 · Application"],
      ["presentation", "6 · Presentation"],
      ["session", "5 · Session"],
      ["transport", "4 · Transport"],
      ["network", "3 · Network"],
      ["datalink", "2 · Data Link"],
      ["physical", "1 · Physical"],
    ];
    return (
      <>
        {rows.map(([id, label], i) => {
          const on = active === id;
          const y = 6 + i * 41;
          return (
            <g key={id} data-part={id} className="cursor-pointer">
              <rect x={18} y={y} width={284} height={35} rx={6} strokeWidth={1.5} className={on ? ON : OFF} />
              <text x={34} y={y + 23} fontSize={14} fontWeight={600} className={on ? TXT_ON : TXT_OFF}>
                {label}
              </text>
            </g>
          );
        })}
      </>
    );
  },
};

// ── Networking: topologies ───────────────────────────────────────────────────
const topologies: DiagramDef = {
  slug: "network-topologies",
  title: "Network topologies",
  caption: "Tap a topology to compare how nodes are wired together.",
  viewBox: "0 0 360 320",
  parts: [
    { id: "star", label: "Star", description: "Every node connects to a central switch/hub. Easy to manage; the central device is a single point of failure. Most common LAN layout." },
    { id: "bus", label: "Bus", description: "All nodes share one backbone cable. Cheap and simple, but a break in the backbone takes down the whole segment; collisions limit it." },
    { id: "ring", label: "Ring", description: "Each node connects to two neighbors forming a loop; data travels around the ring. A single break can disrupt it unless dual-ring/redundant." },
    { id: "mesh", label: "Mesh", description: "Nodes interconnect with many redundant paths. Highly fault-tolerant (used in WANs/wireless backhaul) but costly to cable fully." },
  ],
  render: (active) => {
    const node = (cx: number, cy: number, on: boolean) => (
      <circle cx={cx} cy={cy} r={6} strokeWidth={1.5} className={on ? "fill-primary stroke-primary" : "fill-card stroke-muted-foreground"} />
    );
    const line = (x1: number, y1: number, x2: number, y2: number, on: boolean) => (
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.5} className={on ? "stroke-primary" : "stroke-border"} />
    );
    const quad = (
      id: string,
      label: string,
      ox: number,
      oy: number,
      draw: (on: boolean) => React.ReactNode,
    ) => {
      const on = active === id;
      return (
        <g data-part={id} className="cursor-pointer">
          <rect x={ox} y={oy} width={160} height={120} rx={8} strokeWidth={1.5}
            className={on ? "fill-primary/10 stroke-primary" : "fill-card stroke-border"} />
          {draw(on)}
          <text x={ox + 80} y={oy + 110} fontSize={12} fontWeight={600} textAnchor="middle"
            className={on ? "fill-primary" : "fill-muted-foreground"}>
            {label}
          </text>
        </g>
      );
    };
    return (
      <>
        {/* Star — spokes run from the center node to each outer node */}
        {quad("star", "Star", 12, 10, (on) => {
          const c: [number, number] = [92, 62];
          const outer: [number, number][] = [
            [44, 36],
            [140, 36],
            [44, 90],
            [140, 90],
          ];
          return (
            <>
              {outer.map((p, i) => (
                <g key={`l${i}`}>{line(c[0], c[1], p[0], p[1], on)}</g>
              ))}
              {outer.map((p, i) => (
                <g key={`n${i}`}>{node(p[0], p[1], on)}</g>
              ))}
              {node(c[0], c[1], on)}
            </>
          );
        })}
        {/* Bus */}
        {quad("bus", "Bus", 188, 10, (on) => (
          <>
            {line(200, 60, 336, 60, on)}
            {[210, 245, 280, 315].map((x, i) => (
              <g key={i}>
                {line(x + 6, 60, x + 6, 38, on)}
                {node(x + 6, 32, on)}
              </g>
            ))}
          </>
        ))}
        {/* Ring */}
        {quad("ring", "Ring", 12, 150, (on) => {
          const cx = 92, cy = 198, r = 34;
          const pts = Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
          });
          return (
            <>
              {pts.map((p, i) => {
                const q = pts[(i + 1) % pts.length];
                return <g key={i}>{line(p[0], p[1], q[0], q[1], on)}</g>;
              })}
              {pts.map((p, i) => <g key={`n${i}`}>{node(p[0], p[1], on)}</g>)}
            </>
          );
        })}
        {/* Mesh */}
        {quad("mesh", "Mesh", 188, 150, (on) => {
          const pts: [number, number][] = [[212, 175], [320, 175], [212, 235], [320, 235], [266, 205]];
          const links: [number, number][] = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]];
          return (
            <>
              {links.map(([a, b], i) => <g key={i}>{line(pts[a][0], pts[a][1], pts[b][0], pts[b][1], on)}</g>)}
              {pts.map((p, i) => <g key={`n${i}`}>{node(p[0], p[1], on)}</g>)}
            </>
          );
        })}
      </>
    );
  },
};

// ── Hardware: ports & connectors ─────────────────────────────────────────────
const portsConnectors: DiagramDef = {
  slug: "ports-connectors",
  title: "Common ports & connectors",
  caption: "Tap a connector to identify it and where it's used.",
  viewBox: "0 0 420 290",
  parts: [
    { id: "usb-a", label: "USB-A", description: "Rectangular USB Type-A — keyboards, mice, flash drives. Insert one way; blue tongue = USB 3.x." },
    { id: "usb-c", label: "USB-C", description: "Small reversible oval connector. Carries USB, DisplayPort (alt mode), and power delivery (PD). Modern standard." },
    { id: "rj45", label: "RJ45", description: "8-pin modular Ethernet connector with a locking clip — wired LAN over twisted-pair (Cat5e/6)." },
    { id: "hdmi", label: "HDMI", description: "Digital audio + video to monitors/TVs. Trapezoidal connector; carries HDCP-protected content." },
    { id: "dp", label: "DisplayPort", description: "Digital A/V for monitors; one flat + one notched corner with a latch. Higher refresh/resolution than HDMI on PCs." },
    { id: "audio", label: "3.5mm audio", description: "Analog TRS headphone/mic jack — color-coded green (out) / pink (mic) on desktops." },
  ],
  render: (active) => {
    const cell = (
      id: string,
      label: string,
      col: number,
      row: number,
      draw: () => React.ReactNode,
    ) => {
      const on = active === id;
      const ox = 14 + col * 134;
      const oy = 14 + row * 138;
      return (
        <g data-part={id} className="cursor-pointer">
          <rect x={ox} y={oy} width={126} height={122} rx={12} strokeWidth={1.5}
            className={on ? "fill-primary/10 stroke-primary" : "fill-card stroke-border"} />
          <g transform={`translate(${ox + 63}, ${oy + 50})`}>{draw()}</g>
          <text x={ox + 63} y={oy + 104} fontSize={12} fontWeight={600} textAnchor="middle"
            className={on ? "fill-primary" : "fill-muted-foreground"}>
            {label}
          </text>
        </g>
      );
    };
    return (
      <>
        <defs>
          <linearGradient id="pcMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e3e9f0" />
            <stop offset="0.5" stopColor="#aab4c1" />
            <stop offset="1" stopColor="#7c8896" />
          </linearGradient>
          <linearGradient id="pcMetalH" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef2f7" />
            <stop offset="0.5" stopColor="#c0cad6" />
            <stop offset="1" stopColor="#8f9dad" />
          </linearGradient>
          <linearGradient id="pcGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5d471" />
            <stop offset="1" stopColor="#c0942f" />
          </linearGradient>
        </defs>

        {/* USB-A — metal shell, white tongue, 4 gold contacts */}
        {cell("usb-a", "USB-A", 0, 0, () => (
          <>
            <rect x={-43} y={-19} width={86} height={38} rx={3} fill="url(#pcMetal)" stroke="#586473" strokeWidth={1.5} />
            <rect x={-43} y={-19} width={86} height={5} rx={2} fill="#ffffff" opacity={0.35} />
            <rect x={-35} y={-12} width={70} height={24} rx={2} fill="#39434f" />
            <rect x={-31} y={-3} width={58} height={11} rx={1.5} fill="#eef1f5" />
            {[-27, -12.5, 2, 16.5].map((x) => (
              <rect key={x} x={x} y={-1} width={9} height={6} rx={1} fill="url(#pcGold)" />
            ))}
          </>
        ))}

        {/* USB-C — oval shell, dark cavity, central blade + two rows of contacts */}
        {cell("usb-c", "USB-C", 1, 0, () => (
          <>
            <rect x={-38} y={-15} width={76} height={30} rx={15} fill="url(#pcMetal)" stroke="#586473" strokeWidth={1.5} />
            <rect x={-38} y={-15} width={76} height={5} rx={3} fill="#ffffff" opacity={0.3} />
            <rect x={-31} y={-10} width={62} height={20} rx={10} fill="#20262e" />
            <rect x={-25} y={-4} width={50} height={8} rx={4} fill="#36404b" />
            {[-21, -14, -7, 0, 7, 14, 21].map((x) => (
              <rect key={`t${x}`} x={x - 2} y={-3.4} width={4} height={1.8} rx={0.5} fill="url(#pcGold)" />
            ))}
            {[-21, -14, -7, 0, 7, 14, 21].map((x) => (
              <rect key={`b${x}`} x={x - 2} y={1.6} width={4} height={1.8} rx={0.5} fill="url(#pcGold)" />
            ))}
          </>
        ))}

        {/* RJ45 — translucent modular plug, locking clip, 8 gold pins, cable */}
        {cell("rj45", "RJ45", 2, 0, () => (
          <>
            <rect x={-8} y={12} width={16} height={20} rx={4} fill="#6b7480" />
            <rect x={-31} y={-15} width={62} height={31} rx={3} fill="#e3edf3" stroke="#88a0ae" strokeWidth={1.5} />
            <path d="M -7 -15 L 7 -15 L 5 -24 L -5 -24 Z" fill="#d2e1ea" stroke="#88a0ae" strokeWidth={1.2} strokeLinejoin="round" />
            {Array.from({ length: 8 }, (_, i) => -25 + i * 6.7).map((x) => (
              <rect key={x} x={x} y={-14} width={3.3} height={12} rx={0.6} fill="url(#pcGold)" />
            ))}
          </>
        ))}

        {/* HDMI — tapered (trapezoidal) metal plug */}
        {cell("hdmi", "HDMI", 0, 1, () => (
          <>
            <path d="M -42 -15 L 42 -15 L 33 15 L -33 15 Z" fill="url(#pcMetal)" stroke="#586473" strokeWidth={1.5} strokeLinejoin="round" />
            <path d="M -33 -8 L 33 -8 L 26 9 L -26 9 Z" fill="#39434f" />
            <rect x={-25} y={-2} width={50} height={4} rx={1} fill="url(#pcGold)" opacity={0.85} />
          </>
        ))}

        {/* DisplayPort — rectangular with one chamfered corner */}
        {cell("dp", "DisplayPort", 1, 1, () => (
          <>
            <path d="M -40 -15 L 31 -15 L 40 -6 L 40 15 L -40 15 Z" fill="url(#pcMetal)" stroke="#586473" strokeWidth={1.5} strokeLinejoin="round" />
            <path d="M -32 -8 L 26 -8 L 31 -3 L 31 9 L -32 9 Z" fill="#39434f" />
            <rect x={-24} y={-2} width={46} height={4} rx={1} fill="url(#pcGold)" opacity={0.85} />
          </>
        ))}

        {/* 3.5mm audio — gold TRS plug with insulator rings + barrel */}
        {cell("audio", "3.5mm audio", 2, 1, () => (
          <>
            <rect x={13} y={-10} width={32} height={20} rx={5} fill="url(#pcMetalH)" stroke="#586473" strokeWidth={1.2} />
            <rect x={-44} y={-5.5} width={60} height={11} rx={5.5} fill="url(#pcGold)" stroke="#8f6e22" strokeWidth={1} />
            <rect x={-19} y={-5.5} width={3} height={11} fill="#222a33" />
            <rect x={-4} y={-5.5} width={3} height={11} fill="#222a33" />
          </>
        ))}
      </>
    );
  },
};

// ── Hardware: motherboard layout ─────────────────────────────────────────────
const motherboard: DiagramDef = {
  slug: "motherboard",
  title: "Motherboard layout",
  caption: "Tap a component to learn what plugs in where.",
  viewBox: "0 0 360 318",
  parts: [
    { id: "cpu", label: "CPU socket", description: "Holds the processor under a heatsink/fan. Socket type (LGA/PGA/AM5) must match the CPU." },
    { id: "ram", label: "RAM (DIMM) slots", description: "Memory modules install here. Match in pairs/colors for dual-channel performance." },
    { id: "pcie", label: "PCIe slots", description: "Expansion cards — GPUs (x16), NICs, capture cards. Longer slot = more lanes." },
    { id: "m2", label: "M.2 slot", description: "Compact slot for NVMe SSDs (and some Wi-Fi cards) — far faster than SATA." },
    { id: "sata", label: "SATA ports", description: "Connect 2.5\"/3.5\" drives and optical drives via SATA data cables." },
    { id: "atx", label: "24-pin power", description: "Main ATX power connector from the PSU feeding the board. CPU also has a separate 4/8-pin." },
  ],
  render: (active) => {
    const on = (id: string) => active === id;
    // Selection overlay: a primary outline + faint tint over the realistic part.
    const sel = (id: string, x: number, y: number, w: number, h: number, r = 4) =>
      on(id) ? (
        <rect x={x} y={y} width={w} height={h} rx={r} className="fill-primary/15 stroke-primary" strokeWidth={2.5} />
      ) : null;
    const tag = (x: number, y: number, label: string, id: string) => (
      <text x={x} y={y} fontSize={8.5} fontWeight={700} textAnchor="middle"
        className={on(id) ? "fill-primary" : "fill-foreground"}
        style={{ paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 3 }}>
        {label}
      </text>
    );
    const silk = (x: number, y: number, label: string) => (
      <text x={x} y={y} fontSize={6} fontWeight={600} textAnchor="middle" fill="#bfe3cf" opacity={0.8}>{label}</text>
    );
    const SLOT = "#15191f"; // slot plastic
    const HS = "url(#mbMetal)"; // heatsink metal
    const GOLDc = "url(#mbGold)";
    // One right-angle SATA data port with its L-keyed mouth + 7 single-row contacts.
    const sataPort = (x: number, y: number) => (
      <g key={`sp${x}-${y}`}>
        <path d={`M ${x} ${y} h20 v9 h-5 v4 h-15 z`} fill="#1e4fa0" stroke="#13315f" strokeWidth={0.8} strokeLinejoin="round" />
        <rect x={x + 2} y={y + 2} width={12} height={5} fill="#0e2244" />
        {Array.from({ length: 7 }, (_, i) => x + 2.6 + i * 1.5).map((px) => (
          <rect key={px} x={px} y={y + 2.5} width={0.8} height={4} fill={GOLDc} />
        ))}
      </g>
    );
    return (
      <>
        <defs>
          <linearGradient id="mbPcb" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1c7a4d" />
            <stop offset="1" stopColor="#0e5230" />
          </linearGradient>
          <linearGradient id="mbMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e3e9f0" />
            <stop offset="0.5" stopColor="#b3bdc9" />
            <stop offset="1" stopColor="#828e9c" />
          </linearGradient>
          <linearGradient id="mbGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5d471" />
            <stop offset="1" stopColor="#c0942f" />
          </linearGradient>
        </defs>

        {/* PCB substrate + mounting holes + faint silkscreen traces */}
        <rect x={8} y={8} width={344} height={302} rx={8} fill="url(#mbPcb)" stroke="#0a3d24" strokeWidth={2} />
        {[[24, 24], [336, 24], [24, 294], [336, 294], [190, 24]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4.5} fill="#0a3d24" stroke="#7c8896" strokeWidth={1.5} />
        ))}
        {[60, 130, 290].map((y) => (
          <line key={y} x1={150} y1={y} x2={200} y2={y} stroke="#2fa06a" strokeWidth={0.6} opacity={0.4} />
        ))}

        {/* Rear I/O panel (top-left): a dense strip of varied, colour-coded ports */}
        <rect x={16} y={12} width={120} height={20} rx={2} fill="#1c1f24" stroke="#586473" strokeWidth={1} />
        <circle cx={24} cy={22} r={3.4} fill="#7e57c2" />{/* PS/2 */}
        {[34, 45].map((x) => (
          <g key={x}>
            <rect x={x} y={15} width={8} height={5.5} rx={1} fill="#1565c0" />{/* USB3 stacked pair */}
            <rect x={x} y={22} width={8} height={5.5} rx={1} fill="#1565c0" />
          </g>
        ))}
        <path d="M 58 16 H 74 L 71 28 H 61 Z" fill="#222831" />{/* HDMI */}
        <path d="M 78 16 H 92 L 92 22 L 89 28 H 78 Z" fill="#222831" />{/* DP */}
        <rect x={96} y={15} width={12} height={13} rx={1} fill="#9aa6b4" stroke="#3a424c" strokeWidth={0.6} />{/* RJ45 */}
        <rect x={98} y={26} width={3} height={1.6} fill="#2fa874" /><rect x={103} y={26} width={3} height={1.6} fill="#e0a800" />
        {["#4caf50", "#ff80ab", "#2196f3"].map((c, i) => <circle key={i} cx={116 + i * 7} cy={22} r={3} fill={c} />)}

        {/* 8-pin EPS / CPU power — top edge, above the VRM column */}
        <rect x={146} y={12} width={42} height={17} rx={2} fill="#15181d" stroke="#586473" strokeWidth={1} />
        {[0, 1, 2, 3].map((c) => [0, 1].map((rr) => (
          <rect key={`${c}-${rr}`} x={150 + c * 9} y={15 + rr * 6} width={6} height={4} rx={1} fill="#9aa6b4" />
        )))}
        {silk(167, 39, "EPS 12V")}

        {/* VRM: two finned heatsinks wrapping the socket + a row of power-stage chokes */}
        <rect x={44} y={34} width={92} height={12} rx={2} fill={HS} stroke="#586473" strokeWidth={1} />
        {Array.from({ length: 11 }, (_, i) => 49 + i * 8).map((x) => <line key={`vt${x}`} x1={x} y1={36} x2={x} y2={44} stroke="#7c8896" strokeWidth={0.7} />)}
        <rect x={16} y={50} width={14} height={72} rx={2} fill={HS} stroke="#586473" strokeWidth={1} />
        {Array.from({ length: 8 }, (_, i) => 54 + i * 9).map((y) => <line key={`vl${y}`} x1={18} y1={y} x2={28} y2={y} stroke="#7c8896" strokeWidth={0.7} />)}
        {[138, 146].map((x) => <rect key={x} x={x} y={52} width={6} height={6} rx={1} fill="#1a1c20" />)}

        {/* CPU socket — ILM frame, contact field, pin-1 triangle, load lever */}
        <g data-part="cpu" className="cursor-pointer">
          <rect x={48} y={50} width={80} height={90} rx={4} fill="#11151a" stroke="#3a424c" strokeWidth={1.5} />
          <rect x={56} y={58} width={64} height={74} rx={2} fill="#1c2127" />
          <rect x={60} y={62} width={56} height={66} rx={1.5} fill="#2a2f38" stroke="#454e58" strokeWidth={1} />
          <path d="M 60 62 L 68 62 L 60 70 Z" fill={GOLDc} />{/* pin-1 triangle */}
          <path d="M 128 96 L 138 96 L 138 132" fill="none" stroke="#9aa6b4" strokeWidth={2} strokeLinejoin="round" />{/* load lever */}
          {sel("cpu", 46, 48, 84, 94)}
          {tag(88, 153, "CPU", "cpu")}
        </g>

        {/* DIMM ×4 — dual-channel colour pairs, off-centre key ridge, end latches */}
        <g data-part="ram" className="cursor-pointer">
          {[200, 214, 228, 242].map((x, i) => (
            <g key={x}>
              <rect x={x} y={42} width={11} height={104} rx={2} fill={SLOT} stroke="#3a424c" strokeWidth={1} />
              <rect x={x + 1.5} y={46} width={8} height={96} rx={1} fill={i % 2 === 0 ? "#243a52" : "#3a2440"} />
              <rect x={x} y={42} width={11} height={6} rx={2} fill={i % 2 === 0 ? "#3f6fb5" : "#7a51a8"} />
              <rect x={x} y={140} width={11} height={6} rx={2} fill={i % 2 === 0 ? "#3f6fb5" : "#7a51a8"} />
              <rect x={x + 1.5} y={104} width={8} height={3} fill="#11151a" />{/* off-centre key */}
            </g>
          ))}
          {sel("ram", 196, 40, 57, 108)}
          {tag(278, 96, "DDR ×4", "ram")}
        </g>

        {/* 24-pin ATX main power — right edge, 2×12 with a side latch */}
        <g data-part="atx" className="cursor-pointer">
          <rect x={304} y={46} width={40} height={106} rx={3} fill="#11151a" stroke="#3a424c" strokeWidth={1.5} />
          <rect x={300} y={90} width={5} height={18} rx={2} fill="#454e58" />{/* retention latch */}
          {Array.from({ length: 12 }, (_, r) => r).flatMap((r) =>
            [0, 1].map((c) => (
              <rect key={`${r}-${c}`} x={308 + c * 15} y={50 + r * 8.2} width={11} height={5} rx={1} fill="#9aa6b4" />
            )),
          )}
          {sel("atx", 302, 44, 42, 110)}
          {tag(324, 163, "24-pin", "atx")}
        </g>

        {/* M.2 — SHORT keyed connector + empty channel + standoff (not a long slot) */}
        <g data-part="m2" className="cursor-pointer">
          <rect x={48} y={166} width={40} height={14} rx={2} fill="#1a2129" stroke="#3a424c" strokeWidth={1} />
          {Array.from({ length: 16 }, (_, i) => 51 + i * 2.2).filter((x) => x < 78 || x > 84).map((x) => (
            <rect key={x} x={x} y={168} width={1.1} height={10} fill={GOLDc} />
          ))}
          <rect x={78} y={167} width={6} height={12} rx={1} fill="#0f1318" />{/* M-key */}
          <line x1={88} y1={173} x2={186} y2={173} stroke="#1a4d33" strokeWidth={3} />{/* open channel */}
          <circle cx={190} cy={173} r={4.5} fill="#cdd6df" stroke="#7c8896" strokeWidth={1.2} />{/* standoff */}
          <path d="M 187 173 H 193 M 190 170 V 176" stroke="#5a6573" strokeWidth={0.8} />
          {silk(150, 169, "2280")}
          {sel("m2", 46, 164, 150, 16)}
          {tag(116, 192, "M.2", "m2")}
        </g>

        {/* PCIe x16 (reinforced) + x1 — off-centre key divider, x16 end latch */}
        <g data-part="pcie" className="cursor-pointer">
          <rect x={48} y={198} width={184} height={16} rx={2} fill={SLOT} stroke="#7c8896" strokeWidth={1.6} />
          {Array.from({ length: 33 }, (_, i) => 54 + i * 5.4).filter((x) => x < 86 || x > 95).map((x) => (
            <rect key={x} x={x} y={201} width={1.6} height={10} fill={GOLDc} />
          ))}
          <rect x={86} y={199} width={9} height={14} rx={1} fill={SLOT} />{/* off-centre key divider */}
          <rect x={232} y={200} width={8} height={12} rx={1} fill="#454e58" />{/* end retention latch */}
          <rect x={48} y={230} width={60} height={14} rx={2} fill={SLOT} stroke="#3a424c" strokeWidth={1} />
          {Array.from({ length: 11 }, (_, i) => 53 + i * 5).filter((x) => x < 69 || x > 76).map((x) => (
            <rect key={`s${x}`} x={x} y={233} width={1.6} height={8} fill={GOLDc} />
          ))}
          <rect x={69} y={231} width={7} height={12} rx={1} fill={SLOT} />
          {sel("pcie", 46, 196, 188, 50)}
          {tag(120, 224, "PCIe x16 / x1", "pcie")}
        </g>

        {/* USB 3.x internal header — tall blue box near the 24-pin */}
        <rect x={306} y={170} width={36} height={26} rx={2} fill="#2a52b8" stroke="#1c2a55" strokeWidth={1} />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => [0, 1].map((rr) => (
          <rect key={`u${c}-${rr}`} x={309 + c * 3.6} y={174 + rr * 9} width={1.6} height={6} fill={GOLDc} />
        )))}
        {silk(324, 205, "USB3")}

        {/* SATA — 2×2 block of L-keyed 7-pin data ports */}
        <g data-part="sata" className="cursor-pointer">
          {[[300, 208], [323, 208], [300, 225], [323, 225]].map(([x, y]) => sataPort(x, y))}
          {sel("sata", 297, 205, 47, 36)}
          {tag(321, 252, "SATA", "sata")}
        </g>

        {/* Chipset (PCH) heatsink — lower-right */}
        <rect x={238} y={250} width={54} height={48} rx={4} fill={HS} stroke="#586473" strokeWidth={1.2} />
        {Array.from({ length: 6 }, (_, i) => 244 + i * 8).map((x) => <line key={x} x1={x} y1={254} x2={x} y2={294} stroke="#7c8896" strokeWidth={1} />)}
        {silk(265, 276, "PCH")}

        {/* CMOS coin-cell (CR2032) in its holder — lower-right */}
        <circle cx={216} cy={272} r={16} fill="none" stroke="#9aa6b4" strokeWidth={2} />
        <circle cx={216} cy={272} r={12.5} fill="#dfe5ec" stroke="#aab3bf" strokeWidth={1} />
        <path d="M 206 264 A 12.5 12.5 0 0 1 226 268" fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.7} />
        <rect x={224} y={266} width={6} height={5} rx={1.5} fill="#aab3bf" />{/* spring clip tab */}
        <text x={216} y={274} fontSize={6.5} fontWeight={700} textAnchor="middle" fill="#5a6573">CR2032</text>

        {/* Front-panel / USB2 / fan headers along the bottom edge */}
        <g>
          <rect x={40} y={296} width={26} height={11} rx={1.5} fill="#2a2f38" />{/* F_PANEL 2×5, one key gap */}
          {[0, 1, 2, 3, 4].map((c) => [0, 1].map((rr) => (
            (c === 4 && rr === 1) ? null : <rect key={`f${c}-${rr}`} x={43 + c * 4.6} y={298.5 + rr * 4} width={1.8} height={2.6} fill={GOLDc} />
          )))}
          <rect x={74} y={296} width={24} height={11} rx={1.5} fill="#2a2f38" />{/* USB2 header */}
          {[0, 1, 2, 3, 4].map((c) => [0, 1].map((rr) => (
            <rect key={`u2${c}-${rr}`} x={77 + c * 4.2} y={298.5 + rr * 4} width={1.8} height={2.6} fill={GOLDc} />
          )))}
          {[108, 128].map((x) => (
            <g key={x}>
              <rect x={x} y={299} width={15} height={7} rx={1.5} fill="#2a2f38" />{/* 4-pin fan */}
              {[0, 1, 2, 3].map((c) => <rect key={c} x={x + 2 + c * 3} y={301} width={1.6} height={3} fill={GOLDc} />)}
            </g>
          ))}
        </g>
      </>
    );
  },
};

// ── Cloud: service models ────────────────────────────────────────────────────
const cloudServiceModels: DiagramDef = {
  slug: "cloud-service-models",
  title: "Cloud service models (IaaS / PaaS / SaaS)",
  caption: "Tap a model. Filled = the provider manages it; outlined = you manage it.",
  viewBox: "0 0 360 300",
  parts: [
    { id: "iaas", label: "IaaS", description: "Infrastructure as a Service — provider runs hardware, virtualization, networking, storage. You manage the OS and everything above (e.g. EC2, Compute Engine)." },
    { id: "paas", label: "PaaS", description: "Platform as a Service — provider also manages the OS, runtime, and scaling. You only deploy your app/data (e.g. App Engine, Heroku)." },
    { id: "saas", label: "SaaS", description: "Software as a Service — provider manages everything; you just use the app over the web (e.g. Gmail, Office 365, Salesforce)." },
  ],
  render: (active) => {
    // Layers from top (app) to bottom (hardware). `lines` wraps long labels so
    // they never overflow the box. providerFrom (per column) sets which layers
    // are provider-managed (shaded).
    const layers: string[][] = [
      ["Application"],
      ["Runtime / Data"],
      ["OS"],
      ["Virtualization"],
      ["Servers / Storage", "& Network"],
    ];
    const cols = [
      { id: "iaas", label: "IaaS", providerFrom: 4 },
      { id: "paas", label: "PaaS", providerFrom: 2 },
      { id: "saas", label: "SaaS", providerFrom: 0 },
    ];
    return (
      <>
        {cols.map((c, ci) => {
          const on = active === c.id;
          const ox = 16 + ci * 112;
          return (
            <g key={c.id} data-part={c.id} className="cursor-pointer">
              <text x={ox + 48} y={20} fontSize={13} fontWeight={700} textAnchor="middle"
                className={on ? "fill-primary" : "fill-foreground"}>{c.label}</text>
              {layers.map((lines, li) => {
                const providerManaged = li >= c.providerFrom;
                const y = 30 + li * 48;
                const cy = y + 21;
                return (
                  <g key={li}>
                    <rect x={ox} y={y} width={96} height={42} rx={4} strokeWidth={1.5}
                      className={
                        providerManaged
                          ? on ? "fill-primary stroke-primary" : "fill-primary/70 stroke-primary/70"
                          : "fill-card stroke-muted-foreground/50"
                      } />
                    {lines.map((ln, k) => (
                      <text key={k} x={ox + 48}
                        y={lines.length === 1 ? cy + 3 : cy - 4 + k * 12}
                        fontSize={9} fontWeight={600} textAnchor="middle"
                        className={providerManaged ? "fill-primary-foreground" : "fill-muted-foreground"}>
                        {ln}
                      </text>
                    ))}
                  </g>
                );
              })}
            </g>
          );
        })}
      </>
    );
  },
};

// ── Cloud: deployment models ─────────────────────────────────────────────────
const cloudDeployment: DiagramDef = {
  slug: "cloud-deployment-models",
  title: "Cloud deployment models",
  caption: "Tap a model to compare ownership, tenancy, and control.",
  viewBox: "0 0 360 240",
  parts: [
    { id: "public", label: "Public", description: "Provider-owned, multi-tenant infrastructure shared over the internet (AWS/Azure/GCP). Elastic and low up-front cost; least control." },
    { id: "private", label: "Private", description: "Dedicated to one organization, on-prem or hosted. Maximum control and isolation (compliance/sovereignty); higher cost." },
    { id: "hybrid", label: "Hybrid", description: "Combines public + private with orchestration between them — keep sensitive data private, burst to public for scale." },
    { id: "community", label: "Community", description: "Shared by several organizations with common needs (e.g. agencies/regulatory). Costs and governance are shared." },
  ],
  render: (active) => {
    const card = (id: string, label: string, col: number, row: number) => {
      const on = active === id;
      const ox = 16 + col * 172;
      const oy = 16 + row * 104;
      return (
        <g data-part={id} className="cursor-pointer">
          <rect x={ox} y={oy} width={156} height={88} rx={8} strokeWidth={1.5} className={on ? ON : OFF} />
          <text x={ox + 78} y={oy + 50} fontSize={16} fontWeight={700} textAnchor="middle"
            className={on ? TXT_ON : TXT_OFF}>{label}</text>
        </g>
      );
    };
    return (
      <>
        {card("public", "Public", 0, 0)}
        {card("private", "Private", 1, 0)}
        {card("hybrid", "Hybrid", 0, 1)}
        {card("community", "Community", 1, 1)}
      </>
    );
  },
};

// ── Security: CIA triad ──────────────────────────────────────────────────────
const ciaTriad: DiagramDef = {
  slug: "cia-triad",
  title: "The CIA triad",
  caption: "Tap a goal. Every security control supports one or more of these.",
  viewBox: "0 0 320 280",
  parts: [
    { id: "confidentiality", label: "Confidentiality", description: "Keep data secret from unauthorized parties — encryption, access control, least privilege." },
    { id: "integrity", label: "Integrity", description: "Ensure data isn't altered without authorization — hashing, digital signatures, checksums, version control." },
    { id: "availability", label: "Availability", description: "Keep systems and data accessible when needed — redundancy, backups, DDoS protection, failover." },
  ],
  render: (active) => {
    const A: [number, number] = [160, 30];
    const B: [number, number] = [40, 230];
    const C: [number, number] = [280, 230];
    const vtx = (id: string, p: [number, number], label: string, dy: number) => {
      const on = active === id;
      return (
        <g data-part={id} className="cursor-pointer">
          <circle cx={p[0]} cy={p[1]} r={30} strokeWidth={2} className={on ? ON : "fill-card stroke-border"} />
          <text x={p[0]} y={p[1] + dy} fontSize={11} fontWeight={700} textAnchor="middle"
            className={on ? TXT_ON : "fill-foreground"}>{label}</text>
        </g>
      );
    };
    return (
      <>
        <polygon points={`${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}`}
          className="fill-primary/5 stroke-border" strokeWidth={1.5} />
        {vtx("confidentiality", A, "Confidential", 4)}
        {vtx("integrity", B, "Integrity", 4)}
        {vtx("availability", C, "Availability", 4)}
      </>
    );
  },
};

// ── Security: network zones / DMZ ────────────────────────────────────────────
const securityZones: DiagramDef = {
  slug: "network-security-zones",
  title: "Network security zones (DMZ)",
  caption: "Tap a zone. The DMZ isolates public-facing services from the internal LAN.",
  viewBox: "0 0 360 220",
  parts: [
    { id: "internet", label: "Internet", description: "The untrusted public network. All inbound traffic is treated as hostile by default." },
    { id: "fw-ext", label: "Edge firewall", description: "Filters internet ⇄ DMZ traffic, allowing only required ports to published services." },
    { id: "dmz", label: "DMZ", description: "Demilitarized zone — hosts public-facing servers (web, mail, DNS). If breached, the attacker still can't reach the internal LAN directly." },
    { id: "fw-int", label: "Internal firewall", description: "Strictly limits DMZ ⇄ internal traffic, so a compromised DMZ host can't pivot inward." },
    { id: "lan", label: "Internal LAN", description: "The trusted private network — workstations, file servers, databases. Never directly exposed to the internet." },
  ],
  render: (active) => {
    const block = (id: string, x: number, w: number, label: string, kind: "zone" | "fw") => {
      const on = active === id;
      const y = 70, h = 70;
      if (kind === "fw") {
        return (
          <g data-part={id} className="cursor-pointer">
            <rect x={x} y={y - 6} width={w} height={h + 12} rx={4} strokeWidth={1.5}
              className={on ? "fill-warning stroke-warning" : "fill-warning/30 stroke-warning"} />
            <text x={x + w / 2} y={y + h / 2} fontSize={9} fontWeight={700} textAnchor="middle"
              className={on ? "fill-warning-foreground" : "fill-foreground"}>FW</text>
          </g>
        );
      }
      return (
        <g data-part={id} className="cursor-pointer">
          <rect x={x} y={y} width={w} height={h} rx={6} strokeWidth={1.5} className={on ? ON : OFF} />
          <text x={x + w / 2} y={y + h / 2 + 4} fontSize={11} fontWeight={600} textAnchor="middle"
            className={on ? TXT_ON : TXT_OFF}>{label}</text>
        </g>
      );
    };
    const arrow = (x: number) => <line x1={x} y1={105} x2={x + 14} y2={105} className="stroke-muted-foreground" strokeWidth={1.5} markerEnd="url(#zarrow)" />;
    return (
      <>
        <defs>
          <marker id="zarrow" markerWidth={6} markerHeight={6} refX={4} refY={3} orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" className="fill-muted-foreground" />
          </marker>
        </defs>
        {block("internet", 8, 64, "Internet", "zone")}
        {arrow(74)}
        {block("fw-ext", 92, 26, "", "fw")}
        {arrow(120)}
        {block("dmz", 138, 76, "DMZ", "zone")}
        {arrow(216)}
        {block("fw-int", 234, 26, "", "fw")}
        {arrow(262)}
        {block("lan", 280, 72, "LAN", "zone")}
      </>
    );
  },
};

export const DIAGRAM_DEFS: DiagramDef[] = [
  osiModel,
  topologies,
  portsConnectors,
  motherboard,
  cloudServiceModels,
  cloudDeployment,
  ciaTriad,
  securityZones,
  ...HARDWARE_DIAGRAMS,
];

export const DIAGRAMS: Record<string, DiagramDef> = Object.fromEntries(
  DIAGRAM_DEFS.map((d) => [d.slug, d]),
);
