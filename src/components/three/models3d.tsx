"use client";

import { useMemo, type FC } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

// ─────────────────────────────────────────────────────────────────────────────
// Parametric 3D hardware models (React Three Fiber). Each model is composed from
// primitives + extruded silhouettes with PBR materials, lit in the viewer. Keyed
// by the same part ids used in the 2D diagrams. New models are added over time.
// ─────────────────────────────────────────────────────────────────────────────

type Mat = Record<string, unknown>;
const METAL: Mat = { color: "#cdd6e0", metalness: 0.6, roughness: 0.32 };
const METAL_DK: Mat = { color: "#9aa6b4", metalness: 0.6, roughness: 0.35 };
const GOLD: Mat = { color: "#e6b73f", metalness: 0.7, roughness: 0.28 };
const BLACK: Mat = { color: "#23282f", metalness: 0.25, roughness: 0.55 };
const WHITE: Mat = { color: "#eef1f5", metalness: 0.08, roughness: 0.6 };
const PCB: Mat = { color: "#1f8a55", metalness: 0.2, roughness: 0.55 };
const DARK: Mat = { color: "#39434f", metalness: 0.3, roughness: 0.5 };

const RECT = (w: number, h: number): [number, number][] => [
  [-w / 2, -h / 2],
  [w / 2, -h / 2],
  [w / 2, h / 2],
  [-w / 2, h / 2],
];

function B({ args, position, rotation, mat }: { args: [number, number, number]; position?: [number, number, number]; rotation?: [number, number, number]; mat: Mat }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}
function Cyl({ args, position, rotation, mat }: { args: [number, number, number, number]; position?: [number, number, number]; rotation?: [number, number, number]; mat: Mat }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}
function RB({ args, position, rotation, radius = 0.06, mat }: { args: [number, number, number]; position?: [number, number, number]; rotation?: [number, number, number]; radius?: number; mat: Mat }) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={4} position={position} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial {...mat} />
    </RoundedBox>
  );
}
function Extruded({ points, depth, mat, position, bevel = 0.04 }: { points: [number, number][]; depth: number; mat: Mat; position?: [number, number, number]; bevel?: number }) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, steps: 1 });
  }, [points, depth, bevel]);
  return (
    <mesh geometry={geo} position={position} castShadow receiveShadow>
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}

