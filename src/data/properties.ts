// SPDX-License-Identifier: AGPL-3.0-or-later

export type PropertyCategory =
  | 'Reconnaissance'
  | 'Intelligence'
  | 'Injection'
  | 'Strategy'
  | 'Research';

export interface WorkflowStep {
  step: string;
  title: string;
  detail: string;
}

export interface ConfusedProperty {
  id: string;
  index: string;
  subdomain: string;
  url: string;
  modulePath: string;
  category: PropertyCategory;
  groupLabel: string;
  title: string;
  summary: string;
  capabilities: string[];
  workflowSteps: WorkflowStep[];
  inspectedSignals: string[];
  protocolPosture: string;
  rfcNotes: string;
  accentColor: string;
  comingSoon?: boolean;
}

export const CONFUSED_PROPERTIES: ConfusedProperty[] = [
  {
    id: 'crawler',
    index: '01',
    subdomain: 'crawler.0xconfused.com',
    url: 'https://crawler.0xconfused.com',
    modulePath: './crawler',
    category: 'Reconnaissance',
    groupLabel: 'Network & Domain Recon',
    title: 'Web Directory Reconnaissance & Intelligence Engine',
    summary:
      'Same-domain URL extraction, directory hierarchy discovery, JavaScript API endpoint inference, OpenAPI 3.1 export, and domain intelligence.',
    capabilities: [
      'Recursive Directory Tree',
      'JS API Endpoint Extraction',
      'OpenAPI 3.1 Schema Export',
      'CT Subdomain & TLS Audit',
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Recursive Same-Domain Crawl',
        detail:
          'Resolves target origins with URI normalization, optional robots.txt parsing, and configurable concurrency and depth bounds.',
      },
      {
        step: '02',
        title: 'Directory & JS Endpoint Mapping',
        detail:
          'Constructs navigable folder/file trees while scanning JavaScript bundles for API routes, auth patterns, and query parameters.',
      },
      {
        step: '03',
        title: 'Intelligence & Export',
        detail:
          'Pairs crawl results with DNS, RDAP/WHOIS, and certificate transparency lookups, exporting to OpenAPI 3.1 or JSON session archives.',
      },
    ],
    inspectedSignals: [
      'Directory & file hierarchy',
      'HTTP 2xx–5xx & redirect chains',
      'JS bundle API routes',
      'OpenAPI 3.1 schema inference',
      'robots.txt & sitemap directives',
      'External domain outbound links',
    ],
    protocolPosture: 'HTTPS · Client-First SPA · AGPL-3.0-or-later',
    rfcNotes:
      'URI canonicalization, robots.txt parsing, static JS endpoint extraction, and strict SSRF guardrails.',
    accentColor: '#c30800',
  },
  {
    id: 'whoisnt',
    index: '02',
    subdomain: 'whoisnt.0xconfused.com',
    url: 'https://whoisnt.0xconfused.com',
    modulePath: './whoisnt',
    category: 'Intelligence',
    groupLabel: 'Network & Domain Recon',
    title: 'WHOIS & RDAP Difference Analysis Engine',
    summary:
      'Authoritative WHOIS and RDAP difference engine comparing domain records, EPP status flags, registrars, mail authentication, TLS chains, and BGP infrastructure.',
    capabilities: [
      'Authoritative WHOIS & RDAP Diff',
      'SPF, DMARC, DKIM & SOA Audit',
      'X.509 TLS & CT Subdomains',
      'BGP ASN & Passive DNS',
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Registry & EPP Comparison',
        detail:
          'Queries authoritative RDAP and WHOIS servers to diff registrar metadata, registrant organization, creation windows, and EPP status flags.',
      },
      {
        step: '02',
        title: 'Mail & Verification Correlation',
        detail:
          'Inspects SPF origin IPs, DMARC aggregate/forensic URIs, DKIM CNAME selectors, SOA hostmasters, and TXT verification tokens.',
      },
      {
        step: '03',
        title: 'Infrastructure & TLS Fingerprinting',
        detail:
          'Evaluates BGP ASN /24 allocations, PTR reverse DNS, passive DNS history, X.509 validity windows, and sanitized HTTP headers.',
      },
    ],
    inspectedSignals: [
      'EPP status & registrar IDs',
      'SPF / DMARC / DKIM / SOA',
      'HTML meta & TXT tokens',
      'X.509 subject & CA chains',
      'BGP ASN & /24 IPv4 subnets',
      'CT logs & reverse PTR',
    ],
    protocolPosture: 'HTTPS · RDAP & WHOIS · AGPL-3.0-or-later',
    rfcNotes:
      'Cross-domain ownership correlation across RDAP, DNS-over-HTTPS, TLS certificates, and HTTP probe responses.',
    accentColor: '#c300bb',
  },
  {
    id: 'jekyll',
    index: '03',
    subdomain: 'jekyll.0xconfused.com',
    url: 'https://jekyll.0xconfused.com',
    modulePath: './jekyll',
    category: 'Injection',
    groupLabel: 'Payload Tooling & Strategy',
    title: 'JavaScript Injection & Payload Analysis Platform',
    summary:
      'Compile and inject JavaScript into HTML documents with built-in static detection for DOM method hooking, XOR/LSB steganography carriers, and obfuscation.',
    capabilities: [
      'JS-to-HTML Injection',
      'DOM Hooking & Charset Scan',
      'Image XOR & Canvas LSB Check',
      'Sandboxed Output Preview',
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Document & Payload Ingestion',
        detail:
          'Loads HTML documents and JavaScript payloads client-side, keeping inspection isolated within browser execution boundaries.',
      },
      {
        step: '02',
        title: 'Static Concealment & Sink Detection',
        detail:
          'Detects DOM function rebinding, repeating-key image onerror XOR carriers, canvas LSB steganography, and bracket/hex obfuscation.',
      },
      {
        step: '03',
        title: 'Compilation & Sandboxed Preview',
        detail:
          'Compiles and injects scripts cleanly into target HTML output with toggleable JavaScript execution preview.',
      },
    ],
    inspectedSignals: [
      'DOM method hooking & rebinding',
      'Image onerror XOR carriers',
      'DOM charset index packers',
      'Canvas LSB steganography',
      'Bracket & hex obfuscation',
      'URL coordinate matrix loaders',
    ],
    protocolPosture: 'HTTPS · Client-Side Processing · AGPL-3.0-or-later',
    rfcNotes:
      'Single-tag and size-bounded (< 25 MB / < 1 MB) static heuristics designed to isolate concealed payload loaders without false positives.',
    accentColor: '#bbc300',
  },
  {
    id: 'go',
    index: '04',
    subdomain: 'go.0xconfused.com',
    url: 'https://go.0xconfused.com',
    modulePath: './go',
    category: 'Strategy',
    groupLabel: 'Payload Tooling & Strategy',
    title: 'Toroidal Go & UCT/RAVE Engine',
    summary:
      'Toroidal Go board game with an infinite wraparound grid, interactive position editor, pan-and-zoom viewport, and Pachi-inspired non-neural UCT/RAVE opponent.',
    capabilities: [
      'Infinite Wraparound Grid',
      'Pachi-Inspired UCT/RAVE AI',
      'Interactive Position Editor',
      'Pan, Zoom & Recenter Controls',
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Toroidal Topology & Stone Placement',
        detail:
          'Connects opposite board edges seamlessly so liberties, eyes, and captures wrap continuously across horizontal and vertical boundaries.',
      },
      {
        step: '02',
        title: 'Interactive Viewport & Position Editor',
        detail:
          'Pan and zoom across tiled grid intersections, recenter to the nearest board view, or configure custom stone states via the position editor.',
      },
      {
        step: '03',
        title: 'Non-Neural UCT/RAVE Search',
        detail:
          'Plays against a pure client-side Monte Carlo Tree Search engine using Rapid Action Value Estimation (UCT/RAVE) without neural weights.',
      },
    ],
    inspectedSignals: [
      'Toroidal wraparound liberties',
      'UCT / RAVE tree playouts',
      'Custom stone position setup',
      'Infinite tiled pan & zoom',
      'Capture & ko state tracking',
      'Zero-backend client play',
    ],
    protocolPosture: 'HTTPS · Pure Client Engine · AGPL-3.0-or-later',
    rfcNotes:
      'Deterministic Monte Carlo Tree Search with Rapid Action Value Estimation operating on wraparound toroidal board geometry.',
    accentColor: '#c36a00',
  },
  {
    id: 'blog',
    index: '05',
    subdomain: 'blog.0xconfused.com',
    url: 'https://blog.0xconfused.com',
    modulePath: './blog',
    category: 'Research',
    groupLabel: 'Writeups & Research',
    title: 'Security Research, Detection Engineering & Writeups',
    summary:
      'Coming soon: technical writeups covering detection engineering, type confusion and vulnerability research, threat triage notes, and standalone tooling breakdowns.',
    capabilities: [
      'Detection Engineering Notes',
      'Vulnerability & Type Confusion Writeups',
      'Threat Triage Workflows',
      'Tool Architecture Postmortems',
    ],
    workflowSteps: [
      {
        step: '01',
        title: 'Detection & Triage Notes',
        detail:
          'Documents practical detection rules, threat triage heuristics, and investigative patterns from live security work.',
      },
      {
        step: '02',
        title: 'Security Research Writeups',
        detail:
          'Covers memory corruption concepts, type confusion mechanics, protocol quirks, and JavaScript payload analysis.',
      },
      {
        step: '03',
        title: 'Tooling & Architecture Notes',
        detail:
          'Breaks down design tradeoffs, implementation notes, and standalone tooling workflows built for practical threat triage.',
      },
    ],
    inspectedSignals: [
      'Detection rule engineering',
      'Type confusion mechanics',
      'Threat triage playbooks',
      'Payload & binary triage',
      'Tool design breakdowns',
      'Zero-telemetry reading',
    ],
    protocolPosture: 'HTTPS · Coming Soon',
    rfcNotes: 'Upcoming security research and detection engineering blog planned for blog.0xconfused.com.',
    accentColor: '#737373',
    comingSoon: true,
  },
];

