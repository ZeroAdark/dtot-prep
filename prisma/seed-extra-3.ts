// ─────────────────────────────────────────────────────────────────────────────
// Job Knowledge expansion (round 3) — doubles the Job Knowledge bank again.
// Split into per-topic files to keep each manageable; combined here.
// Authored 2026-06-20.
// ─────────────────────────────────────────────────────────────────────────────
import { JK3_IT } from "./jk3-it";
import { JK3_CLOUD } from "./jk3-cloud";
import { JK3_CYBER } from "./jk3-cyber";
import { JK3_SI } from "./jk3-si";
import { JK3_RADIO } from "./jk3-radio";
import { JK3_VOIP } from "./jk3-voip";
import { JK3_DATA } from "./jk3-data";

export const JOB_KNOWLEDGE_EXTRA_3: any[] = [
  ...JK3_IT,
  ...JK3_CLOUD,
  ...JK3_CYBER,
  ...JK3_SI,
  ...JK3_RADIO,
  ...JK3_VOIP,
  ...JK3_DATA,
];
