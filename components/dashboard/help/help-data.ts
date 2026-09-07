export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  category: "Getting Started" | "Editor & Blocks" | "Polyglot Code" | "Databases" | "Notion AI & RAG" | "Collaboration" | "Data & Sync" | "Billing & Plans";
  readTime: string;
  updatedAt: string;
  excerpt: string;
  tags: string[];
  content: {
    intro: string;
    sections: {
      heading: string;
      body: string;
      codeSnippet?: {
        lang: string;
        code: string;
      };
      callout?: {
        type: "note" | "tip" | "warning";
        text: string;
      };
      steps?: string[];
    }[];
  };
}

export interface ShortcutItem {
  keys: string[];
  description: string;
  category: "General & Navigation" | "Block Creation" | "Formatting" | "Notion AI";
  macKeys?: string[];
}

export const HELP_CATEGORIES = [
  "All Topics",
  "Getting Started",
  "Editor & Blocks",
  "Polyglot Code",
  "Databases",
  "Notion AI & RAG",
  "Collaboration",
  "Data & Sync",
  "Billing & Plans",
] as const;

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "art-1",
    slug: "getting-started-workspace",
    title: "Getting Started: Workspace Hierarchy & Slash Commands",
    category: "Getting Started",
    readTime: "3 min read",
    updatedAt: "Updated 2 days ago",
    excerpt: "Master page trees with O(1) materialized path hierarchy, slash commands, and seamless block creation.",
    tags: ["basics", "pages", "slash commands", "shortcuts"],
    content: {
      intro: "Welcome to your collaborative workspace. Everything in Notion is built from modular blocks. You can reorder, convert, nest, and transform any piece of content on the fly without breaking your document structure.",
      sections: [
        {
          heading: "1. The Power of Slash Commands ( / )",
          body: "Press `/` anywhere on a blank line to summon the block creation menu. Typing after the slash filters blocks instantaneously. For example, `/h1` produces a Primary Heading, while `/code` drops an executable sandbox.",
          callout: {
            type: "tip",
            text: "Tip: You can also use Markdown prefixes! Type '# ' for H1, '## ' for H2, '- ' for a bulleted list, or '[] ' for a checklist.",
          },
        },
        {
          heading: "2. Nested Page Trees & Materialized Paths",
          body: "Unlike shallow note apps, every document in this workspace can be nested infinitely. Sub-pages inherit materialized ancestor path indexing ({ ancestors: [parentId] }), allowing atomic cascade moves and instantaneous O(1) tree traversals.",
          steps: [
            "Click '+ New Page' in the sidebar or type '/page' inside any existing document.",
            "Drag and drop any page in the sidebar tree to reparent it instantly.",
            "Sub-page breadcrumbs appear automatically at the top of every child document.",
          ],
        },
        {
          heading: "3. Cover Banners & Visual Icons",
          body: "Personalize your documents by hovering over the page title and clicking 'Add Cover' or 'Add Icon'. Choose from curated minimal gradients, direct Unsplash high-res photographic searches, or hundreds of unicode emojis.",
        },
      ],
    },
  },
  {
    id: "art-2",
    slug: "block-editor-advanced",
    title: "Block Editor Deep Dive: Callouts, Toggles, Tables & Web Bookmarks",
    category: "Editor & Blocks",
    readTime: "4 min read",
    updatedAt: "Updated this week",
    excerpt: "Learn how to format rich blocks, collapsible toggles, OpenGraph live bookmark previews, and floating format bars.",
    tags: ["editor", "blocks", "callouts", "toggles", "bookmarks"],
    content: {
      intro: "Our dynamic canvas supports rich block types engineered for zero-friction writing and structured information design.",
      sections: [
        {
          heading: "Collapsible Toggle Blocks",
          body: "Toggles keep long technical documents compact. Type `/toggle` to create a collapsible section. You can drop code blocks, bullet points, or even database boards inside a toggle container.",
        },
        {
          heading: "Callout Blocks with Custom Accent Borders",
          body: "Highlight key takeaways, warnings, or design instructions with Callout blocks. Type `/callout` to insert a block with a dedicated icon and soft background fill.",
          callout: {
            type: "note",
            text: "Callout blocks support custom icons: click the icon on any callout to replace it with an emoji or contextual symbol.",
          },
        },
        {
          heading: "OpenGraph Web Bookmarks",
          body: "Paste any URL into the canvas and select 'Create Web Bookmark'. Our backend scraper automatically fetches the target site's title, description, favicon, and social hero image preview.",
          codeSnippet: {
            lang: "markdown",
            code: "https://nextjs.org/docs\n-> Paste URL -> Select 'Create Bookmark' -> Renders rich card preview",
          },
        },
      ],
    },
  },
  {
    id: "art-3",
    slug: "polyglot-code-runner-sandboxes",
    title: "In-Browser Polyglot Code Sandboxes: Python WASM & JavaScript",
    category: "Polyglot Code",
    readTime: "5 min read",
    updatedAt: "Updated 3 days ago",
    excerpt: "Execute real code directly inside your workspace documents using in-browser Pyodide WASM and sandboxed JavaScript engines.",
    tags: ["code", "python", "pyodide", "wasm", "javascript", "developer"],
    content: {
      intro: "No external backend execution environment or containers needed. Code blocks in this workspace include real client-side execution engines capable of running standard JavaScript and Python directly inside browser WebAssembly.",
      sections: [
        {
          heading: "Python WebAssembly Execution (Pyodide)",
          body: "When you select Python in a code block, the editor bootstraps a dedicated Pyodide WASM runtime. It captures standard output streams (stdout), executes mathematical algorithms, and displays output latency in milliseconds.",
          codeSnippet: {
            lang: "python",
            code: "# Live Python sandbox inside code block\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nprint(list(fibonacci(10)))\n# Click 'Run' to execute in browser WASM",
          },
          callout: {
            type: "tip",
            text: "Pyodide WASM runs 100% locally in your browser tab. Your code and private runtime data never leave your client device.",
          },
        },
        {
          heading: "JavaScript Sandbox & Console Interception",
          body: "JavaScript code blocks execute within a protected Function sandbox that redirects console.log, console.warn, and console.error directly into the interactive console drawer beneath the block.",
        },
      ],
    },
  },
  {
    id: "art-4",
    slug: "databases-multi-view-boards",
    title: "Databases & Multi-View Layouts: Kanban, Timeline Gantt & Data Tables",
    category: "Databases",
    readTime: "4 min read",
    updatedAt: "Updated 1 week ago",
    excerpt: "Transform static lists into dynamic relational views: drag-and-drop Kanban boards, chronological Timeline charts, and editable Data Tables.",
    tags: ["databases", "kanban", "timeline", "tables", "views"],
    content: {
      intro: "Database blocks allow you to view the exact same underlying task and project data through three specialized visual lenses: Board, Timeline, and Table.",
      sections: [
        {
          heading: "Kanban Board View",
          body: "Group tasks by workflow stage (To Do, In Progress, Review, Completed). Drag and drop cards across columns to automatically mutate card status properties. Cards support colored status badges, priority tags, and quick-add actions.",
        },
        {
          heading: "Timeline / Gantt Chart View",
          body: "Visualize deadlines, milestone spans, and project dependencies chronologically across calendar dates. Adjust start dates and durations directly on the interactive Gantt chart.",
        },
        {
          heading: "Interactive Data Table View",
          body: "Excel-grade inline editing with typed columns: Text, Multi-select Tags, Dates, and Priority. Add new rows with a single click or keyboard shortcut.",
          callout: {
            type: "note",
            text: "Switching between Board, Timeline, and Table views preserves all filter states and card properties without data loss.",
          },
        },
      ],
    },
  },
  {
    id: "art-5",
    slug: "notion-ai-langchain-rag",
    title: "Notion AI & LangChain RAG: Vector Indexing & Voice Meeting Summaries",
    category: "Notion AI & RAG",
    readTime: "5 min read",
    updatedAt: "Updated 4 days ago",
    excerpt: "Understand how our 6-stage LangChain vector pipeline indexes your workspace and how AI voice transcription works.",
    tags: ["ai", "rag", "langchain", "embeddings", "chromadb", "speech"],
    content: {
      intro: "Notion AI isn't just a generic chatbot—it is grounded directly in your workspace documents through an intelligent, asynchronous vector Retrieval-Augmented Generation (RAG) pipeline.",
      sections: [
        {
          heading: "Debounced Vector Indexing (2.5s Queue)",
          body: "To keep editing buttery smooth, autosaves are buffered through an asynchronous 2.5-second debounce queue. Once you pause typing, your document is chunked, embedded via all-MiniLM-L6-v2, and indexed into ChromaDB vector storage.",
          steps: [
            "User edits document in block editor -> local IndexedDB persists instantly (0ms).",
            "Autosave hook flushes to MongoDB and enqueues indexing job.",
            "Queue debouncer collapses rapid keystrokes into a single embedding request.",
            "LangChain vector store refreshes with cosine similarity indices.",
          ],
        },
        {
          heading: "🎙️ Live Meeting Transcriptions & WebGL Visualizer",
          body: "Use the Meeting Note block to record live speech. Using the browser Web Speech API paired with an interactive 3D WebGL particle strand visualizer, the app transcribes spoken discussion in real time and prompts Notion AI to draft structured action items.",
        },
        {
          heading: "Grounding & Document Citations",
          body: "When you ask Notion AI a question in the AI side panel or Quick AI modal (Cmd+J), the RAG pipeline retrieves relevant vector chunks and provides exact document links alongside synthesized answers.",
        },
      ],
    },
  },
  {
    id: "art-6",
    slug: "realtime-collaboration-presence",
    title: "Real-Time Collaboration: Multi-Cursor Presence & Inline Threads",
    category: "Collaboration",
    readTime: "3 min read",
    updatedAt: "Updated 5 days ago",
    excerpt: "Collaborate seamlessly with teammates with live cursor flags, online presence avatars, and threaded document comments.",
    tags: ["collaboration", "presence", "cursors", "comments", "multiuser"],
    content: {
      intro: "Work together in real time without overwriting each other's changes. Multi-tab and multi-user synchronization are built into every document.",
      sections: [
        {
          heading: "Live Remote Cursors & Color Highlights",
          body: "When colleagues join your active document, their presence appears in the Live Presence Bar at top right. Their mouse pointers and active editing selections are highlighted with distinctive user-branded color tags.",
        },
        {
          heading: "Threaded Inline Comments",
          body: "Highlight any text block to drop an inline comment. Teammates can reply, resolve, or reopen threads. Timestamp attribution and author profile details are saved with each comment.",
          callout: {
            type: "tip",
            text: "Resolved comments remain accessible in the Page History menu so you never lose conversational context.",
          },
        },
      ],
    },
  },
  {
    id: "art-7",
    slug: "local-first-data-safety-versions",
    title: "Data Safety: Local-First 0ms Persistence & Visual Diff Rollback",
    category: "Data & Sync",
    readTime: "4 min read",
    updatedAt: "Updated 1 week ago",
    excerpt: "Learn how IndexedDB local caching guarantees 0ms loads, how offline mutations queue safely, and how visual diffs let you restore past snapshots.",
    tags: ["offline", "indexeddb", "sync", "versions", "diff", "backup"],
    content: {
      intro: "Never lose a single keystroke. Our client architecture combines zero-latency local-first IndexedDB storage with an enterprise version history engine.",
      sections: [
        {
          heading: "0ms Local-First Architecture & Offline Queue",
          body: "Every document change writes directly to your browser's IndexedDB before making network calls. If your internet connection drops, you can continue typing uninterrupted. An offline mutation queue tracks pending edits and syncs them automatically once reconnected.",
        },
        {
          heading: "Visual Diff Comparator & Rollback",
          body: "Open Page Settings -> 'Version History' to inspect historical snapshots. Our visual comparator renders side-by-side and unified diffs highlighting green additions and red deletions. Revert to any historical version with one click.",
          callout: {
            type: "warning",
            text: "Restoring an older snapshot creates a new revision rather than deleting history, ensuring you can always return to your current state.",
          },
        },
        {
          heading: "Trash Recovery & Permanent Deletion",
          body: "Deleted pages are moved to the Trash bin where they remain recoverable indefinitely. Click 'Trash' in the sidebar to search deleted documents and restore them to their original parent hierarchy.",
        },
      ],
    },
  },
  {
    id: "art-8",
    slug: "billing-subscriptions-plans",
    title: "Billing & Subscriptions: Free, Pro & Ultimate Tiers (Stripe & Razorpay)",
    category: "Billing & Plans",
    readTime: "3 min read",
    updatedAt: "Updated 2 weeks ago",
    excerpt: "Understand plan features, multi-currency support (USD via Stripe, INR via Razorpay), and invoice management.",
    tags: ["billing", "pricing", "stripe", "razorpay", "pro", "subscription"],
    content: {
      intro: "Flexible plans built for individuals, growing startups, and large enterprises, with domestic and international payment gateways.",
      sections: [
        {
          heading: "Plan Comparison Overview",
          body: "• Free Tier: Unlimited blocks, local-first 0ms storage, community templates, 5MB file uploads.\n• Pro Tier ($10/mo or ₹799/mo): Unlimited Notion AI queries, Pyodide WASM code runner, version history up to 30 days, multi-view databases, 50MB file uploads.\n• Ultimate / Enterprise ($25/mo or ₹1,999/mo): Infinite version history, SAML SSO, priority RAG queue embeddings, dedicated support, custom workspace domains.",
        },
        {
          heading: "Dual Payment Gateways (Stripe & Razorpay)",
          body: "Depending on your region, checkout routes seamlessly through Stripe (Credit/Debit cards, Apple Pay in USD/EUR) or Razorpay (UPI, NetBanking, RuPay cards in INR) with instant automatic webhook reconciliation.",
          callout: {
            type: "note",
            text: "Invoices and subscription status can be viewed anytime under Settings -> Billing.",
          },
        },
      ],
    },
  },
];

