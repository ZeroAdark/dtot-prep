// Part ids that have a 3D model. Plain strings (no three.js import) so the
// diagram components can cheaply decide whether to offer a "View in 3D" action
// without pulling the 3D bundle into the main chunk. Keep in sync with
// MODELS_3D in models3d.tsx.
export const MODEL_3D_IDS = new Set<string>([
  "usb-a",
  "usb-c",
  "rj45",
  "hdmi",
  "dp",
  "audio",
  "cpu",
  "dimm",
  "hdd35",
]);

export function has3DModel(id: string | null | undefined): boolean {
  return !!id && MODEL_3D_IDS.has(id);
}
