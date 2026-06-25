"use client";

import { useMemo, type FC } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

// ─────────────────────────────────────────────────────────────────────────────
// Detailed parametric 3D hardware models (React Three Fiber). Hollow shells,
// accurate proportions/contact pitch, plastic over-molds, PBR materials. The
// viewer supplies a studio environment so the metals reflect realistically.
// Mesh counts kept modest so orbiting stays smooth.
// ─────────────────────────────────────────────────────────────────────────────

type Mat = Record<string, unknown>;
const METAL: Mat = { color: "#c6ced9", metalness: 0.95, roughness: 0.22 }; // nickel shell
const STEEL: Mat = { color: "#aab4c1", metalness: 0.85, roughness: 0.38 }; // brushed
const GOLD: Mat = { color: "#e9b73c", metalness: 0.95, roughness: 0.2 };
const BLACK: Mat = { color: "#1c2129", metalness: 0.35, roughness: 0.5 };
const WHITE: Mat = { color: "#edf0f4", metalness: 0.05, roughness: 0.5 };
const PCB: Mat = { color: "#1c7e4d", metalness: 0.15, roughness: 0.55 };
const DARK: Mat = { color: "#333b45", metalness: 0.35, roughness: 0.5 };
const GRAY: Mat = { color: "#5d6671", metalness: 0.2, roughness: 0.6 };
const BOOT: Mat = { color: "#274a86", metalness: 0.1, roughness: 0.65 };

function B({ args, position, rotation, mat }: { args: [number, number, number]; position?: [number, number, number]; rotation?: [number, number, number]; mat: Mat }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={args} />
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}
function Cyl({ args, position, rotation, mat }: { args: [number, number, number, number]; position?: [number, number, number]; rotation?: [number, number, number]; mat: Mat }) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={args} />
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}
function RB({ args, position, rotation, radius = 0.06, mat }: { args: [number, number, number]; position?: [number, number, number]; rotation?: [number, number, number]; radius?: number; mat: Mat }) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={3} position={position} rotation={rotation}>
      <meshStandardMaterial {...mat} />
    </RoundedBox>
  );
}
function Extruded({ points, depth, mat, position, bevel = 0.05 }: { points: [number, number][]; depth: number; mat: Mat; position?: [number, number, number]; bevel?: number }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, steps: 1 });
  }, [points, depth, bevel]);
  return (
    <mesh geometry={geo} position={position}>
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}

/** Hollow oval shell (extruded ellipse with an elliptical hole) — e.g. USB-C. */
function OvalShell({ rx, ry, irx, iry, depth, mat, position }: { rx: number; ry: number; irx: number; iry: number; depth: number; mat: Mat; position?: [number, number, number] }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
    const h = new THREE.Path();
    h.absellipse(0, 0, irx, iry, 0, Math.PI * 2, true, 0);
    s.holes.push(h);
    return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 32, steps: 1 });
  }, [rx, ry, irx, iry, depth]);
  return (
    <mesh geometry={geo} position={position}>
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}

/** Hollow rectangular shell, open at the +Z front (you can see inside). */
function Shell({ w, h, d, t = 0.09, mat }: { w: number; h: number; d: number; t?: number; mat: Mat }) {
  return (
    <group>
      <B args={[w, t, d]} position={[0, h / 2 - t / 2, 0]} mat={mat} />
      <B args={[w, t, d]} position={[0, -h / 2 + t / 2, 0]} mat={mat} />
      <B args={[t, h - 2 * t, d]} position={[-w / 2 + t / 2, 0, 0]} mat={mat} />
      <B args={[t, h - 2 * t, d]} position={[w / 2 - t / 2, 0, 0]} mat={mat} />
      <B args={[w - 2 * t, h - 2 * t, t]} position={[0, 0, -d / 2 + t / 2]} mat={mat} />
    </group>
  );
}