export const KEYBOARD_SHORTCUTS: ShortcutItem[] = [
  // General & Navigation
  {
    keys: ["Ctrl", "K"],
    macKeys: ["⌘", "K"],
    description: "Open Global Spotlight Command Palette",
    category: "General & Navigation",
  },
  {
    keys: ["Ctrl", "P"],
    macKeys: ["⌘", "P"],
    description: "Quick search and jump to any document",
    category: "General & Navigation",
  },
  {
    keys: ["Ctrl", "/"],
    macKeys: ["⌘", "/"],
    description: "Open Workspace Help Center & Shortcuts",
    category: "General & Navigation",
  },
  {
    keys: ["Ctrl", "\\"],
    macKeys: ["⌘", "\\"],
    description: "Toggle Left Navigation Sidebar",
    category: "General & Navigation",
  },
  {
    keys: ["Ctrl", "Shift", "L"],
    macKeys: ["⌘", "Shift", "L"],
    description: "Toggle Dark / Light Workspace Theme",
    category: "General & Navigation",
  },

  // Block Creation
  {
    keys: ["/"],
    macKeys: ["/"],
    description: "Summon Block Creation Slash Menu",
    category: "Block Creation",
  },
  {
    keys: ["#", "Space"],
    macKeys: ["#", "Space"],
    description: "Create Large Heading (H1)",
    category: "Block Creation",
  },
  {
    keys: ["##", "Space"],
    macKeys: ["##", "Space"],
    description: "Create Medium Heading (H2)",
    category: "Block Creation",
  },
  {
    keys: ["###", "Space"],
    macKeys: ["###", "Space"],
    description: "Create Small Heading (H3)",
    category: "Block Creation",
  },
  {
    keys: ["[]", "Space"],
    macKeys: ["[]", "Space"],
    description: "Create Interactive To-Do Checklist",
    category: "Block Creation",
  },
  {
    keys: ["-", "Space"],
    macKeys: ["-", "Space"],
    description: "Create Bulleted List item",
    category: "Block Creation",
  },
  {
    keys: ["1.", "Space"],
    macKeys: ["1.", "Space"],
    description: "Create Numbered List item",
    category: "Block Creation",
  },
  {
    keys: [">", "Space"],
    macKeys: [">", "Space"],
    description: "Create Collapsible Toggle block",
    category: "Block Creation",
  },
  {
    keys: ["```", "Space"],
    macKeys: ["```", "Space"],
    description: "Create Polyglot Executable Code block",
    category: "Block Creation",
  },

  // Formatting
  {
    keys: ["Ctrl", "B"],
    macKeys: ["⌘", "B"],
    description: "Toggle Bold styling on selected text",
    category: "Formatting",
  },
  {
    keys: ["Ctrl", "I"],
    macKeys: ["⌘", "I"],
    description: "Toggle Italic styling on selected text",
    category: "Formatting",
  },
  {
    keys: ["Ctrl", "U"],
    macKeys: ["⌘", "U"],
    description: "Toggle Underline on selected text",
    category: "Formatting",
  },
  {
    keys: ["Ctrl", "E"],
    macKeys: ["⌘", "E"],
    description: "Format selection as inline `code`",
    category: "Formatting",
  },
  {
    keys: ["Ctrl", "Shift", "S"],
    macKeys: ["⌘", "Shift", "S"],
    description: "Toggle Strikethrough on selected text",
    category: "Formatting",
  },
  {
    keys: ["Ctrl", "Shift", "H"],
    macKeys: ["⌘", "Shift", "H"],
    description: "Apply last used color / background highlight",
    category: "Formatting",
  },

  // Notion AI
  {
    keys: ["Ctrl", "J"],
    macKeys: ["⌘", "J"],
    description: "Open Quick Notion AI Command Bar",
    category: "Notion AI",
  },
  {
    keys: ["Space"],
    macKeys: ["Space"],
    description: "Prompt Notion AI on any empty block line",
    category: "Notion AI",
  },
  {
    keys: ["Ctrl", "Shift", "A"],
    macKeys: ["⌘", "Shift", "A"],
    description: "Toggle Notion AI Side Assistant Panel",
    category: "Notion AI",
  },
];

