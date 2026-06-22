/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";
import {
  JOB_KNOWLEDGE_EXTRA,
  SITUATIONAL_EXTRA,
  ENGLISH_EXTRA,
} from "./seed-extra";
import { JOB_KNOWLEDGE_EXTRA_2 } from "./seed-extra-2";
import { JOB_KNOWLEDGE_EXTRA_3 } from "./seed-extra-3";
import { STUDY } from "./study-data";
import { EXTRA_QUESTIONS } from "./questions-extra";

const prisma = new PrismaClient();
const j = (v: unknown) => JSON.stringify(v);

type Opt = { id: string; text: string };
interface Q {
  section: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prompt: string;
  scenario?: string;
  options: Opt[];
  correctId: string;
  rationale: string;
  optionNotes?: Record<string, string>;
  reference?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// JOB KNOWLEDGE
// ─────────────────────────────────────────────────────────────────────────────
const JOB_KNOWLEDGE: Q[] = [
  {
    section: "JOB_KNOWLEDGE",
    topic: "IT & Telecommunications",
    difficulty: "EASY",
    prompt:
      "At which layer of the OSI model does a router primarily operate to forward packets between networks?",
    options: [
      { id: "A", text: "Layer 2 — Data Link" },
      { id: "B", text: "Layer 3 — Network" },
      { id: "C", text: "Layer 4 — Transport" },
      { id: "D", text: "Layer 7 — Application" },
    ],
    correctId: "B",
    rationale:
      "Routers make forwarding decisions using logical (IP) addresses, which live at Layer 3, the Network layer. Switches operate at Layer 2 using MAC addresses; the Transport layer handles end-to-end segments (TCP/UDP); the Application layer is where user-facing protocols live.",
    optionNotes: {
      A: "Layer 2 is where switches forward frames by MAC address.",
      C: "Layer 4 handles TCP/UDP segmentation, not inter-network forwarding.",
      D: "Layer 7 is application protocols (HTTP, SMTP), not routing.",
    },
    reference: "Networking › OSI model",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "IT & Telecommunications",
    difficulty: "MEDIUM",
    prompt:
      "How many usable host addresses are available in an IPv4 /24 subnet?",
    options: [
      { id: "A", text: "256" },
      { id: "B", text: "254" },
      { id: "C", text: "255" },
      { id: "D", text: "128" },
    ],
    correctId: "B",
    rationale:
      "A /24 has 8 host bits → 2^8 = 256 total addresses, but the network address and broadcast address are not assignable to hosts, leaving 256 − 2 = 254 usable.",
    reference: "Networking › Subnetting",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "IT & Telecommunications",
    difficulty: "EASY",
    prompt:
      "Which DNS record type is used to direct email to a domain's mail servers?",
    options: [
      { id: "A", text: "A record" },
      { id: "B", text: "CNAME record" },
      { id: "C", text: "MX record" },
      { id: "D", text: "TXT record" },
    ],
    correctId: "C",
    rationale:
      "MX (Mail Exchange) records specify the mail servers responsible for accepting email for a domain and their priority. A maps a name to an IPv4 address, CNAME is an alias, and TXT holds arbitrary text (often SPF/DKIM data).",
    reference: "Networking › DNS",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "IT & Telecommunications",
    difficulty: "MEDIUM",
    prompt:
      "A primary advantage of fiber-optic cabling over copper for long embassy campus runs is that fiber:",
    options: [
      { id: "A", text: "Is cheaper to terminate than copper" },
      { id: "B", text: "Is immune to electromagnetic interference and supports longer distances" },
      { id: "C", text: "Carries electrical power to remote devices" },
      { id: "D", text: "Requires no specialized tools to splice" },
    ],
    correctId: "B",
    rationale:
      "Fiber transmits light, so it is immune to EMI/RFI and crosstalk and can span far greater distances than copper without repeaters — valuable for campus backbones and secure runs. It is generally more expensive to terminate and cannot deliver power like PoE copper.",
    reference: "Networking › Transmission media",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Radio Systems",
    difficulty: "MEDIUM",
    prompt:
      "Long-distance, beyond-line-of-sight HF radio communication is primarily achieved through:",
    options: [
      { id: "A", text: "Ground-wave propagation along the Earth's surface" },
      { id: "B", text: "Skywave propagation refracted by the ionosphere" },
      { id: "C", text: "Satellite relay only" },
      { id: "D", text: "Direct line-of-sight between antennas" },
    ],
    correctId: "B",
    rationale:
      "HF (3–30 MHz) signals can be refracted back to Earth by the ionosphere (skywave), enabling beyond-line-of-sight and intercontinental links without infrastructure — a key reason HF remains a diplomatic/emergency fallback. VHF/UHF are essentially line-of-sight.",
    reference: "Radio Systems › Propagation",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Radio Systems",
    difficulty: "EASY",
    prompt: "What is the primary purpose of a radio repeater?",
    options: [
      { id: "A", text: "To encrypt voice traffic end-to-end" },
      { id: "B", text: "To receive a signal and retransmit it to extend coverage range" },
      { id: "C", text: "To convert analog audio to digital packets" },
      { id: "D", text: "To assign frequencies dynamically to users" },
    ],
    correctId: "B",
    rationale:
      "A repeater receives on one frequency and simultaneously retransmits (usually on another frequency, the 'offset') at higher power/better antenna height to extend the effective range between handheld or mobile radios.",
    reference: "Radio Systems › Network elements",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Radio Systems",
    difficulty: "HARD",
    prompt: "Which of the following is a digital modulation scheme?",
    options: [
      { id: "A", text: "AM (Amplitude Modulation)" },
      { id: "B", text: "FM (Frequency Modulation)" },
      { id: "C", text: "QAM (Quadrature Amplitude Modulation)" },
      { id: "D", text: "SSB (Single Sideband)" },
    ],
    correctId: "C",
    rationale:
      "QAM encodes digital bits by varying both amplitude and phase of the carrier, packing multiple bits per symbol — it underpins modern digital radio, cable, and Wi-Fi. AM, FM, and SSB are analog modulation techniques.",
    reference: "Radio Systems › Modulation",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Cloud Computing",
    difficulty: "MEDIUM",
    prompt:
      "In a Platform-as-a-Service (PaaS) model, the customer is primarily responsible for:",
    options: [
      { id: "A", text: "The physical servers and hypervisor" },
      { id: "B", text: "The operating system patching and networking fabric" },
      { id: "C", text: "Their application code and data" },
      { id: "D", text: "Nothing — the provider manages everything" },
    ],
    correctId: "C",
    rationale:
      "In PaaS the provider manages the hardware, OS, and runtime; the customer focuses on deploying and managing their own application code and data. (In SaaS the provider manages the application too; in IaaS the customer also manages the OS.)",
    reference: "Cloud Computing › Service models",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Cloud Computing",
    difficulty: "MEDIUM",
    prompt:
      "Under the cloud 'shared responsibility model,' securing the configuration of customer data and access controls is the responsibility of:",
    options: [
      { id: "A", text: "Always the cloud provider" },
      { id: "B", text: "The customer" },
      { id: "C", text: "The internet service provider" },
      { id: "D", text: "An independent auditor" },
    ],
    correctId: "B",
    rationale:
      "Providers secure the cloud (physical, host, network infrastructure); customers are responsible for security in the cloud — their data classification, identity and access management, and configuration. Misconfigured access by the customer is the customer's responsibility.",
    reference: "Cloud Computing › Shared responsibility",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Cloud Computing",
    difficulty: "HARD",
    prompt:
      "Which term describes a system's ability to automatically add or remove resources to match demand in near real time?",
    options: [
      { id: "A", text: "Scalability" },
      { id: "B", text: "Elasticity" },
      { id: "C", text: "Redundancy" },
      { id: "D", text: "Portability" },
    ],
    correctId: "B",
    rationale:
      "Elasticity is the automatic, dynamic provisioning and de-provisioning of resources to match real-time demand. Scalability is the broader capacity to grow (often planned/manual); redundancy is duplicate components for fault tolerance; portability is moving workloads between environments.",
    optionNotes: {
      A: "Scalability is the capacity to grow, but not necessarily automatic/real-time.",
    },
    reference: "Cloud Computing › Characteristics",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Systems Integration",
    difficulty: "MEDIUM",
    prompt:
      "A defining characteristic of a RESTful API is that it is:",
    options: [
      { id: "A", text: "Stateful, keeping client session context on the server between calls" },
      { id: "B", text: "Stateless, with each request carrying all information needed to process it" },
      { id: "C", text: "Limited to XML payloads only" },
      { id: "D", text: "Restricted to a single HTTP method" },
    ],
    correctId: "B",
    rationale:
      "REST is stateless: the server keeps no client session between requests, so each request must include everything needed to process it. REST uses standard HTTP methods (GET/POST/PUT/DELETE) and commonly JSON (not XML-only).",
    reference: "Systems Integration › APIs",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Systems Integration",
    difficulty: "HARD",
    prompt: "Which HTTP method is NOT idempotent?",
    options: [
      { id: "A", text: "GET" },
      { id: "B", text: "PUT" },
      { id: "C", text: "DELETE" },
      { id: "D", text: "POST" },
    ],
    correctId: "D",
    rationale:
      "An idempotent method produces the same result no matter how many times it is repeated. GET, PUT, and DELETE are idempotent; POST is not — repeating it typically creates additional resources each time.",
    reference: "Systems Integration › HTTP semantics",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Systems Integration",
    difficulty: "MEDIUM",
    prompt:
      "Middleware (e.g., an enterprise service bus) is best described as software that:",
    options: [
      { id: "A", text: "Replaces the need for a database" },
      { id: "B", text: "Connects and mediates communication between otherwise incompatible applications" },
      { id: "C", text: "Encrypts disk volumes at rest" },
      { id: "D", text: "Provides end-user word processing" },
    ],
    correctId: "B",
    rationale:
      "Middleware sits between applications, translating protocols/data formats and routing messages so heterogeneous systems can interoperate — central to systems integration. It does not replace databases or provide end-user productivity apps.",
    reference: "Systems Integration › Middleware",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Cybersecurity",
    difficulty: "EASY",
    prompt:
      "In the CIA triad, which principle ensures that data has not been altered by unauthorized parties?",
    options: [
      { id: "A", text: "Confidentiality" },
      { id: "B", text: "Integrity" },
      { id: "C", text: "Availability" },
      { id: "D", text: "Authentication" },
    ],
    correctId: "B",
    rationale:
      "Integrity ensures data is accurate and unaltered except by authorized actions (often verified with hashes/checksums). Confidentiality restricts who can read data; availability ensures access when needed; authentication is identity verification (not part of the triad itself).",
    reference: "Cybersecurity › CIA triad",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Cybersecurity",
    difficulty: "MEDIUM",
    prompt: "The principle of least privilege states that:",
    options: [
      { id: "A", text: "All users should share one administrative account for simplicity" },
      { id: "B", text: "Users and processes should have only the minimum access required to do their job" },
      { id: "C", text: "Privileges should be granted permanently to avoid re-requests" },
      { id: "D", text: "Security should rely on a single strong perimeter firewall" },
    ],
    correctId: "B",
    rationale:
      "Least privilege limits each user, account, or process to the minimum permissions needed for its function, shrinking the attack surface and the blast radius of a compromise. It is a foundational access-control principle.",
    reference: "Cybersecurity › Access control",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Cybersecurity",
    difficulty: "MEDIUM",
    prompt:
      "Public-key (asymmetric) cryptography is characterized by:",
    options: [
      { id: "A", text: "A single shared secret key used by both parties" },
      { id: "B", text: "A mathematically related public/private key pair" },
      { id: "C", text: "No keys — it relies on obscurity" },
      { id: "D", text: "Keys that must be exchanged over the same channel as the message" },
    ],
    correctId: "B",
    rationale:
      "Asymmetric cryptography uses a key pair: data encrypted with the public key can only be decrypted with the matching private key (and signatures work in reverse). This solves the key-distribution problem of symmetric cryptography, which uses one shared secret.",
    reference: "Cybersecurity › Cryptography",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Cybersecurity",
    difficulty: "HARD",
    prompt: "A 'zero-day' vulnerability is best defined as a flaw that:",
    options: [
      { id: "A", text: "Has been patched for zero days" },
      { id: "B", text: "Is unknown to the vendor and has no available patch when exploited" },
      { id: "C", text: "Only affects systems that are zero days old" },
      { id: "D", text: "Can be exploited only on the day of release" },
    ],
    correctId: "B",
    rationale:
      "A zero-day is a vulnerability unknown to the party responsible for patching it; attackers can exploit it before a fix exists, giving defenders 'zero days' of advance notice. These are especially dangerous because no signature or patch is yet available.",
    reference: "Cybersecurity › Threats",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "PBX / VoIP Convergence",
    difficulty: "EASY",
    prompt:
      "Which protocol is most commonly used to set up, manage, and tear down VoIP calls?",
    options: [
      { id: "A", text: "SIP (Session Initiation Protocol)" },
      { id: "B", text: "SMTP" },
      { id: "C", text: "SNMP" },
      { id: "D", text: "FTP" },
    ],
    correctId: "A",
    rationale:
      "SIP is the signaling protocol that establishes, modifies, and terminates VoIP sessions. SMTP is for email, SNMP for network management, and FTP for file transfer.",
    reference: "PBX/VoIP › Signaling",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "PBX / VoIP Convergence",
    difficulty: "MEDIUM",
    prompt:
      "Once a VoIP call is set up, which protocol typically carries the actual real-time voice media stream?",
    options: [
      { id: "A", text: "SIP" },
      { id: "B", text: "RTP (Real-time Transport Protocol)" },
      { id: "C", text: "HTTP" },
      { id: "D", text: "DHCP" },
    ],
    correctId: "B",
    rationale:
      "SIP handles signaling/setup; RTP (usually over UDP) carries the actual audio/video media stream with timestamps and sequence numbers for real-time delivery. RTCP accompanies it for quality control.",
    reference: "PBX/VoIP › Media transport",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "PBX / VoIP Convergence",
    difficulty: "MEDIUM",
    prompt:
      "Which network impairment most directly degrades VoIP call quality by causing uneven packet arrival?",
    options: [
      { id: "A", text: "Jitter" },
      { id: "B", text: "Disk latency" },
      { id: "C", text: "Screen resolution" },
      { id: "D", text: "DNS caching" },
    ],
    correctId: "A",
    rationale:
      "Jitter — variation in packet arrival timing — breaks up real-time audio; jitter buffers and QoS prioritization mitigate it. Latency and packet loss also matter, but jitter specifically describes uneven arrival. The other options are unrelated to voice transport.",
    reference: "PBX/VoIP › Quality of Service",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Data Analytics",
    difficulty: "EASY",
    prompt: "In data processing, 'ETL' stands for:",
    options: [
      { id: "A", text: "Encrypt, Transmit, Log" },
      { id: "B", text: "Extract, Transform, Load" },
      { id: "C", text: "Evaluate, Test, Launch" },
      { id: "D", text: "Export, Translate, Link" },
    ],
    correctId: "B",
    rationale:
      "ETL = Extract (pull data from sources), Transform (clean/standardize/aggregate), Load (write into a target store such as a data warehouse). It is the classic data-integration pipeline pattern.",
    reference: "Data Analytics › Pipelines",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Data Analytics",
    difficulty: "MEDIUM",
    prompt:
      "Which visualization is most appropriate for showing a single metric's trend over time?",
    options: [
      { id: "A", text: "Pie chart" },
      { id: "B", text: "Line chart" },
      { id: "C", text: "Treemap" },
      { id: "D", text: "Scatter matrix" },
    ],
    correctId: "B",
    rationale:
      "A line chart is the standard choice for a continuous metric over time, making trends and inflection points easy to read. Pie charts show part-to-whole at one moment; treemaps show hierarchy/proportion; scatter matrices show relationships between many variables.",
    reference: "Data Analytics › Visualization",
  },
  {
    section: "JOB_KNOWLEDGE",
    topic: "Data Analytics",
    difficulty: "MEDIUM",
    prompt:
      "Which is the best example of unstructured data?",
    options: [
      { id: "A", text: "A relational database table of employee records" },
      { id: "B", text: "A spreadsheet of monthly budget figures" },
      { id: "C", text: "The free-text body of diplomatic cables and emails" },
      { id: "D", text: "A CSV export with fixed columns" },
    ],
    correctId: "C",
    rationale:
      "Unstructured data lacks a predefined schema — free-text documents, emails, images, and audio. Tables, spreadsheets, and CSVs are structured (rows/columns with defined fields).",
    reference: "Data Analytics › Data types",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SITUATIONAL JUDGMENT
// ─────────────────────────────────────────────────────────────────────────────
const SITUATIONAL: Q[] = [
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Crisis Response",
    difficulty: "MEDIUM",
    scenario:
      "A sudden power outage hits the embassy during peak consular hours. The UPS will keep core systems running for roughly 20 minutes before the generator should engage, but the generator has not started automatically.",
    prompt: "What is the BEST first action?",
    options: [
      { id: "A", text: "Wait to see whether the generator starts on its own before doing anything" },
      { id: "B", text: "Immediately notify facilities/the duty officer about the failed generator and begin a graceful shutdown plan for non-critical systems to preserve UPS runtime for critical ones" },
      { id: "C", text: "Send all staff home for the day" },
      { id: "D", text: "Start unplugging equipment at random to save power" },
    ],
    correctId: "B",
    rationale:
      "Crisis response prioritizes protecting critical services and communicating. Alerting the responsible party (facilities/duty officer) about the failed generator while triaging load to preserve UPS time for critical systems is decisive and prevents data loss. Waiting wastes finite UPS runtime; sending everyone home or pulling plugs randomly is premature and risks damage.",
    reference: "Situational Judgment › Crisis prioritization",
  },
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Security & Compliance",
    difficulty: "MEDIUM",
    scenario:
      "A local-hire colleague forwards you an email they received that claims to be from the IT helpdesk, asking them to 'verify' their network password via a link. They have not clicked it yet.",
    prompt: "What should you do FIRST?",
    options: [
      { id: "A", text: "Tell them to click the link to see whether it is legitimate" },
      { id: "B", text: "Praise them for reporting it, instruct them not to click, and report/forward the suspected phishing email to the security team per policy" },
      { id: "C", text: "Delete the email quietly and say nothing" },
      { id: "D", text: "Reset only that colleague's password and consider the matter closed" },
    ],
    correctId: "B",
    rationale:
      "Reinforce good reporting behavior, contain the immediate risk (don't click), and escalate to security so they can block the sender, warn others, and investigate scope. Clicking to 'test' is dangerous; deleting silently loses the chance to protect others; resetting one password ignores the broader campaign.",
    reference: "Situational Judgment › Phishing response",
  },
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Security & Compliance",
    difficulty: "HARD",
    scenario:
      "A senior official insists on connecting their personal laptop to the restricted network 'just for an hour' to finish an urgent task, and is frustrated by the delay.",
    prompt: "What is the most appropriate response?",
    options: [
      { id: "A", text: "Allow it once because of their seniority and the urgency" },
      { id: "B", text: "Politely explain the policy and risk, decline to connect the unauthorized device, and offer an approved alternative (e.g., a managed device or sanctioned file path)" },
      { id: "C", text: "Refuse curtly and walk away" },
      { id: "D", text: "Connect it but disable logging so there is no record" },
    ],
    correctId: "B",
    rationale:
      "Security policy applies regardless of rank. The professional path upholds the rule, explains the why respectfully, and offers a workable alternative so the official can still accomplish the task. Granting an exception or hiding it creates real risk and an accountability breach; a curt refusal damages the relationship without helping.",
    optionNotes: {
      A: "Seniority does not waive security controls; exceptions require proper authorization, not pressure.",
      D: "Disabling logging to conceal an action is a serious integrity violation.",
    },
    reference: "Situational Judgment › Policy under pressure",
  },
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Crisis Response",
    difficulty: "HARD",
    scenario:
      "During a regional security incident, the primary VoIP phone system fails and staff cannot reach the regional security office.",
    prompt: "What is the best immediate action?",
    options: [
      { id: "A", text: "Keep retrying the VoIP system until it works" },
      { id: "B", text: "Switch to the established backup communication method (e.g., HF/UHF radio net or satellite phone) per the emergency communications plan and notify key personnel" },
      { id: "C", text: "Wait for the vendor to open a support ticket" },
      { id: "D", text: "Use personal cell phones for all sensitive coordination" },
    ],
    correctId: "B",
    rationale:
      "Resilient operations depend on falling back to pre-planned alternate communications (radio nets, satellite) when the primary fails — exactly why embassies maintain layered comms. Repeatedly retrying a down system or waiting on a vendor wastes critical time; personal cell phones are insecure for sensitive coordination.",
    reference: "Situational Judgment › Continuity of communications",
  },
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Diplomatic Problem-Solving",
    difficulty: "MEDIUM",
    scenario:
      "A vendor bidding on an upcoming network upgrade offers you tickets to a sporting event 'as a token of appreciation' during the evaluation period.",
    prompt: "What should you do?",
    options: [
      { id: "A", text: "Accept; it would be rude to refuse a cultural gesture" },
      { id: "B", text: "Politely decline, document the offer, and report it to your ethics/contracting officer" },
      { id: "C", text: "Accept but promise nothing in return" },
      { id: "D", text: "Ask for cash instead so there is no paper trail" },
    ],
    correctId: "B",
    rationale:
      "Accepting anything of value from a bidder during an active procurement creates a conflict of interest (or its appearance). The correct response is to decline, document, and report per ethics rules. Even accepting 'with no promise' compromises the fairness of the process; option D is plainly corrupt.",
    reference: "Situational Judgment › Ethics & procurement integrity",
  },
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Security & Compliance",
    difficulty: "HARD",
    scenario:
      "You discover that a document marked classified has been mistakenly saved to an unclassified shared drive.",
    prompt: "What is the correct course of action?",
    options: [
      { id: "A", text: "Quietly move the file to the correct system and move on" },
      { id: "B", text: "Stop, do not forward or copy it, and immediately report the spill to your information security officer so it can be contained and remediated per procedure" },
      { id: "C", text: "Email everyone who has access telling them to delete it" },
      { id: "D", text: "Delete the file yourself and assume the problem is solved" },
    ],
    correctId: "B",
    rationale:
      "A classified spill requires immediate reporting and controlled containment by security staff — not ad hoc handling. Moving, mass-emailing, or self-deleting can spread the data, destroy evidence, and violate procedure. Report and let trained personnel remediate.",
    reference: "Situational Judgment › Data spill handling",
  },
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Resource Prioritization",
    difficulty: "MEDIUM",
    scenario:
      "Two sections need help at the same time: the Consular section's visa system is fully down (no appointments can proceed), and the Public Affairs section wants help formatting a newsletter due next week.",
    prompt: "How should you prioritize?",
    options: [
      { id: "A", text: "Help Public Affairs first because the request came in earlier" },
      { id: "B", text: "Address the Consular outage first (high mission impact, time-critical), set expectations with Public Affairs, and schedule their lower-urgency task" },
      { id: "C", text: "Try to do both at once and risk doing neither well" },
      { id: "D", text: "Escalate both and take no action yourself" },
    ],
    correctId: "B",
    rationale:
      "Prioritize by impact and urgency: a full Consular outage blocks core mission services and affects the public, while a newsletter due next week can wait. Communicate clearly with Public Affairs and schedule their task. Order of request, multitasking blindly, or pure escalation without action are weaker.",
    reference: "Situational Judgment › Triage by mission impact",
  },
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Interpersonal Judgment",
    difficulty: "MEDIUM",
    scenario:
      "A capable local-staff colleague is visibly struggling with a newly deployed ticketing system and is becoming discouraged, occasionally entering tickets incorrectly.",
    prompt: "What is the best approach?",
    options: [
      { id: "A", text: "Report their mistakes to their supervisor" },
      { id: "B", text: "Take over their tickets so they don't have to use the system" },
      { id: "C", text: "Offer patient, hands-on coaching and a quick-reference guide, and check back to confirm they're comfortable" },
      { id: "D", text: "Tell them to figure it out from the official manual" },
    ],
    correctId: "C",
    rationale:
      "Strong interpersonal judgment builds capability and confidence: coach hands-on, give a job aid, and follow up. Reporting them or doing their work for them undermines growth and morale; pointing to a dense manual abdicates support.",
    reference: "Situational Judgment › Coaching & enablement",
  },
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Diplomatic Problem-Solving",
    difficulty: "MEDIUM",
    scenario:
      "A critical security patch is released for the embassy's firewall, but applying it requires a brief outage. A high-profile diplomatic visit is happening tomorrow that depends on connectivity.",
    prompt: "What is the most prudent action?",
    options: [
      { id: "A", text: "Apply the patch immediately during business hours without notice" },
      { id: "B", text: "Assess the risk/severity, coordinate a maintenance window (e.g., after the visit or overnight with stakeholder agreement), and document the decision" },
      { id: "C", text: "Ignore the patch indefinitely to avoid any disruption" },
      { id: "D", text: "Disable the firewall during the visit to avoid outages" },
    ],
    correctId: "B",
    rationale:
      "Balance security and availability through risk assessment and change management: weigh the vulnerability's severity, schedule a coordinated window, and inform stakeholders. Patching unannounced risks the visit; ignoring it leaves a known hole; disabling the firewall trades a small outage for a major exposure.",
    reference: "Situational Judgment › Change management & risk balance",
  },
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Crisis Response",
    difficulty: "MEDIUM",
    scenario:
      "It is after hours and you are off duty. You receive an automated alert that the embassy's backup system has failed its nightly job for the third night in a row.",
    prompt: "What should you do?",
    options: [
      { id: "A", text: "Ignore it until your next shift since you are off duty" },
      { id: "B", text: "Follow the on-call/escalation procedure: acknowledge the alert, assess severity, and act or escalate to the on-call owner as defined" },
      { id: "C", text: "Drive in immediately and rebuild the backup server yourself without telling anyone" },
      { id: "D", text: "Reply to the alert email asking it to stop notifying you" },
    ],
    correctId: "B",
    rationale:
      "A repeated backup failure is a real data-protection risk. The professional response follows the documented on-call/escalation process — acknowledge, triage, and route to the right owner. Ignoring it risks unrecoverable data loss; lone heroics bypass coordination; silencing the alert hides the problem.",
    reference: "Situational Judgment › On-call & escalation",
  },
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Interpersonal Judgment",
    difficulty: "HARD",
    scenario:
      "A new teammate, eager to help, pushed a configuration change directly to a production switch outside the change-management process, causing a brief disruption that is now resolved.",
    prompt: "What is the best way to handle this?",
    options: [
      { id: "A", text: "Publicly call out the mistake in the team channel" },
      { id: "B", text: "Privately and constructively discuss what happened, reaffirm the change process and why it exists, and offer to pair on the next change" },
      { id: "C", text: "Say nothing to avoid conflict" },
      { id: "D", text: "Escalate to management for disciplinary action immediately" },
    ],
    correctId: "B",
    rationale:
      "A first, well-intentioned process mistake calls for private, constructive feedback that reinforces the process and builds trust — protecting both the person and future stability. Public shaming harms morale, silence invites repeat incidents, and jumping straight to discipline is disproportionate.",
    reference: "Situational Judgment › Constructive feedback",
  },
  {
    section: "SITUATIONAL_JUDGMENT",
    topic: "Diplomatic Problem-Solving",
    difficulty: "MEDIUM",
    scenario:
      "You are asked to deliver a technical recommendation to non-technical senior leadership who must decide on a costly infrastructure investment.",
    prompt: "What approach best serves the decision?",
    options: [
      { id: "A", text: "Present exhaustive technical specifications so they have all the detail" },
      { id: "B", text: "Lead with the business impact, options, risks, and a clear recommendation in plain language, with technical detail available on request" },
      { id: "C", text: "Tell them simply to trust your judgment and approve it" },
      { id: "D", text: "Avoid making a recommendation so you can't be blamed" },
    ],
    correctId: "B",
    rationale:
      "Effective communication adapts to the audience: leaders need impact, options, risks, and a recommendation in accessible terms to decide well. Drowning them in specs obscures the decision; demanding blind trust or withholding a recommendation fails your advisory role.",
    reference: "Situational Judgment › Communicating to decision-makers",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH EXPRESSION
// ─────────────────────────────────────────────────────────────────────────────
const ENGLISH: Q[] = [
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Grammar",
    difficulty: "EASY",
    prompt:
      "Choose the sentence with correct subject–verb agreement.",
    options: [
      { id: "A", text: "The list of approved vendors are posted on the intranet." },
      { id: "B", text: "The list of approved vendors is posted on the intranet." },
      { id: "C", text: "The list of approved vendors were posted on the intranet." },
      { id: "D", text: "The list of approved vendors have been posted on the intranet." },
    ],
    correctId: "B",
    rationale:
      "The subject is 'list' (singular); 'of approved vendors' is a prepositional phrase that does not change the subject's number. The verb must be singular: 'is posted.'",
    reference: "English › Subject–verb agreement",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Usage & Word Choice",
    difficulty: "MEDIUM",
    prompt:
      "Select the sentence that uses 'affect' and 'effect' correctly.",
    options: [
      { id: "A", text: "The new policy will effect staff morale, and the affect was immediate." },
      { id: "B", text: "The new policy will affect staff morale, and the effect was immediate." },
      { id: "C", text: "The new policy will affect staff morale, and the affect was immediate." },
      { id: "D", text: "The new policy will effect staff morale, and the effect was immediate." },
    ],
    correctId: "B",
    rationale:
      "'Affect' is usually the verb (to influence); 'effect' is usually the noun (the result). The policy will affect (verb) morale, and the effect (noun) was immediate.",
    reference: "English › Commonly confused words",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Punctuation",
    difficulty: "MEDIUM",
    prompt: "Which sentence correctly fixes the comma splice?",
    options: [
      { id: "A", text: "The server crashed, we restored it from backup." },
      { id: "B", text: "The server crashed we restored it from backup." },
      { id: "C", text: "The server crashed; we restored it from backup." },
      { id: "D", text: "The server crashed, and; we restored it from backup." },
    ],
    correctId: "C",
    rationale:
      "Two independent clauses joined by only a comma form a comma splice (A). Correct it with a semicolon (C), a period, or a comma plus a coordinating conjunction. B is a run-on; D misuses punctuation.",
    reference: "English › Comma splices & run-ons",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Syntax & Sentence Structure",
    difficulty: "HARD",
    prompt:
      "Which revision corrects the dangling modifier? Original: 'After installing the update, the network ran flawlessly.'",
    options: [
      { id: "A", text: "After installing the update, the network ran flawlessly." },
      { id: "B", text: "After installing the update, flawless performance was observed on the network." },
      { id: "C", text: "After we installed the update, the network ran flawlessly." },
      { id: "D", text: "Installing the update, the network ran flawlessly." },
    ],
    correctId: "C",
    rationale:
      "The introductory phrase implies a person performed the installing, but 'the network' did not install itself. Revising to 'After we installed the update…' gives the action a logical subject. The other options leave the modifier dangling or worsen it.",
    reference: "English › Modifiers",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Syntax & Sentence Structure",
    difficulty: "MEDIUM",
    prompt: "Choose the sentence with correct parallel structure.",
    options: [
      { id: "A", text: "The technician is skilled at configuring routers, troubleshooting outages, and to document procedures." },
      { id: "B", text: "The technician is skilled at configuring routers, troubleshooting outages, and documenting procedures." },
      { id: "C", text: "The technician is skilled at configuring routers, to troubleshoot outages, and documentation." },
      { id: "D", text: "The technician is skilled at configure routers, troubleshooting outages, and documenting procedures." },
    ],
    correctId: "B",
    rationale:
      "Items in a series should share the same grammatical form. B uses three parallel gerunds: configuring, troubleshooting, documenting. The others mix infinitives, nouns, or base verbs, breaking parallelism.",
    reference: "English › Parallelism",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Usage & Word Choice",
    difficulty: "EASY",
    prompt: "Select the sentence that uses 'its' / 'it's' correctly.",
    options: [
      { id: "A", text: "The system lost it's connection because its overloaded." },
      { id: "B", text: "The system lost its connection because it's overloaded." },
      { id: "C", text: "The system lost its' connection because its overloaded." },
      { id: "D", text: "The system lost it's connection because it's overloaded." },
    ],
    correctId: "B",
    rationale:
      "'Its' is the possessive (its connection); 'it's' is the contraction of 'it is' (it's overloaded). 'Its'' is never correct.",
    reference: "English › Possessives & contractions",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Professional Communication",
    difficulty: "MEDIUM",
    prompt:
      "Which version is the most concise and professional for a status email?",
    options: [
      { id: "A", text: "Due to the fact that the migration is not yet complete at this point in time, we are not in a position to provide a firm date as of now." },
      { id: "B", text: "Because the migration is still in progress, we cannot yet provide a firm date." },
      { id: "C", text: "The migration thing isn't done so no date yet, sorry!" },
      { id: "D", text: "It is the case that the migration, which remains incomplete, prevents us from being able to commit to a date." },
    ],
    correctId: "B",
    rationale:
      "B is concise, clear, and professional. A and D are padded with wordy filler ('due to the fact that,' 'at this point in time'); C is too casual for official correspondence.",
    reference: "English › Concision & tone",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Grammar",
    difficulty: "HARD",
    prompt: "Choose the sentence that uses 'who' / 'whom' correctly.",
    options: [
      { id: "A", text: "Whom should I contact about the outage?" },
      { id: "B", text: "Who should I contact about the outage?" },
      { id: "C", text: "The engineer who I spoke to resolved it." },
      { id: "D", text: "The engineer whom resolved it called back." },
    ],
    correctId: "A",
    rationale:
      "Use 'whom' as the object of a verb or preposition. In 'Whom should I contact,' 'whom' is the object of 'contact' (I should contact whom). B uses subject case incorrectly; C should be 'whom I spoke to' (object); D should be 'who resolved it' (subject).",
    reference: "English › Pronoun case",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Punctuation",
    difficulty: "MEDIUM",
    prompt: "Which sentence uses the apostrophe correctly for the plural possessive?",
    options: [
      { id: "A", text: "The technicians' tools were stored in the secure cabinet." },
      { id: "B", text: "The technician's tools were stored in the secure cabinet, referring to several technicians." },
      { id: "C", text: "The technicians's tools were stored in the secure cabinet." },
      { id: "D", text: "The technicians tools' were stored in the secure cabinet." },
    ],
    correctId: "A",
    rationale:
      "For a plural noun already ending in -s, form the possessive by adding only an apostrophe: 'technicians'.' B is singular possessive; C double-marks; D misplaces the apostrophe.",
    reference: "English › Possessives",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Usage & Word Choice",
    difficulty: "MEDIUM",
    prompt: "Choose the sentence with correct use of 'fewer' / 'less.'",
    options: [
      { id: "A", text: "There were less outages this quarter than last quarter." },
      { id: "B", text: "There were fewer outages this quarter than last quarter." },
      { id: "C", text: "We had fewer downtime this month." },
      { id: "D", text: "We experienced less incidents overall." },
    ],
    correctId: "B",
    rationale:
      "Use 'fewer' for countable nouns (outages, incidents) and 'less' for uncountable quantities (downtime, time). 'Fewer outages' is correct; A and D misuse 'less' with countables, and C misuses 'fewer' with an uncountable.",
    reference: "English › Fewer vs. less",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Grammar",
    difficulty: "MEDIUM",
    prompt: "Select the sentence with consistent verb tense.",
    options: [
      { id: "A", text: "The analyst reviews the logs and identified the root cause." },
      { id: "B", text: "The analyst reviewed the logs and identified the root cause." },
      { id: "C", text: "The analyst reviews the logs and had identified the root cause." },
      { id: "D", text: "The analyst will review the logs and identified the root cause." },
    ],
    correctId: "B",
    rationale:
      "Keep tense consistent within a sentence unless the timeline requires a shift. B keeps both verbs in the simple past (reviewed, identified). The others mix present, past, and future without justification.",
    reference: "English › Tense consistency",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Professional Communication",
    difficulty: "MEDIUM",
    prompt:
      "Which sentence is written in clear, direct (active) voice?",
    options: [
      { id: "A", text: "The report was completed by the team and was submitted to the director." },
      { id: "B", text: "The team completed the report and submitted it to the director." },
      { id: "C", text: "It was decided that the report would be completed and submitted." },
      { id: "D", text: "Completion and submission of the report to the director was achieved." },
    ],
    correctId: "B",
    rationale:
      "Active voice ('The team completed… and submitted…') is clearer and more direct, naming who did what. A is passive, C hides the actor, and D is a nominalization-heavy construction that obscures meaning.",
    reference: "English › Active voice",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Usage & Word Choice",
    difficulty: "HARD",
    prompt: "Choose the sentence using 'principal' / 'principle' correctly.",
    options: [
      { id: "A", text: "The principle reason for the upgrade was security." },
      { id: "B", text: "The principal reason for the upgrade was security." },
      { id: "C", text: "She acted against her principal of transparency." },
      { id: "D", text: "Our guiding principal is least privilege." },
    ],
    correctId: "B",
    rationale:
      "'Principal' means main/primary (or a chief person); 'principle' means a rule or belief. 'The principal reason' (main) is correct. C and D should use 'principle' (a belief/rule).",
    reference: "English › Commonly confused words",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Punctuation",
    difficulty: "MEDIUM",
    prompt:
      "Which sentence correctly uses a semicolon to join related independent clauses?",
    options: [
      { id: "A", text: "The migration finished early; therefore, we began testing ahead of schedule." },
      { id: "B", text: "The migration finished early; and we began testing." },
      { id: "C", text: "The migration finished early; testing." },
      { id: "D", text: "The migration finished early; because the team prepared well." },
    ],
    correctId: "A",
    rationale:
      "A semicolon joins two independent clauses, often with a conjunctive adverb followed by a comma ('; therefore,'). A is correct. B pairs a semicolon with 'and' (use a comma instead); C and D follow the semicolon with a fragment.",
    reference: "English › Semicolons",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Syntax & Sentence Structure",
    difficulty: "MEDIUM",
    prompt:
      "Which revision best eliminates redundancy? Original: 'In my personal opinion, I think we should collaborate together to combine the two systems into one.'",
    options: [
      { id: "A", text: "In my personal opinion, I think we should collaborate together to combine the systems." },
      { id: "B", text: "I think we should collaborate to combine the two systems." },
      { id: "C", text: "In my opinion, I personally think we should work together collaboratively." },
      { id: "D", text: "We should collaborate together to combine and merge the two systems into one." },
    ],
    correctId: "B",
    rationale:
      "'Personal opinion/I think,' 'collaborate together,' and 'combine into one' are redundant. B trims the redundancy while preserving meaning. The others retain doubled phrasing.",
    reference: "English › Redundancy",
  },
  {
    section: "ENGLISH_EXPRESSION",
    topic: "Professional Communication",
    difficulty: "EASY",
    prompt:
      "Which is the most appropriate opening line for a formal email to a senior official you have not met?",
    options: [
      { id: "A", text: "Hey! Quick question for you—" },
      { id: "B", text: "Dear Director Reyes, I am writing to request guidance on the network upgrade timeline." },
      { id: "C", text: "Yo, need your input on something." },
      { id: "D", text: "To whom it may concern, what's the deal with the upgrade?" },
    ],
    correctId: "B",
    rationale:
      "A formal email to a senior official should use a proper salutation and a clear, courteous statement of purpose. B does this. A and C are too casual; D pairs an impersonal salutation with an informal, vague question.",
    reference: "English › Professional tone",
  },
];