// ── Connectors ───────────────────────────────────────────────────────────────
function UsbA() {
  return (
    <group>
      <Shell w={2.4} h={1.0} d={2.2} mat={METAL} />
      <B args={[1.84, 0.22, 1.8]} position={[0, -0.22, 0.1]} mat={WHITE} />
      {[-0.5, -0.17, 0.17, 0.5].map((x) => (
        <B key={x} args={[0.18, 0.05, 1.3]} position={[x, -0.08, 0.3]} mat={GOLD} />
      ))}
      <B args={[0.5, 0.03, 0.55]} position={[0, 0.47, -0.4]} mat={STEEL} />
      <RB args={[2.9, 1.5, 1.4]} radius={0.2} position={[0, 0, -1.9]} mat={GRAY} />
    </group>
  );
}
function UsbC() {
  const pins = [-0.78, -0.5, -0.22, 0.06, 0.34, 0.62, 0.9].map((x) => x - 0.06);
  return (
    <group>
      {/* hollow oval metal shell (open front) */}
      <OvalShell rx={1.25} ry={0.46} irx={1.04} iry={0.31} depth={2.0} mat={METAL} position={[0, 0, -1.0]} />
      {/* central tongue (black blade), recessed inside the opening */}
      <RB args={[1.74, 0.16, 1.5]} radius={0.07} position={[0, 0, 0.05]} mat={{ color: "#20262e", metalness: 0.3, roughness: 0.5 }} />
      {/* gold contacts on both faces of the tongue */}
      {pins.map((x) => (
        <B key={`u${x}`} args={[0.16, 0.025, 1.05]} position={[x, 0.092, 0.3]} mat={GOLD} />
      ))}
      {pins.map((x) => (
        <B key={`d${x}`} args={[0.16, 0.025, 1.05]} position={[x, -0.092, 0.3]} mat={GOLD} />
      ))}
      {/* over-mold / boot */}
      <RB args={[2.8, 1.15, 1.3]} radius={0.42} position={[0, 0, -1.65]} mat={GRAY} />
    </group>
  );
}
function Rj45() {
  const clear: Mat = { color: "#dbe8f0", metalness: 0.04, roughness: 0.28, transparent: true, opacity: 0.74 };
  return (
    <group>
      <RB args={[2.0, 1.5, 2.6]} radius={0.13} mat={clear} />
      <B args={[0.82, 0.1, 1.7]} position={[0, 0.78, 0.05]} rotation={[0.26, 0, 0]} mat={clear} />
      <B args={[0.82, 0.34, 0.16]} position={[0, 0.95, -0.78]} mat={clear} />
      {Array.from({ length: 8 }, (_, i) => -0.8 + i * 0.228).map((x) => (
        <B key={x} args={[0.14, 0.5, 0.12]} position={[x, 0.6, 1.18]} mat={GOLD} />
      ))}
      <RB args={[1.7, 1.7, 1.5]} radius={0.4} position={[0, 0, -1.95]} mat={BOOT} />
      <Cyl args={[0.42, 0.42, 1.0, 18]} position={[0, 0, -3.0]} rotation={[Math.PI / 2, 0, 0]} mat={DARK} />
    </group>
  );
}
function Hdmi() {
  const outer: [number, number][] = [[-1.5, 0.55], [1.5, 0.55], [1.16, -0.55], [-1.16, -0.55]];
  const inner: [number, number][] = [[-1.26, 0.38], [1.26, 0.38], [0.98, -0.38], [-0.98, -0.38]];
  return (
    <group>
      <Extruded points={outer} depth={1.9} mat={METAL} position={[0, 0, -1.05]} />
      <Extruded points={inner} depth={0.75} mat={BLACK} position={[0, 0, 0.18]} />
      <B args={[2.1, 0.14, 0.7]} position={[0, 0.08, 0.5]} mat={GOLD} />
      <B args={[2.1, 0.14, 0.7]} position={[0, -0.14, 0.5]} mat={GOLD} />
      <RB args={[2.5, 1.0, 1.3]} radius={0.16} position={[0, 0, -1.85]} mat={GRAY} />
    </group>
  );
}
function DisplayPort() {
  const outer: [number, number][] = [[-1.45, -0.55], [1.1, -0.55], [1.45, -0.2], [1.45, 0.55], [-1.45, 0.55]];
  const inner: [number, number][] = [[-1.2, -0.38], [0.95, -0.38], [1.22, -0.14], [1.22, 0.38], [-1.2, 0.38]];
  return (
    <group>
      <Extruded points={outer} depth={1.9} mat={METAL} position={[0, 0, -1.05]} />
      <Extruded points={inner} depth={0.75} mat={BLACK} position={[0, 0, 0.18]} />
      <B args={[2.0, 0.14, 0.7]} position={[0, 0.07, 0.5]} mat={GOLD} />
      <B args={[2.0, 0.14, 0.7]} position={[0, -0.16, 0.5]} mat={GOLD} />
      <RB args={[2.5, 1.05, 1.3]} radius={0.16} position={[0, 0, -1.85]} mat={GRAY} />
    </group>
  );
}
function Audio() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh position={[0, 2.35, 0]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 16, 12]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <Cyl args={[0.4, 0.4, 1.0, 24]} position={[0, 1.7, 0]} mat={GOLD} />
      <Cyl args={[0.42, 0.42, 0.16, 24]} position={[0, 1.1, 0]} mat={BLACK} />
      <Cyl args={[0.4, 0.4, 0.9, 24]} position={[0, 0.55, 0]} mat={GOLD} />
      <Cyl args={[0.42, 0.42, 0.16, 24]} position={[0, 0.0, 0]} mat={BLACK} />
      <Cyl args={[0.4, 0.4, 0.7, 24]} position={[0, -0.5, 0]} mat={GOLD} />
      <Cyl args={[0.62, 0.62, 1.5, 24]} position={[0, -1.7, 0]} mat={STEEL} />
      <Cyl args={[0.5, 0.5, 1.2, 20]} position={[0, -3.1, 0]} mat={DARK} />
    </group>
  );
}

