# Notion Workspace & Modern SaaS Platform 🚀

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.11-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/RAG_Service-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/AI-LangChain-1C3C3C?style=flat-square)](https://www.langchain.com/)
[![Python WASM](https://img.shields.io/badge/Sandbox-Pyodide_WASM-3776AB?style=flat-square&logo=python)](https://pyodide.org/)

An enterprise-grade, high-performance collaborative workspace application built on **Next.js 16 (App Router)** and **MongoDB**. Designed to faithfully deliver the modern Notion experience with real-time block editing, in-browser polyglot code execution, database multi-views (Kanban, Timeline, Table), AI vector RAG assistance, voice-to-text meeting summaries with WebGL waveform visualizers, version diff rollback, multi-region billing (Stripe & Razorpay), and collaborative multi-cursor presence.

---

## 📑 Table of Contents

- [🌟 Key Features & Capabilities](#-key-features--capabilities)
  - [1. Block Editor & Dynamic Canvas](#1-block-editor--dynamic-canvas)
  - [2. Multi-View Database Boards](#2-multi-view-database-boards)
  - [3. In-Browser Code Runner Sandbox Engine](#3-in-browser-code-runner-sandbox-engine)
  - [4. Vector RAG AI Assistant & Voice Meeting Transcriber](#4-vector-rag-ai-assistant--voice-meeting-transcriber)
  - [5. Real-Time Multi-Cursor Collaboration & Presence](#5-real-time-multi-cursor-collaboration--presence)
  - [6. Version History & Visual Diff Comparison](#6-version-history--visual-diff-comparison)
  - [7. Notion Calendar Workspace](#7-notion-calendar-workspace)
  - [8. Recursive Hierarchical Sub-Pages](#8-recursive-hierarchical-sub-pages)
  - [9. OpenGraph Web Bookmarks & Media Uploader](#9-opengraph-web-bookmarks--media-uploader)
  - [10. Global Spotlight Command Palette](#10-global-spotlight-command-palette)
  - [11. Multi-Region Billing & Subscriptions](#11-multi-region-billing--subscriptions)
- [🏗️ System Architecture & Tech Stack](#️-system-architecture--tech-stack)
- [📁 Project Directory Structure](#-project-directory-structure)
- [⚙️ Quick Start & Local Setup](#️-quick-start--local-setup)
  - [Prerequisites](#prerequisites)
  - [Installation Steps](#installation-steps)
  - [Running the Dual Dev Server](#running-the-dual-dev-server)
- [🔐 Environment Configuration Matrix](#-environment-configuration-matrix)
- [🐳 Docker Deployment](#-docker-deployment)
- [📜 Available Scripts](#-available-scripts)

---

## 🌟 Key Features & Capabilities

### 1. Block Editor & Dynamic Canvas
- **Rich Block Ecosystem ([components/dashboard/editor/BlockRenderer.tsx](file:///d:/notion/components/dashboard/editor/BlockRenderer.tsx))**: Supports Text, Headings (`H1`, `H2`, `H3`), Checklists, Bulleted/Numbered Lists, Callouts, Toggle Blocks, Blockquotes, Dividers, Tables, Web Bookmarks, File Uploads, Kanban Databases, Code Blocks, and AI Meeting Notes.
- **Unsplash Cover Banner & Icon Engine ([components/dashboard/editor/PageCoverBanner.tsx](file:///d:/notion/components/dashboard/editor/PageCoverBanner.tsx))**: Full-width page headers with direct Unsplash photo search ([app/api/unsplash/route.ts](file:///d:/notion/app/api/unsplash/route.ts)), gradient presets, custom image uploads, and emoji icon pickers.
- **Debounced Auto-Save Engine ([hooks/use-autosave.ts](file:///d:/notion/hooks/use-autosave.ts))**: Asynchronous saving with real-time feedback status indicators (`Saving...`, `Saved`).
- **Floating Formatting Toolbar ([components/dashboard/editor/Toolbar.tsx](file:///d:/notion/components/dashboard/editor/Toolbar.tsx))**: Text formatting for bold, italic, underline, strikethrough, inline code, background highlights, and text color palettes.

### 2. Multi-View Database Boards
- **Dynamic View Switcher ([components/dashboard/editor/DatabaseBlock.tsx](file:///d:/notion/components/dashboard/editor/DatabaseBlock.tsx))**: Seamlessly toggle database data between three distinct visual layouts:
  - **Kanban Board ([components/dashboard/editor/KanbanBoard.tsx](file:///d:/notion/components/dashboard/editor/KanbanBoard.tsx))**: Drag-and-drop task columns (`To Do`, `In Progress`, `Done`), customizable colored status tags, card priority badges, and quick-add cards.
  - **Timeline / Gantt Chart ([components/dashboard/editor/TimelineView.tsx](file:///d:/notion/components/dashboard/editor/TimelineView.tsx))**: Visual Gantt timeline displaying task spans, progress durations, and date intervals across calendar dates.
  - **Data Table View ([components/dashboard/editor/TableView.tsx](file:///d:/notion/components/dashboard/editor/TableView.tsx))**: Grid view supporting inline cell editing, multi-type column schemas, status selectors, and row operations.

### 3. In-Browser Code Runner Sandbox Engine
- **Client-Side Polyglot Execution ([lib/code-runner.ts](file:///d:/notion/lib/code-runner.ts))**:
  - **JavaScript Sandbox**: Sandboxed `Function` evaluation engine with intercepted `console.log` streams.
  - **Python Sandbox**: Full Pyodide WebAssembly (WASM) execution environment running authentic Python code directly inside the browser.
- **Interactive Console Panel ([components/dashboard/editor/CodeBlock.tsx](file:///d:/notion/components/dashboard/editor/CodeBlock.tsx))**: Output drawer displaying execution runtimes (ms), standard output streams, and error tracebacks.
- **Syntax Highlighting**: Supports 70+ programming languages with Atom One Dark theme powered by `react-syntax-highlighter`.

### 4. Vector RAG AI Assistant & Voice Meeting Transcriber
- **6-Stage LangChain + FastAPI Vector RAG Pipeline ([rag_service/main.py](file:///d:/notion/rag_service/main.py))**:
  1. Document ingestion and normalization across workspace pages.
  2. `RecursiveCharacterTextSplitter` chunking.
  3. `SentenceTransformerEmbeddings` (`all-MiniLM-L6-v2`) vectorization.
  4. Local `ChromaDB` vector storage.
  5. Cosine similarity context retrieval.
  6. Google Gemini 1.5 Flash LLM response generation with exact workspace page citations.
- **Executive Slash Commands**:
  - `/summary` — Extracts high-level workspace summaries, core takeaways, and action items.
  - `/search <query>` — Performs live web search via LangChain `DuckDuckGoSearchRun`.
- **AI Copilot Side Panel ([components/dashboard/notion-ai-panel.tsx](file:///d:/notion/components/dashboard/notion-ai-panel.tsx))**: Collapsible intelligent assistant drawer with suggested prompt chips and clickable source citations.
- **🎙️ Live Voice Recording & AI Meeting Notes ([components/dashboard/editor/MeetingNoteView.tsx](file:///d:/notion/components/dashboard/editor/MeetingNoteView.tsx))**: Integrated speech-to-text audio recording using the browser Web Speech API paired with an animated WebGL audio waveform visualizer ([components/dashboard/Strands.tsx](file:///d:/notion/components/dashboard/Strands.tsx)).

### 5. Real-Time Multi-Cursor Collaboration & Presence
- **Remote Cursor Flags ([components/dashboard/editor/RemoteCursorOverlay.tsx](file:///d:/notion/components/dashboard/editor/RemoteCursorOverlay.tsx))**: Broadcasts collaborator mouse movements with user name tags and distinct color highlights across active documents.
- **Live Presence Bar ([components/dashboard/editor/LivePresenceBar.tsx](file:///d:/notion/components/dashboard/editor/LivePresenceBar.tsx))**: Real-time collaborator avatars with online status pulse badges.

### 6. Version History & Visual Diff Comparison
- **Visual Revision Comparator ([components/dashboard/modals/version-diff-modal.tsx](file:///d:/notion/components/dashboard/modals/version-diff-modal.tsx))**: Compare historical snapshots against current document states.
- **Unified & Side-by-Side Diffs**: Highlights line and block insertions (green) and deletions (red).
- **One-Click Snapshot Rollback**: Revert any previous document version directly back to the live editor canvas.

### 7. Notion Calendar Workspace
- **Dedicated Calendar View ([app/dashboard/calendar/page.tsx](file:///d:/notion/app/dashboard/calendar/page.tsx) & [components/dashboard/notion-calendar.tsx](file:///d:/notion/components/dashboard/notion-calendar.tsx))**: Full-featured calendar workspace with **Month**, **Week**, **Day**, and **Agenda** views.
- **Event Management Lifecycle**: Create, edit, reschedule, tag, and assign color-coded metadata to workspace deadlines and meetings.

### 8. Recursive Hierarchical Sub-Pages
- **Infinite Nesting Tree ([components/dashboard/sidebar.tsx](file:///d:/notion/components/dashboard/sidebar.tsx))**: Create nested `/page` blocks to construct deep multi-level workspaces (`Parent → Child → Grandchild`).
- **Circular Reference Protection ([app/api/pages/[id]/route.ts](file:///d:/notion/app/api/pages/[id]/route.ts))**: Graph validation prevents infinite parent-child loop assignments.

### 9. OpenGraph Web Bookmarks & Media Uploader
- **OpenGraph Metadata Scraper ([app/api/scrape-og/route.ts](file:///d:/notion/app/api/scrape-og/route.ts))**: Automatically extracts page titles, descriptions, banner previews, and favicons from pasted URLs.
- **Rich Bookmark Cards ([components/dashboard/editor/WebBookmarkBlock.tsx](file:///d:/notion/components/dashboard/editor/WebBookmarkBlock.tsx))**: Clean, interactive bookmark preview cards.
- **File Upload & Storage ([app/api/upload/route.ts](file:///d:/notion/app/api/upload/route.ts) & [components/dashboard/editor/FileUploadBlock.tsx](file:///d:/notion/components/dashboard/editor/FileUploadBlock.tsx))**: Direct file attachments with size formatting and download handlers.

### 10. Global Spotlight Command Palette
- **Universal Quick-Access ([components/dashboard/command-palette.tsx](file:///d:/notion/components/dashboard/command-palette.tsx))**: Triggered with `Cmd + K` or `Ctrl + K`.
- **Fuzzy Search & Actions**: Search document contents, jump to recent pages, trigger theme toggling, open modals, or invoke Notion AI commands.

### 11. Multi-Region Billing & Subscriptions
- **Dual Payment Gateways ([app/api/stripe/checkout/route.ts](file:///d:/notion/app/api/stripe/checkout/route.ts) & [app/api/razorpay/order/route.ts](file:///d:/notion/app/api/razorpay/order/route.ts))**:
  - **Stripe**: International & US subscriptions (USD / Global currencies).
  - **Razorpay**: Domestic Indian payment methods (UPI, NetBanking, Cards in INR).
- **Checkout & Pricing Modal ([components/dashboard/pricing-modal.tsx](file:///d:/notion/components/dashboard/pricing-modal.tsx) & [components/dashboard/modals/checkout-modal.tsx](file:///d:/notion/components/dashboard/modals/checkout-modal.tsx))**: Transparent regional fee breakdowns, upgrade tiers (`Free`, `Pro`, `Ultimate`), and webhook reconciliation.

---

## 🏗️ System Architecture & Tech Stack

```mermaid
graph TD
    Client["Browser / Client (Next.js 16 App Router + React 19)"]
    
    subgraph Frontend["Frontend Layer"]
        Editor["Block Canvas & Editor"]
        Sandbox["Pyodide WASM & JS Sandbox"]
        Views["Kanban / Timeline / Table"]
        Calendar["Notion Calendar"]
        Audio["Web Speech API & WebGL Visualizer"]
    end

    subgraph Backend["Next.js 16 API Layer"]
        AuthAPI["NextAuth (OAuth + Credentials)"]
        PagesAPI["Pages CRUD & Versioning Engine"]
        UploadAPI["Local File Storage Engine"]
        ScrapeAPI["OpenGraph Scraper"]
        PayAPI["Stripe & Razorpay Gateways"]
    end

    subgraph RAGService["Python FastAPI RAG Microservice (:8000)"]
        FastAPI["FastAPI App (rag_service/main.py)"]
        Chroma["ChromaDB Vector Store"]
        Embeddings["all-MiniLM-L6-v2 Embeddings"]
        Gemini["Google Gemini 1.5 Flash LLM"]
        WebSearch["DuckDuckGo Search Tool"]
    end

    subgraph Database["Data Layer"]
        MongoDB[("MongoDB Database")]
    end

    Client --> Frontend
    Frontend --> Backend
    Backend --> MongoDB
    Frontend -.->|Direct or Proxy AI Queries| RAGService
    RAGService --> Chroma
    RAGService --> Gemini
    RAGService --> WebSearch
```

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2.11 (App Router) | Server and Client components with React 19 |
| **Styling** | Tailwind CSS v4 + tw-animate-css | Modern responsive styling with dark/light themes |
| **Database & ODM** | MongoDB + Mongoose 9.x | Document-oriented persistence with schema validation |
| **Authentication** | NextAuth.js v4 | Credentials auth + Google, GitHub, Apple, Facebook OAuth |
| **RAG AI Service** | Python FastAPI + LangChain + ChromaDB | Vector search and LLM synthesis with Google Gemini |
| **Code Execution** | Pyodide (WASM) + Sandboxed Eval | In-browser isolated execution for Python and JavaScript |
| **Payments** | Stripe Node SDK + Razorpay API | Global multi-currency subscription and checkout engine |
| **Graphics & Audio** | OGL (WebGL) + Web Speech API | 3D audio waveform canvas and speech transcription |
| **Notifications** | Sonner | Modern toast notification manager |

---

## 📁 Project Directory Structure

```text
notion/
├── app/                              # Next.js App Router root
│   ├── (auth)/                       # Authentication routes (login, register, forgot-password)
│   ├── (marketing)/                  # Marketing landing & promotional pages
│   ├── api/                          # Next.js Serverless API endpoints
│   │   ├── ai/                       # AI fallback and generation endpoints
│   │   ├── auth/                     # NextAuth authentication handlers
│   │   ├── notifications/            # User notification endpoints
│   │   ├── pages/                    # Page CRUD, sub-pages, versions & comments
│   │   ├── razorpay/                 # Razorpay order generation & webhook handlers
│   │   ├── scrape-og/                # OpenGraph link preview metadata scraper
│   │   ├── stripe/                   # Stripe checkout session & webhook handlers
│   │   ├── unsplash/                 # Unsplash image search & preset gateway
│   │   ├── upload/                   # Local file upload & retrieval endpoints
│   │   └── user/                     # User profile and preference handlers
│   ├── checkout/                     # Subscription checkout checkout page
│   ├── dashboard/                    # Main app workspace & dynamic page routes
│   │   ├── [pageId]/                 # Dynamic Notion page document canvas
│   │   └── calendar/                 # Notion Calendar workspace page
│   ├── globals.css                   # Tailwind CSS v4 tokens and theme variables
│   └── layout.tsx                    # Root layout with ThemeProvider and Sonner
├── components/                       # Reusable React components
│   ├── auth/                         # Login and registration form cards
│   ├── dashboard/                    # Workspace interface components
│   │   ├── editor/                   # Block editor, Kanban, Timeline, Table, CodeBlock, etc.
│   │   ├── modals/                   # Diff viewer, settings, share, trash, AI chat, checkout
│   │   ├── command-palette.tsx       # Global Cmd+K spotlight search overlay
│   │   ├── notion-ai-panel.tsx       # RAG AI assistant drawer
│   │   ├── notion-calendar.tsx       # Interactive multi-view calendar
│   │   ├── pricing-modal.tsx         # Multi-region pricing and upgrade dialog
│   │   ├── sidebar.tsx               # Recursive navigation tree sidebar
│   │   └── top-bar.tsx               # Document breadcrumbs, presence, and action bar
│   └── ui/                           # Base UI atomic components (buttons, dialogs, dropdowns)
├── hooks/                            # Custom React hooks (use-autosave, use-media-query, etc.)
├── lib/                              # Shared utility libraries, DB connection, code runner
├── rag_service/                      # Python FastAPI LangChain Vector RAG service
│   ├── chroma_db/                    # ChromaDB vector index directory
│   ├── main.py                       # FastAPI application & RAG query pipelines
│   └── requirements.txt              # Python dependencies
├── public/                           # Static assets and uploads
├── scripts/                          # Orchestration and database testing scripts
│   ├── dev.mjs                       # Unified Next.js + Python RAG dev process runner
│   └── test-db.mjs                   # MongoDB connection diagnostic script
├── Dockerfile                        # Multi-stage production container build
├── package.json                      # Node.js project manifest and scripts
└── tsconfig.json                     # TypeScript compiler configuration
```

---

## ⚙️ Quick Start & Local Setup

### Prerequisites

Ensure the following runtimes are installed on your machine:
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Python**: `v3.10+` (optional, for the FastAPI Vector RAG service)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster connection string

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/notion.git
   cd notion
   ```

2. **Install Node.js Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and configure your keys:
   ```bash
   cp .env.example .env
   ```

4. **(Optional) Setup Python RAG Service Virtual Environment**:
   ```bash
   cd rag_service
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   cd ..
   ```

### Running the Dual Dev Server

The workspace includes a unified development orchestrator ([scripts/dev.mjs](file:///d:/notion/scripts/dev.mjs)) that starts both the Next.js development server and the Python FastAPI RAG microservice concurrently:

```bash
npm run dev
```

- **Next.js App**: `http://localhost:3000`
- **FastAPI RAG Docs**: `http://localhost:8000/docs`

> [!NOTE]
> If Python or the RAG service dependencies are not installed, the Next.js frontend will still start normally and utilize internal AI fallback routes.

---

## 🔐 Environment Configuration Matrix

Refer to [.env.example](file:///d:/notion/.env.example) for a full template. Key variables include:

| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `NEXTAUTH_URL` | **Yes** | Canonical root URL for authentication callbacks | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | **Yes** | Encryption secret for NextAuth session JWTs | `generate-with-openssl-rand-hex-32` |
| `MONGODB_URI` | **Yes** | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/notion_dev` |
| `STRIPE_API_KEY` | Optional | Stripe secret key for US / Global billing | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signature verification secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | Optional | Stripe price ID for Pro tier | `price_...` |
| `NEXT_PUBLIC_STRIPE_ULTIMATE_PRICE_ID` | Optional | Stripe price ID for Ultimate tier | `price_...` |
| `RAZORPAY_KEY_ID` | Optional | Razorpay key ID for India regional billing | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret key | `replace_with_secret` |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Razorpay webhook verification signature | `replace_with_secret` |
| `GOOGLE_ID` / `GOOGLE_SECRET` | Optional | Google OAuth provider credentials | `your-google-oauth-client-id` |
| `GITHUB_ID` / `GITHUB_SECRET` | Optional | GitHub OAuth provider credentials | `your-github-oauth-client-id` |
| `UPSTASH_REDIS_REST_URL` | Optional | Redis REST endpoint for rate limiting | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Redis REST authentication token | `replace_with_token` |

---

## 🐳 Docker Deployment

A multi-stage [Dockerfile](file:///d:/notion/Dockerfile) is provided for optimized production containerization.

### 1. Build the Docker Image
```bash
docker build -t notion-workspace:latest .
```

### 2. Run the Container
```bash
docker run -p 3000:3000 \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="your-production-secret" \
  -e MONGODB_URI="your-mongodb-uri" \
  notion-workspace:latest
```

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the orchestrator launching both Next.js (:3000) & Python FastAPI RAG (:8000) |
| `npm run build` | Compiles and builds the production Next.js standalone distribution bundle |
| `npm run start` | Boots the built Next.js production server |
| `npm run lint` | Executes ESLint 9 checks across the codebase |
| `npx tsc --noEmit` | Performs TypeScript type-checking validation |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