const ALL_QUESTIONS: Q[] = [
  ...JOB_KNOWLEDGE,
  ...SITUATIONAL,
  ...ENGLISH,
  ...(JOB_KNOWLEDGE_EXTRA as unknown as Q[]),
  ...(JOB_KNOWLEDGE_EXTRA_2 as unknown as Q[]),
  ...(JOB_KNOWLEDGE_EXTRA_3 as unknown as Q[]),
  ...(SITUATIONAL_EXTRA as unknown as Q[]),
  ...(ENGLISH_EXTRA as unknown as Q[]),
  ...(EXTRA_QUESTIONS as unknown as Q[]),
];

async function main() {
  console.log("Resetting data…");
  await prisma.userResponse.deleteMany();
  await prisma.sectionState.deleteMany();
  await prisma.testSession.deleteMany();
  await prisma.narrative.deleteMany();
  await prisma.question.deleteMany();
  await prisma.studyMaterial.deleteMany();
  // Keep existing users so a logged-in candidate isn't wiped on reseed.

  console.log(`Seeding ${ALL_QUESTIONS.length} questions…`);
  for (const q of ALL_QUESTIONS) {
    await prisma.question.create({
      data: {
        section: q.section,
        topic: q.topic,
        difficulty: q.difficulty,
        prompt: q.prompt,
        scenario: q.scenario ?? null,
        options: j(q.options),
        correctId: q.correctId,
        rationale: q.rationale,
        optionNotes: q.optionNotes ? j(q.optionNotes) : null,
        reference: q.reference ?? null,
      },
    });
  }

  console.log(`Seeding ${STUDY.length} study materials…`);
  for (const s of STUDY) {
    await prisma.studyMaterial.create({
      data: {
        section: s.section,
        topic: s.topic,
        title: s.title,
        summary: s.summary,
        content: s.content,
        keyPoints: j(s.keyPoints),
        flashcards: j(s.flashcards),
        order: s.order,
      },
    });
  }

  // A demo candidate placeholder. It is given a strong RANDOM, never-disclosed
  // password (same scrypt format as auth.ts) rather than left passwordless — a
  // passwordless account would otherwise be a takeover target on a public
  // deployment. Nobody can sign in as it; real visitors create their own login.
  const existingDemo = await prisma.user.findFirst({
    where: { name: "Demo Candidate" },
  });
  if (!existingDemo) {
    console.log("Creating demo candidate…");
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(randomBytes(32).toString("hex"), salt, 64).toString("hex");
    await prisma.user.create({
      data: { name: "Demo Candidate", passwordHash: `scrypt$${salt}$${hash}` },
    });
  }

  const counts = {
    questions: await prisma.question.count(),
    study: await prisma.studyMaterial.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