// ── Core parts ───────────────────────────────────────────────────────────────
function Cpu() {
  const caps = [[-1.25, -0.6], [-1.25, 0], [-1.25, 0.6], [1.25, -0.6], [1.25, 0], [1.25, 0.6], [-0.6, 1.25], [0.6, 1.25]];
  return (
    <group>
      <RB args={[3.0, 0.22, 3.0]} radius={0.03} mat={{ color: "#1c6b45", metalness: 0.2, roughness: 0.5 }} />
      <B args={[3.0, 0.02, 3.0]} position={[0, -0.12, 0]} mat={{ color: "#caa24a", metalness: 0.5, roughness: 0.45 }} />
      <RB args={[2.32, 0.12, 2.32]} radius={0.04} position={[0, 0.16, 0]} mat={STEEL} />
      <RB args={[2.0, 0.34, 2.0]} radius={0.07} position={[0, 0.32, 0]} mat={STEEL} />
      <B args={[0.3, 0.04, 0.3]} position={[-1.3, 0.18, -1.3]} mat={GOLD} />
      {caps.map(([x, z], i) => (
        <B key={i} args={[0.16, 0.12, 0.28]} position={[x, 0.17, z]} mat={{ color: "#b58a3e", metalness: 0.4, roughness: 0.5 }} />
      ))}
    </group>
  );
}
function Dimm() {
  const notch = 0.5;
  const contacts = Array.from({ length: 36 }, (_, i) => -2.95 + i * 0.168).filter((x) => Math.abs(x - notch) > 0.22);
  return (
    <group>
      <B args={[6.2, 1.3, 0.16]} mat={PCB} />
      <B args={[notch, 0.34, 0.2]} position={[notch + 0.0, -0.65, 0]} mat={{ color: "#0e2018", metalness: 0.1, roughness: 0.6 }} />
      {[-2.3, -1.45, -0.6, 0.6, 1.45, 2.3].map((x) => (
        <group key={x}>
          <B args={[0.72, 0.5, 0.08]} position={[x, 0.22, 0.13]} mat={BLACK} />
          <B args={[0.72, 0.5, 0.08]} position={[x, 0.22, -0.13]} mat={BLACK} />
        </group>
      ))}
      <B args={[0.4, 0.3, 0.07]} position={[0, 0.18, 0.13]} mat={{ color: "#23282f", metalness: 0.3, roughness: 0.5 }} />
      {contacts.map((x) => (
        <B key={x} args={[0.11, 0.34, 0.03]} position={[x, -0.74, 0.09]} mat={GOLD} />
      ))}
    </group>
  );
}
function Hdd() {
  return (
    <group>
      <RB args={[4, 1, 5.7]} radius={0.07} mat={STEEL} />
      <B args={[3.5, 0.05, 5.0]} position={[0, 0.52, 0]} mat={{ color: "#cdd5df", metalness: 0.75, roughness: 0.32 }} />
      <B args={[2.6, 0.02, 1.6]} position={[0, 0.55, -0.6]} mat={{ color: "#e9edf2", metalness: 0.05, roughness: 0.7 }} />
      {([[-1.78, -2.7], [1.78, -2.7], [-1.78, 2.7], [1.78, 2.7]] as [number, number][]).map(([x, z], i) => (
        <Cyl key={i} args={[0.16, 0.16, 0.35, 12]} position={[x, 0.42, z]} mat={DARK} />
      ))}
      <Cyl args={[0.1, 0.1, 0.4, 10]} position={[1.4, 0.45, 1.4]} mat={DARK} />
      <B args={[3.7, 0.16, 5.4]} position={[0, -0.5, 0]} mat={PCB} />
      <B args={[1.5, 0.45, 0.35]} position={[-0.8, -0.15, 2.88]} mat={BLACK} />
      <B args={[1.7, 0.5, 0.35]} position={[1.25, -0.15, 2.88]} mat={BLACK} />
    </group>
  );
}

export const MODELS_3D: Record<string, FC> = {
  "usb-a": UsbA,
  "usb-c": UsbC,
  rj45: Rj45,
  hdmi: Hdmi,
  dp: DisplayPort,
  audio: Audio,
  cpu: Cpu,
  dimm: Dimm,
  hdd35: Hdd,
};