export interface FaqItem {
  index: string;
  tag: string;
  question: string;
  answer: string;
}

const NOW = new Date();
const RESEARCHER_START_YEAR = 2019;
const YEARS_AS_RESEARCHER = Math.max(1, NOW.getFullYear() - RESEARCHER_START_YEAR);
const DETECTION_MONTHS = (NOW.getFullYear() - 2024) * 12 + (NOW.getMonth() - 5);
const YEARS_AS_DETECTION_ENGINEER = Math.max(1, Math.floor(DETECTION_MONTHS / 12));

export interface MediaVariant {
  id: string;
  label: string;
  filename: string;
  href: string;
  dimensions: string;
  sizeLabel: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  filename: string;
  href: string;
  format: string;
  dimensions: string;
  sizeLabel: string;
  kind: 'image' | 'font';
  bundleFilename?: string;
  copyright?: string;
  licenseName: string;
  licenseHref?: string;
  variants?: MediaVariant[];
}

export const MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'emblem-10k',
    title: '0xCONFUSED Full Emblem',
    filename: '10x10kpx.png',
    href: './10x10kpx.png',
    format: 'PNG',
    dimensions: '8410 × 9210',
    sizeLabel: '576 KB',
    kind: 'image',
    copyright: '0xCONFUSED',
    licenseName: 'CC BY-NC 4.0',
    licenseHref: './assets/CC-BY-NC-4.0.txt',
  },
  {
    id: 'backgrounds-ascii',
    title: '0xCONFUSED ASCII Backgrounds',
    filename: '0xconfused-bg-720p / 1080p / 4k.png',
    href: './assets/backgrounds/0xconfused-bg-1080p.png',
    format: 'PNG',
    dimensions: '720p / 1080p / 4K',
    sizeLabel: '3.0 MB ZIP',
    kind: 'image',
    bundleFilename: '0xconfused-backgrounds.zip',
    copyright: '0xCONFUSED',
    licenseName: 'CC BY-NC 4.0',
    licenseHref: './assets/CC-BY-NC-4.0.txt',
    variants: [
      {
        id: 'bg-720p',
        label: '720p',
        filename: '0xconfused-bg-1280x720.png',
        href: './assets/backgrounds/0xconfused-bg-720p.png',
        dimensions: '1280 × 720',
        sizeLabel: '396 KB',
      },
      {
        id: 'bg-1080p',
        label: '1080p',
        filename: '0xconfused-bg-1920x1080.png',
        href: './assets/backgrounds/0xconfused-bg-1080p.png',
        dimensions: '1920 × 1080',
        sizeLabel: '650 KB',
      },
      {
        id: 'bg-4k',
        label: '4K',
        filename: '0xconfused-bg-3840x2160.png',
        href: './assets/backgrounds/0xconfused-bg-4k.png',
        dimensions: '3840 × 2160',
        sizeLabel: '1.96 MB',
      },
    ],
  },
  {
    id: 'favicon-ico',
    title: 'Multi-Size Favicon Icon',
    filename: 'favicon.ico',
    href: './favicon.ico',
    format: 'ICO',
    dimensions: '32 / 48 / 64 / 128 px',
    sizeLabel: '97 KB',
    kind: 'image',
    copyright: '0xCONFUSED',
    licenseName: 'CC BY-NC 4.0',
    licenseHref: './assets/CC-BY-NC-4.0.txt',
  },
  {
    id: 'font-glitch',
    title: 'Glitch Goblin Display Font',
    filename: 'glitch-goblin.regular.ttf',
    href: './fonts/glitch-goblin.regular.ttf',
    format: 'TTF + OFL.txt',
    dimensions: 'TrueType Font',
    sizeLabel: '41 KB ZIP',
    kind: 'font',
    bundleFilename: 'glitch-goblin-1.10-ofl.zip',
    copyright: 'Copyright 2023 GGBotNet',
    licenseName: 'SIL OFL-1.1',
    licenseHref: './fonts/OFL.txt',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    index: '01',
    tag: 'ECOSYSTEM',
    question: 'What is 0xCONFUSED?',
    answer:
      `0xCONFUSED is my username—a play on type confusion. I have been a cybersecurity researcher for over ${YEARS_AS_RESEARCHER} years and a detection engineer for over ${YEARS_AS_DETECTION_ENGINEER} ${YEARS_AS_DETECTION_ENGINEER === 1 ? 'year' : 'years'}. This site is a compilation of standalone projects I thought would be interesting to work on or that I found useful for threat triage.`,
  },
  {
    index: '02',
    tag: 'PRIVACY',
    question: 'Does any 0xconfused.com tool track users or store PII?',
    answer:
      'No. All properties operate without analytics beacons, tracking cookies, or third-party telemetry scripts. Processing stays client-side in your browser session or queries public protocol endpoints directly without retaining PII. However, requests sent to free third-party APIs, public CORS proxies, or external lookup services rely on infrastructure outside the control of 0xconfused.com applications, and their data handling or logging policies are governed by those external providers.',
  },
  {
    index: '03',
    tag: 'RECON',
    question: 'Why is ./crawler only returning one result?',
    answer:
      'Browsers enforce Cross-Origin Resource Sharing (CORS): unless the target server sends Access-Control-Allow-Origin headers permitting crawler.0xconfused.com, the browser blocks reading the page body, so ./crawler cannot parse links and stops after the initial target entry. In Recon Parameters, No Proxy (Direct) works only on CORS-enabled or same-origin targets; Public Proxy routes requests through CORS relays (such as cors.dev, corsproxy.io, or codetabs) that inject the response header though they may face rate limits; and Custom Proxy sends fetches through your own proxy endpoint to bypass CORS without shared public limits.',
  },
  {
    index: '04',
    tag: 'SANDBOX',
    question: 'Why is my output file from ./jekyll not running the JavaScript?',
    answer:
      'Execution depends heavily on how and where the HTML output is opened. Opening a file directly over file:// enforces opaque origin rules that block ES modules, fetch calls, storage APIs, and cross-origin canvas reads; serving over http:// or https:// is often required. Host environments can also block scripts via Content Security Policy (CSP script-src/nonces), <iframe sandbox> restrictions, or previewers/viewers that strip inline <script> tags and event handlers (such as image onerror triggers). Check the browser DevTools console for CSP, CORS, or syntax errors, verify JS execution is enabled in the viewer, and confirm the target HTML includes the expected DOM hooks before delivery.',
  },
  {
    index: '05',
    tag: 'ENGINE',
    question: 'Can I play ./go online?',
    answer: 'No.',
  },
  {
    index: '06',
    tag: 'LICENSE',
    question: 'How are the applications licensed and hosted?',
    answer:
      'All 0xCONFUSED web properties are released under AGPL-3.0-or-later and deploy as static builds.',
  },
];