// ── Connectors ───────────────────────────────────────────────────────────────
function UsbA() {
  return (
    <group>
      <Extruded points={RECT(2.8, 1.0)} depth={2.4} mat={METAL} position={[0, 0, -1.2]} />
      <B args={[2.3, 0.66, 0.35]} position={[0, 0, 1.1]} mat={BLACK} />
      <B args={[1.9, 0.22, 0.5]} position={[0, -0.14, 1.0]} mat={WHITE} />
      {[-0.6, -0.2, 0.2, 0.6].map((x) => (
        <B key={x} args={[0.22, 0.06, 0.4]} position={[x, -0.02, 1.05]} mat={GOLD} />
      ))}
    </group>
  );
}
function UsbC() {
  return (
    <group>
      <RB args={[2.6, 0.9, 2.4]} radius={0.44} mat={METAL} />
      <B args={[2.0, 0.5, 0.3]} position={[0, 0, 1.1]} mat={BLACK} />
      <RB args={[1.6, 0.32, 0.6]} radius={0.15} position={[0, 0, 1.0]} mat={METAL_DK} />
    </group>
  );
}
function Rj45() {
  const clear: Mat = { color: "#d6e6ef", metalness: 0.1, roughness: 0.35, transparent: true, opacity: 0.82 };
  return (
    <group>
      <RB args={[2.2, 1.6, 2.4]} radius={0.12} mat={clear} />
      <B args={[0.8, 0.35, 1.3]} position={[0, 0.9, -0.2]} rotation={[0.32, 0, 0]} mat={{ ...clear, opacity: 0.9 }} />
      {Array.from({ length: 8 }, (_, i) => -0.84 + i * 0.24).map((x) => (
        <B key={x} args={[0.13, 0.1, 0.7]} position={[x, 0.78, 0.85]} mat={GOLD} />
      ))}
      <Cyl args={[0.4, 0.4, 1.3, 20]} position={[0, 0, -1.7]} rotation={[Math.PI / 2, 0, 0]} mat={DARK} />
    </group>
  );
}
function Hdmi() {
  return (
    <group>
      <Extruded points={[[-1.5, 0.5], [1.5, 0.5], [1.15, -0.5], [-1.15, -0.5]]} depth={2.0} mat={METAL} position={[0, 0, -1.0]} />
      <B args={[2.3, 0.55, 0.3]} position={[0, 0.03, 0.95]} mat={BLACK} />
      <B args={[2.0, 0.12, 0.4]} position={[0, 0.05, 0.95]} mat={GOLD} />
    </group>
  );
}
function DisplayPort() {
  return (
    <group>
      <Extruded points={[[-1.45, -0.5], [1.1, -0.5], [1.45, -0.15], [1.45, 0.5], [-1.45, 0.5]]} depth={2.0} mat={METAL} position={[0, 0, -1.0]} />
      <B args={[2.3, 0.55, 0.3]} position={[0, 0, 0.95]} mat={BLACK} />
      <B args={[2.0, 0.12, 0.4]} position={[0, 0, 0.95]} mat={GOLD} />
    </group>
  );
}
function Audio() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <Cyl args={[0.62, 0.62, 1.4, 24]} position={[0, 1.5, 0]} mat={METAL} />
      <Cyl args={[0.42, 0.42, 3.0, 24]} position={[0, -0.4, 0]} mat={GOLD} />
      <Cyl args={[0.45, 0.45, 0.12, 24]} position={[0, 0.2, 0]} mat={BLACK} />
      <Cyl args={[0.45, 0.45, 0.12, 24]} position={[0, -0.5, 0]} mat={BLACK} />
      <Cyl args={[0.42, 0.3, 0.5, 24]} position={[0, -2.05, 0]} mat={GOLD} />
    </group>
  );
}

// ── A few core parts (more added over time) ──────────────────────────────────
function Cpu() {
  return (
    <group>
      <RB args={[3, 0.28, 3]} radius={0.04} mat={{ color: "#2a2f38", metalness: 0.35, roughness: 0.5 }} />
      <RB args={[2.1, 0.34, 2.1]} radius={0.05} position={[0, 0.28, 0]} mat={METAL} />
      <B args={[0.34, 0.05, 0.34]} position={[-1.28, 0.16, -1.28]} mat={GOLD} />
    </group>
  );
}
function Dimm() {
  const contacts = Array.from({ length: 42 }, (_, i) => -3.0 + i * 0.146).filter((x) => Math.abs(x - 0.4) > 0.28);
  return (
    <group>
      <B args={[6.2, 1.3, 0.16]} mat={PCB} />
      {[-2.3, -1.15, 0, 1.15, 2.3].map((x) => (
        <group key={x}>
          <B args={[0.95, 0.55, 0.1]} position={[x, 0.22, 0.13]} mat={BLACK} />
          <B args={[0.95, 0.55, 0.1]} position={[x, 0.22, -0.13]} mat={BLACK} />
        </group>
      ))}
      {contacts.map((x) => (
        <B key={x} args={[0.1, 0.34, 0.04]} position={[x, -0.74, 0.1]} mat={GOLD} />
      ))}
    </group>
  );
}
function Hdd() {
  return (
    <group>
      <RB args={[4, 1, 5.7]} radius={0.08} mat={METAL} />
      <B args={[3.4, 0.04, 4.9]} position={[0, 0.52, 0]} mat={{ color: "#c4ccd6", metalness: 0.55, roughness: 0.38 }} />
      {[[-1.7, -2.6], [1.7, -2.6], [-1.7, 2.6], [1.7, 2.6]].map(([x, z], i) => (
        <Cyl key={i} args={[0.16, 0.16, 0.3, 12]} position={[x, 0.45, z]} rotation={[0, 0, 0]} mat={DARK} />
      ))}
      <B args={[1.4, 0.5, 0.3]} position={[-0.7, -0.1, 2.85]} mat={BLACK} />
      <B args={[1.6, 0.55, 0.3]} position={[1.2, -0.1, 2.85]} mat={BLACK} />
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
