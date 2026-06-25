"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds, Center } from "@react-three/drei";
import { X, Move3d, RotateCcw } from "lucide-react";
import { MODELS_3D } from "./models3d";

/**
 * Full-screen modal showing a rotatable 3D model of a hardware part. Drag to
 * orbit in any direction, scroll/pinch to zoom. Loaded lazily (the whole three
 * bundle only ships when a user opens it).
 */
export function Hardware3DViewer({
  partId,
  title,
  onClose,
}: {
  partId: string;
  title: string;
  onClose: () => void;
}) {
  const Model = MODELS_3D[partId];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`3D model of ${title}`}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <button type="button" aria-hidden="true" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" />
      <div className="relative flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Move3d className="h-4 w-4 text-primary" />
            {title} <span className="font-normal text-muted-foreground">· 3D</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close 3D viewer"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1">
          {Model ? (
            <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 3.5, 7], fov: 35 }}>
              <color attach="background" args={["#111722"]} />
              <ambientLight intensity={0.55} />
              <hemisphereLight args={["#ffffff", "#5b6675", 0.5]} />
              <directionalLight position={[6, 9, 6]} intensity={1.35} castShadow shadow-mapSize={[1024, 1024]} />
              <directionalLight position={[-6, 3, -4]} intensity={0.5} />
              <directionalLight position={[0, 3, -7]} intensity={0.6} />
              <Bounds fit clip observe margin={1.3}>
                <Center>
                  <Model />
                </Center>
              </Bounds>
              <OrbitControls makeDefault enablePan={false} enableDamping minDistance={2} maxDistance={30} />
            </Canvas>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              3D model coming soon for this part.
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 border-t py-2 text-xs text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5" /> Drag to rotate · scroll or pinch to zoom
        </div>
      </div>
    </div>
  );
}

export default Hardware3DViewer;