export type ResourceCategory =
  | 'Web & Payloads'
  | 'Detection & Recon'
  | 'x86 & Shellcode'
  | 'Hardware & Embedded'
  | 'Utilities';

export interface SuggestedResource {
  index: string;
  title: string;
  domain: string;
  url: string;
  category: ResourceCategory;
  note: string;
}

export const SUGGESTED_RESOURCES: SuggestedResource[] = [
  {
    index: '01',
    title: 'PayloadsAllTheThings: XSS Injection',
    domain: 'github.com',
    url: 'https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/XSS%20Injection/README.md',
    category: 'Web & Payloads',
    note: 'Curated XSS vectors, DOM sinks, polyglots, and filter bypass methodologies.',
  },
  {
    index: '02',
    title: 'CTF Wiki: Python Sandbox Escape',
    domain: 'github.com',
    url: 'https://github.com/mahaloz/ctf-wiki-en/blob/master/docs/pwn/linux/sandbox/python-sandbox-escape.md',
    category: 'Web & Payloads',
    note: 'Reference techniques for escaping restricted Python execution environments and AST jails.',
  },
  {
    index: '03',
    title: 'regex101',
    domain: 'regex101.com',
    url: 'https://regex101.com/',
    category: 'Utilities',
    note: 'Interactive regular expression tester, match debugger, and multi-flavor syntax reference.',
  },
  {
    index: '04',
    title: 'GCHQ CyberChef',
    domain: 'gchq.github.io',
    url: 'https://gchq.github.io/CyberChef/',
    category: 'Utilities',
    note: 'Client-side data transformation workbench for decoding, XOR, compression, and hex triage.',
  },
  {
    index: '05',
    title: 'LOLBAS Project',
    domain: 'lolbas-project.github.io',
    url: 'https://lolbas-project.github.io/',
    category: 'Detection & Recon',
    note: 'Index of native Windows Living Off The Land binaries, scripts, and libraries for detection engineering.',
  },
  {
    index: '06',
    title: 'webcrack',
    domain: 'webcrack.netlify.app',
    url: 'https://webcrack.netlify.app/',
    category: 'Utilities',
    note: 'JavaScript deobfuscator and AST unbundler for obfuscator.io, webpack, and browserify payloads.',
  },
  {
    index: '07',
    title: 'Writing Windows Shellcode',
    domain: 'idafchev.github.io',
    url: 'https://idafchev.github.io/exploit/2017/09/26/writing_windows_shellcode.html',
    category: 'x86 & Shellcode',
    note: 'Walkthrough of position-independent Windows shellcode and PEB export resolution.',
  },
  {
    index: '08',
    title: 'Windows Shellcoding — Part 1',
    domain: 'cocomelonc.github.io',
    url: 'https://cocomelonc.github.io/tutorial/2021/10/27/windows-shellcoding-1.html',
    category: 'x86 & Shellcode',
    note: 'Practical tutorial covering Windows shellcode construction, assembly, and payload execution.',
  },
  {
    index: '09',
    title: 'x86 Opcode & Instruction Reference',
    domain: 'ref.x86asm.net',
    url: 'http://ref.x86asm.net/coder32.html',
    category: 'x86 & Shellcode',
    note: '32-bit x86 opcode map, ModR/M encoding tables, and instruction operand specifications.',
  },
  {
    index: '10',
    title: 'Hurricane Electric BGP Toolkit',
    domain: 'bgp.he.net',
    url: 'https://bgp.he.net/',
    category: 'Detection & Recon',
    note: 'BGP prefix, ASN peering, route origin, and network allocation lookup toolkit.',
  },
  {
    index: '11',
    title: 'SkullSecurity: x86 Registers',
    domain: 'skullsecurity.org',
    url: 'https://www.skullsecurity.org/wiki/Registers',
    category: 'x86 & Shellcode',
    note: 'Concise reference covering x86 general-purpose, segment, instruction pointer, and flag registers.',
  },
  {
    index: '12',
    title: 'YARA: Writing YARA Rules',
    domain: 'yara.readthedocs.io',
    url: 'https://yara.readthedocs.io/en/stable/writingrules.html',
    category: 'Detection & Recon',
    note: 'Official documentation for writing hex, text, regex, and condition-based YARA detections.',
  },
  {
    index: '13',
    title: '0xsyr0/OSCP Reference',
    domain: 'github.com',
    url: 'https://github.com/0xsyr0/OSCP',
    category: 'Web & Payloads',
    note: 'Field notes covering enumeration, exploitation commands, privilege escalation, and triage checklists.',
  },
  {
    index: '14',
    title: 'urlDNA',
    domain: 'urldna.io',
    url: 'https://urldna.io/',
    category: 'Detection & Recon',
    note: 'URL and webpage threat analysis platform inspecting screenshots, DOM artifacts, redirects, and phishing indicators.',
  },
  {
    index: '15',
    title: 'Lookyloo',
    domain: 'lookyloo.circl.lu',
    url: 'https://lookyloo.circl.lu/',
    category: 'Detection & Recon',
    note: 'CIRCL web capture interface mapping page redirect trees, third-party resource loads, and DOM relationships.',
  },
  {
    index: '16',
    title: 'Unprotect Project',
    domain: 'unprotect.it',
    url: 'https://unprotect.it/',
    category: 'Detection & Recon',
    note: 'Malware evasion database cataloging anti-analysis techniques, detection strategies, and YARA rules.',
  },
  {
    index: '17',
    title: 'CIRCL Hashlookup',
    domain: 'hashlookup.circl.lu',
    url: 'https://hashlookup.circl.lu/',
    category: 'Detection & Recon',
    note: 'Public MD5, SHA-1, and SHA-256 lookup service for known software files, NSRL datasets, and forensic triage.',
  },
  {
    index: '18',
    title: 'OffsecKit Tools',
    domain: 'offseckit.com',
    url: 'https://offseckit.com/tools',
    category: 'Utilities',
    note: 'Collection of offensive security utilities for encoding, payload formatting, parsing, and triage workflows.',
  },
  {
    index: '19',
    title: 'Microcorruption',
    domain: 'microcorruption.com',
    url: 'https://microcorruption.com/',
    category: 'Hardware & Embedded',
    note: 'Embedded security CTF featuring MSP430 assembly debugging, reverse engineering, and memory corruption challenges.',
  },
  {
    index: '20',
    title: 'PCB ReTrace Studio',
    domain: 'pcb.etaras.com',
    url: 'https://pcb.etaras.com/studio.html',
    category: 'Hardware & Embedded',
    note: 'Local-first browser workspace for PCB layer alignment, net tracing, visual BOM mapping, and KiCad schematic export.',
  },
  {
    index: '21',
    title: 'LookSei Labs Blog',
    domain: 'blog.looksei.com',
    url: 'https://blog.looksei.com/',
    category: 'Hardware & Embedded',
    note: 'Hardware teardowns, wireless component analysis, and FCC regulatory filing breakdowns for consumer electronics.',
  },
  {
    index: '22',
    title: 'Free Public APIs',
    domain: 'free-apis.github.io',
    url: 'https://free-apis.github.io/#/browse',
    category: 'Utilities',
    note: 'Browseable catalog of free public APIs organized by category, authentication requirements, and CORS support.',
  },
];

