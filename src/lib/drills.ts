// Matching-drill content. Each drill is a set of left↔right pairs the learner
// re-matches (tap-to-pair). Referenced from study guides by slug.

export interface DrillPair {
  left: string;
  right: string;
}

export interface DrillDef {
  slug: string;
  title: string;
  instructions: string;
  pairs: DrillPair[];
}

const DRILL_DEFS: DrillDef[] = [
  {
    slug: "osi-layer-functions",
    title: "Match each OSI layer to its job",
    instructions: "Pair every layer with the function it performs.",
    pairs: [
      { left: "Application (7)", right: "User-facing protocols — HTTP, DNS, SMTP" },
      { left: "Transport (4)", right: "End-to-end delivery — TCP/UDP and ports" },
      { left: "Network (3)", right: "Logical addressing & routing — IP" },
      { left: "Data Link (2)", right: "MAC addressing & switching on the local link" },
      { left: "Physical (1)", right: "Bits on the wire — cables & signaling" },
    ],
  },
  {
    slug: "ports-protocols",
    title: "Match the port to its protocol",
    instructions: "Pair each well-known port number with the service that uses it.",
    pairs: [
      { left: "22", right: "SSH — secure remote shell" },
      { left: "53", right: "DNS — name resolution" },
      { left: "80", right: "HTTP — web (cleartext)" },
      { left: "443", right: "HTTPS — web over TLS" },
      { left: "3389", right: "RDP — remote desktop" },
    ],
  },
  {
    slug: "connectors-use",
    title: "Match the connector to its use",
    instructions: "Pair each connector with what it carries.",
    pairs: [
      { left: "RJ45", right: "Wired Ethernet over twisted-pair" },
      { left: "HDMI", right: "Digital video + audio to a display" },
      { left: "USB-C", right: "Reversible data + power delivery" },
      { left: "DisplayPort", right: "PC monitor video with a latch" },
      { left: "3.5mm", right: "Analog headphone/mic audio" },
    ],
  },
  {
    slug: "cloud-responsibility",
    title: "Match the model to who manages what",
    instructions: "Pair each model with how responsibility is split.",
    pairs: [
      { left: "On-premises", right: "You manage everything, end to end" },
      { left: "IaaS", right: "You manage the OS and everything above it" },
      { left: "PaaS", right: "You manage only your app and data" },
      { left: "SaaS", right: "Provider manages everything; you just use it" },
    ],
  },
];

export const DRILLS: Record<string, DrillDef> = Object.fromEntries(
  DRILL_DEFS.map((d) => [d.slug, d]),
);