export interface DiagnosticItem {
  id: string;
  name: string;
  category: "Storage" | "Network" | "Cache" | "AI Engine" | "Database";
  status: "operational" | "warning" | "optimal";
  value: string;
  detail: string;
}

export const DIAGNOSTICS_DATA: DiagnosticItem[] = [
  {
    id: "diag-idb",
    name: "Client IndexedDB Engine",
    category: "Storage",
    status: "optimal",
    value: "0ms Local First",
    detail: "Local documents persisted with SWR background reconciliation.",
  },
  {
    id: "diag-bc",
    name: "Multi-Tab BroadcastChannel",
    category: "Network",
    status: "operational",
    value: "Channel Active",
    detail: "Cross-tab state updates synchronized with fromSameTab isolation.",
  },
  {
    id: "diag-cache",
    name: "Dual-Tier Distributed Cache",
    category: "Cache",
    status: "optimal",
    value: "L1 RAM + L2 Redis",
    detail: "Sub-millisecond process cache paired with Upstash Redis invalidation.",
  },
  {
    id: "diag-db",
    name: "Geo-Redundant MongoDB",
    category: "Database",
    status: "operational",
    value: "Primary (14ms)",
    detail: "Active-passive primary with automated backup failover monitoring.",
  },
  {
    id: "diag-rag",
    name: "LangChain Vector RAG Engine",
    category: "AI Engine",
    status: "operational",
    value: "ChromaDB Connected",
    detail: "2.5s debounced indexing queue with cosine similarity search.",
  },
  {
    id: "diag-payments",
    name: "Payment Gateways",
    category: "Network",
    status: "operational",
    value: "Stripe & Razorpay Ready",
    detail: "Dual webhook processing active for international & domestic checkout.",
  },
];
