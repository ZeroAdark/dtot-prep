import type { ReactNode } from "react";

export interface DiagramPart {
  id: string;
  label: string;
  description: string;
}

export interface DiagramDef {
  slug: string;
  title: string;
  /** Hint shown in the info panel before a part is selected. */
  caption?: string;
  viewBox: string;
  parts: DiagramPart[];
  /**
   * Render the SVG inner content. Clickable regions must carry
   * `data-part="<id>"` and should visually emphasize when `activeId` matches.
   */
  render: (activeId: string | null) => ReactNode;
}
