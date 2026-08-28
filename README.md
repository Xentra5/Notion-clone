# Notion Workspace & Modern SaaS Platform 🚀

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.11-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Dual-Tier Cache](https://img.shields.io/badge/Cache-Dual--Tier_L1+L2_Redis-DC382D?style=flat-square&logo=redis)](https://upstash.com/)
[![Materialized Path](https://img.shields.io/badge/Tree-Materialized_Path_O(1)-6C5CE7?style=flat-square)](https://www.mongodb.com/)
[![FastAPI](https://img.shields.io/badge/RAG_Service-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/AI-LangChain-1C3C3C?style=flat-square)](https://www.langchain.com/)
[![Python WASM](https://img.shields.io/badge/Sandbox-Pyodide_WASM-3776AB?style=flat-square&logo=python)](https://pyodide.org/)
[![IndexedDB Local First](https://img.shields.io/badge/Storage-Local--First_SWR-orange?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions)](https://github.com/Xentra5/Notion/actions)

An enterprise-grade, high-performance collaborative workspace application built with **Next.js 16 (App Router)** and **MongoDB**. Faithfully engineered to deliver the full Notion experience with real-time block editing, local-first 0ms persistence, dual-tier distributed caching (L1 RAM + L2 Redis), $O(1)$ materialized path tree hierarchy, asynchronous debounced RAG vector indexing, in-browser polyglot code execution, database multi-views (Kanban, Timeline, Table), AI vector RAG assistance, voice-to-text meeting summaries with WebGL waveform visualizers, version diff rollback, document import/export, geo-redundant database failover, multi-region billing (Stripe & Razorpay), and collaborative multi-cursor presence.

---

## 📑 Table of Contents

- [🌟 Key Features & Capabilities](#-key-features--capabilities)
  - [1. Block Editor & Dynamic Canvas](#1-block-editor--dynamic-canvas)
  - [2. Local-First 0ms Architecture & Multi-Tab Sync](#2-local-first-0ms-architecture--multi-tab-sync)
  - [3. Dual-Tier Distributed Cache Engine (L1 Memory + L2 Redis)](#3-dual-tier-distributed-cache-engine-l1-memory--l2-redis)
  - [4. Materialized Path Tree Hierarchy ($O(1)$ Subtree Operations)](#4-materialized-path-tree-hierarchy-o1-subtree-operations)
  - [5. Async Debounced RAG Queue & Voice Transcriber](#5-async-debounced-rag-queue--voice-transcriber)
  - [6. Multi-View Database Boards](#6-multi-view-database-boards)
  - [7. In-Browser Polyglot Code Runner Sandbox](#7-in-browser-polyglot-code-runner-sandbox)
  - [8. Real-Time Multi-Cursor Collaboration & Inline Comments](#8-real-time-multi-cursor-collaboration--inline-comments)
  - [9. Version History, Revisions & Visual Diff Rollback](#9-version-history-revisions--visual-diff-rollback)
  - [10. Notion Calendar Workspace](#10-notion-calendar-workspace)
  - [11. Document Export & Import Engine](#11-document-export--import-engine)
  - [12. Trash Management & Safety Controls](#12-trash-management--safety-controls)
  - [13. OpenGraph Web Bookmarks & Media Uploader](#13-opengraph-web-bookmarks--media-uploader)
  - [14. Global Spotlight Command Palette](#14-global-spotlight-command-palette)
  - [15. Multi-Region Billing & Subscriptions](#15-multi-region-billing--subscriptions)
  - [16. Geo-Redundant High Availability Database Failover](#16-geo-redundant-high-availability-database-failover)
  - [17. Marketing & Landing Page Suite](#17-marketing--landing-page-suite)
- [🏗️ System Architecture & Tech Stack](#️-system-architecture--tech-stack)
- [🔌 API Routes & Services Reference](#-api-routes--services-reference)
- [📁 Project Directory Structure](#-project-directory-structure)
- [⚙️ Quick Start & Local Setup](#️-quick-start--local-setup)
  - [Prerequisites](#prerequisites)
  - [Installation Steps](#installation-steps)
  - [Running the Dual Dev Server](#running-the-dual-dev-server)
  - [Database Ancestors Migration](#database-ancestors-migration)
- [🔐 Environment Configuration Matrix](#-environment-configuration-matrix)
- [🐳 Docker Deployment](#-docker-deployment)
- [🔄 CI/CD Automation Pipeline](#-cicd-automation-pipeline)
- [📜 Available Scripts](#-available-scripts)
- [📄 License](#-license)

---

## 🌟 Key Features & Capabilities

### 1. Block Editor & Dynamic Canvas
- **Rich Block Ecosystem ([components/dashboard/editor/BlockRenderer.tsx](file:///d:/notion/components/dashboard/editor/BlockRenderer.tsx))**: Supports Text, Headings (`H1`, `H2`, `H3`), Checklists, Bulleted/Numbered Lists, Callouts with custom icons, Collapsible Toggle Blocks, Blockquotes, Dividers, Data Tables, Web Bookmarks, File Attachments, Multi-View Databases, Polyglot Code Blocks, and AI Meeting Notes.
- **Unsplash Cover Banner & Icon Engine ([components/dashboard/editor/PageCoverBanner.tsx](file:///d:/notion/components/dashboard/editor/PageCoverBanner.tsx))**: Full-width page headers with direct Unsplash photo search ([app/api/unsplash/route.ts](file:///d:/notion/app/api/unsplash/route.ts)), curated gradient presets, custom image upload handlers, and an interactive emoji picker ([components/dashboard/editor/EmojiPicker.tsx](file:///d:/notion/components/dashboard/editor/EmojiPicker.tsx)).
- **Debounced Auto-Save Engine ([hooks/use-autosave.ts](file:///d:/notion/hooks/use-autosave.ts))**: Intelligent debounce queue saving changes seamlessly with visual status indicators (`Saving...`, `Saved`, `Error`).
- **Floating Formatting Toolbar ([components/dashboard/editor/Toolbar.tsx](file:///d:/notion/components/dashboard/editor/Toolbar.tsx))**: Contextual text formatting with bold, italic, underline, strikethrough, inline code, background highlights, and text color palettes.

### 2. Local-First 0ms Architecture & Multi-Tab Sync
- **Client-Side IndexedDB Engine ([lib/storage/local-store.ts](file:///d:/notion/lib/storage/local-store.ts))**: Instantaneous 0ms page load and workspace navigation powered by IndexedDB document caching.
- **Stale-While-Revalidate (SWR) & Optimistic Mutations ([lib/actions/pages.ts](file:///d:/notion/lib/actions/pages.ts))**: Instant UI updates with background network reconciliation, request deduplication, and memory caching.
- **Multi-Tab Sync ([lib/storage/local-store.ts](file:///d:/notion/lib/storage/local-store.ts))**: `BroadcastChannel` synchronization instantly mirrors edits and updates across open browser tabs without refreshing.
- **Durable Offline Mutation Queue**: Actions performed while offline are queued in IndexedDB with persistent retry counters and auto-flushed with exponential backoff once connectivity is restored.
- **Self-Write Isolation (`fromSameTab`)**: Intelligent event tagging isolates local editor autosaves from cross-tab events, preventing feedback loops during AI insertions.

### 3. Dual-Tier Distributed Cache Engine (L1 Memory + L2 Redis)
- **3-Tier Hierarchy ([lib/cache.ts](file:///d:/notion/lib/cache.ts))**:
  - **L1 In-Memory Cache (<0.1ms)**: Ultra-fast process RAM cache with automatic LRU eviction and background TTL sweeping.
  - **L2 Distributed Redis (~8ms)**: Connects to shared Upstash Redis over REST API with zero extra native dependencies, providing unified state across all serverless lambda instances.
  - **MongoDB (~60ms)**: Permanent disk vault queried only on L1/L2 cache misses.
- **Write-Through & Dual Invalidation**: Updates instantly clear local RAM and invalidate distributed Redis keys, ensuring no serverless instance serves stale data.
- **Zero-Config Fallback**: Automatically and gracefully runs in pure L1 RAM mode if Redis environment variables are absent.

### 4. Materialized Path Tree Hierarchy ($O(1)$ Subtree Operations)
- **Ancestors Array Schema ([lib/models/page.ts](file:///d:/notion/lib/models/page.ts))**: Every page stores its complete ancestor hierarchy (`ancestors: ["rootId", "folderId"]`) with a compound index `{ ancestors: 1, userId: 1 }`.
- **$O(1)$ Subtree Operations ([app/api/pages/[id]/route.ts](file:///d:/notion/app/api/pages/%5Bid%5D/route.ts))**: Deleting or soft-trashing a parent folder with dozens of nested sub-pages executes in a **single indexed query** (`Page.find({ ancestors: pageId })`), eliminating $N+1$ recursive round-trips.
- **Atomic Cascade Reparenting**: Moving a page to a new parent automatically cascades new ancestor chains to all descendants in a single atomic `bulkWrite`.
- **One-Time Migration Script ([scripts/backfill-ancestors.mts](file:///d:/notion/scripts/backfill-ancestors.mts))**: Backfills materialized paths for existing documents in batches of 200.

### 5. Async Debounced RAG Queue & Voice Transcriber
- **Asynchronous Debounced Queue ([lib/rag-queue.ts](file:///d:/notion/lib/rag-queue.ts))**:
  - **2.5s Edit Debouncer**: Collapses rapid keystrokes/autosaves into a single embedding request once typing pauses, cutting 80%+ of embedding API overhead.
  - **Concurrency Throttling & Mutex Protection**: Prevents overwhelming ChromaDB/SQLite with parallel embedding locks.
  - **Exponential Backoff Retries**: Automatically retries failed indexing calls (2s, 4s, 8s) if the RAG microservice is busy or restarting.
  - **Delete Cancellation**: Deleting a page instantly cancels any pending index debounces and queues a clean batch vector deletion.
- **6-Stage LangChain + FastAPI Vector RAG Pipeline ([rag_service/main.py](file:///d:/notion/rag_service/main.py))**: Ingestion → `RecursiveCharacterTextSplitter` chunking → `SentenceTransformerEmbeddings` (`all-MiniLM-L6-v2`) → `ChromaDB` storage → Cosine similarity retrieval → Google Gemini 1.5 Flash synthesis with exact page citations.
- **🎙️ Live Voice Recording & AI Meeting Notes ([components/dashboard/editor/MeetingNoteView.tsx](file:///d:/notion/components/dashboard/editor/MeetingNoteView.tsx))**: Speech-to-text audio recording using the browser Web Speech API paired with an animated WebGL audio waveform visualizer ([components/dashboard/Strands.tsx](file:///d:/notion/components/dashboard/Strands.tsx)).

### 6. Multi-View Database Boards
- **Dynamic View Switcher ([components/dashboard/editor/DatabaseBlock.tsx](file:///d:/notion/components/dashboard/editor/DatabaseBlock.tsx))**: Switch seamlessly between three distinct visual database layouts:
  - **Kanban Board ([components/dashboard/editor/KanbanBoard.tsx](file:///d:/notion/components/dashboard/editor/KanbanBoard.tsx))**: Drag-and-drop task columns (`To Do`, `In Progress`, `Done`), customizable colored status tags, card priority badges, and quick-add task cards.
  - **Timeline / Gantt Chart ([components/dashboard/editor/TimelineView.tsx](file:///d:/notion/components/dashboard/editor/TimelineView.tsx))**: Visual Gantt timeline displaying task spans, progress durations, and date intervals across calendar dates.
  - **Data Table View ([components/dashboard/editor/TableView.tsx](file:///d:/notion/components/dashboard/editor/TableView.tsx))**: Grid view supporting inline cell editing, multi-type column schemas, status selectors, and row operations.

### 7. In-Browser Polyglot Code Runner Sandbox
- **Client-Side Polyglot Execution ([lib/code-runner.ts](file:///d:/notion/lib/code-runner.ts))**:
  - **JavaScript Sandbox**: Sandboxed `Function` evaluation engine with intercepted `console.log` and standard output streams.
  - **Python Sandbox**: Full Pyodide WebAssembly (WASM) execution environment running authentic Python code directly inside the browser.
- **Interactive Console Panel ([components/dashboard/editor/CodeBlock.tsx](file:///d:/notion/components/dashboard/editor/CodeBlock.tsx))**: Output drawer displaying execution runtimes (ms), standard output streams, and detailed error tracebacks.
- **Syntax Highlighting**: Supports 70+ programming languages with Atom One Dark theme powered by `react-syntax-highlighter`.

### 8. Real-Time Multi-Cursor Collaboration & Inline Comments
- **Remote Cursor Flags ([components/dashboard/editor/RemoteCursorOverlay.tsx](file:///d:/notion/components/dashboard/editor/RemoteCursorOverlay.tsx))**: Broadcasts collaborator mouse movements with user name tags and distinct color highlights across active documents.
- **Live Presence Bar ([components/dashboard/editor/LivePresenceBar.tsx](file:///d:/notion/components/dashboard/editor/LivePresenceBar.tsx))**: Real-time collaborator avatars with online status pulse badges.
- **Inline Comment Threads ([components/dashboard/editor/CommentsPanel.tsx](file:///d:/notion/components/dashboard/editor/CommentsPanel.tsx))**: Threaded discussions directly on workspace pages with user attribution and timestamps.

### 9. Version History, Revisions & Visual Diff Rollback
- **Visual Revision Comparator ([components/dashboard/modals/version-diff-modal.tsx](file:///d:/notion/components/dashboard/modals/version-diff-modal.tsx) & [components/dashboard/modals/history-modal.tsx](file:///d:/notion/components/dashboard/modals/history-modal.tsx))**: Compare historical snapshots against current document states.
- **Unified & Side-by-Side Diffs**: Highlights line and block insertions (green) and deletions (red).
- **One-Click Snapshot Rollback ([app/api/pages/[id]/revisions/route.ts](file:///d:/notion/app/api/pages/[id]/revisions/route.ts))**: Revert any previous document version directly back to the live editor canvas.

### 10. Notion Calendar Workspace
- **Dedicated Calendar View ([app/dashboard/calendar/page.tsx](file:///d:/notion/app/dashboard/calendar/page.tsx) & [components/dashboard/notion-calendar.tsx](file:///d:/notion/components/dashboard/notion-calendar.tsx))**: Full-featured calendar workspace with **Month**, **Week**, **Day**, and **Agenda** views.
- **Event Management Lifecycle ([app/api/calendar/route.ts](file:///d:/notion/app/api/calendar/route.ts))**: Create, edit, reschedule, tag, and assign color-coded metadata to workspace deadlines and meetings.

### 11. Document Export & Import Engine
- **Export Formats ([lib/export-import.ts](file:///d:/notion/lib/export-import.ts))**: Export workspace pages to formatted **Markdown (`.md`)** or structured **JSON schema**.
- **Import Modal ([components/dashboard/modals/import-modal.tsx](file:///d:/notion/components/dashboard/modals/import-modal.tsx))**: Seamlessly import external Markdown or JSON files to generate ready-to-edit Notion pages via Markdown block parsing ([lib/markdown-blocks.ts](file:///d:/notion/lib/markdown-blocks.ts)).

### 12. Trash Management & Safety Controls
- **Soft Deletion & Recovery ([components/dashboard/modals/trash-modal.tsx](file:///d:/notion/components/dashboard/modals/trash-modal.tsx))**: Move pages to trash with one-click restore ([app/api/pages/[id]/restore/route.ts](file:///d:/notion/app/api/pages/[id]/restore/route.ts)) or permanent wipe ([app/api/pages/trash/route.ts](file:///d:/notion/app/api/pages/trash/route.ts)).
- **Dynamic Renaming & Confirm Modals ([components/ui/rename-modal.tsx](file:///d:/notion/components/ui/rename-modal.tsx) & [components/ui/confirm-modal.tsx](file:///d:/notion/components/ui/confirm-modal.tsx))**: Safe modal dialogues for destructive operations and quick page title updates.

### 13. OpenGraph Web Bookmarks & Media Uploader
- **OpenGraph Metadata Scraper ([app/api/scrape-og/route.ts](file:///d:/notion/app/api/scrape-og/route.ts))**: Automatically extracts page titles, descriptions, banner previews, and favicons from pasted URLs.
- **Rich Bookmark Cards ([components/dashboard/editor/WebBookmarkBlock.tsx](file:///d:/notion/components/dashboard/editor/WebBookmarkBlock.tsx))**: Clean, interactive bookmark preview cards.
- **File Upload & Storage ([app/api/upload/route.ts](file:///d:/notion/app/api/upload/route.ts) & [components/dashboard/editor/FileUploadBlock.tsx](file:///d:/notion/components/dashboard/editor/FileUploadBlock.tsx))**: Direct file attachments with size formatting and download handlers.

### 14. Global Spotlight Command Palette
- **Universal Quick-Access ([components/dashboard/command-palette.tsx](file:///d:/notion/components/dashboard/command-palette.tsx))**: Triggered with `Cmd + K` or `Ctrl + K`.
- **Fuzzy Search & Actions**: Search document contents, jump to recent pages, trigger theme toggling, open modals, or invoke Notion AI commands.

### 15. Multi-Region Billing & Subscriptions
- **Dual Payment Gateways ([app/api/stripe/checkout/route.ts](file:///d:/notion/app/api/stripe/checkout/route.ts) & [app/api/razorpay/order/route.ts](file:///d:/notion/app/api/razorpay/order/route.ts))**:
  - **Stripe**: International & US subscriptions (USD / Global currencies).
  - **Razorpay**: Domestic Indian payment methods (UPI, NetBanking, Cards in INR).
- **Checkout & Pricing Modal ([components/dashboard/pricing-modal.tsx](file:///d:/notion/components/dashboard/pricing-modal.tsx) & [components/dashboard/modals/checkout-modal.tsx](file:///d:/notion/components/dashboard/modals/checkout-modal.tsx))**: Transparent regional fee breakdowns, upgrade tiers (`Free`, `Pro`, `Ultimate`), and webhook reconciliation.

### 16. Geo-Redundant High Availability Database Failover
- **Active-Passive Primary & Backup Architecture ([lib/mongodb.ts](file:///d:/notion/lib/mongodb.ts))**: Automatic failover to secondary backup cluster (`MONGODB_BACKUP_URI`) if primary cluster drops connection.
- **Background Health Monitor & Status Endpoint ([lib/db-health.ts](file:///d:/notion/lib/db-health.ts) & [app/api/health/db/route.ts](file:///d:/notion/app/api/health/db/route.ts))**: Continuous latency pinging and cluster health monitoring for external uptime alerts.

### 17. Marketing & Landing Page Suite
- **Complete SaaS Showcase ([app/(marketing)/](file:///d:/notion/app/(marketing)/))**: High-conversion landing page with interactive hero sections, dynamic infinite Logo Loop carousel with physics-based drag interactions ([components/ui/logo-loop.tsx](file:///d:/notion/components/ui/logo-loop.tsx)), Solutions, Developers, Enterprise, Pricing, Product, Resources, and Request Demo pages.

---

## 🏗️ System Architecture & Tech Stack

```mermaid
graph TD
    Client["Browser / Client (Next.js 16 App Router + React 19)"]
    
    subgraph Frontend["Frontend Layer (Local-First 0ms)"]
        Editor["Block Canvas & Editor"]
        LocalStore["Local-First IndexedDB Engine"]
        Broadcast["BroadcastChannel Multi-Tab Sync"]
        Sandbox["Pyodide WASM & JS Sandbox"]
        Views["Kanban / Timeline / Table"]
        Calendar["Notion Calendar"]
        Audio["Web Speech API & WebGL Visualizer"]
        Presence["Multi-Cursor Presence Overlay"]
    end

    subgraph Backend["Next.js 16 API Layer"]
        AuthAPI["NextAuth (OAuth + Credentials)"]
        PagesAPI["Pages CRUD, Revisions & Comments"]
        UploadAPI["Local File Storage Engine"]
        ScrapeAPI["OpenGraph Scraper"]
        PayAPI["Stripe & Razorpay Gateways"]
        HealthAPI["DB Health & Failover Monitor"]
    end

    subgraph Caching["Dual-Tier Cache Engine (lib/cache.ts)"]
        L1Cache["L1 Memory LRU Cache (<0.1ms)"]
        L2Cache["L2 Distributed Redis / Upstash (~8ms)"]
    end

    subgraph BackgroundQueue["Async Background Workers"]
        RAGQueue["Async Debounced RAG Queue (lib/rag-queue.ts)"]
    end

    subgraph RAGService["Python FastAPI RAG Microservice (:8000)"]
        FastAPI["FastAPI App (rag_service/main.py)"]
        Chroma["ChromaDB Vector Store"]
        Embeddings["all-MiniLM-L6-v2 Embeddings"]
        Gemini["Google Gemini 1.5 Flash LLM"]
        WebSearch["DuckDuckGo Search Tool"]
    end

    subgraph Database["Data Layer (Materialized Path Hierarchy)"]
        PrimaryMongo[("Primary MongoDB (ancestors: [String])")]
        BackupMongo[("Secondary Backup MongoDB Cluster")]
    end

    Client --> Frontend
    Frontend --> LocalStore
    Frontend --> Broadcast
    Frontend --> Backend
    Backend --> L1Cache
    L1Cache -.->|Miss| L2Cache
    L2Cache -.->|Miss| PrimaryMongo
    Backend --> RAGQueue
    RAGQueue --> FastAPI
    Backend -.->|Auto-Failover| BackupMongo
    FastAPI --> Chroma
    FastAPI --> Gemini
    FastAPI --> WebSearch
```

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2.11 (App Router) | Server and Client components with React 19 |
| **Styling** | Tailwind CSS v4 + tw-animate-css | Modern responsive styling with dark/light themes |
| **Database & ODM** | MongoDB + Mongoose 9.x | Materialized path hierarchy with active-backup failover |
| **Tree Architecture** | Materialized Path (`ancestors: []`) | $O(1)$ single-query subtree lookups & cascade delete |
| **Local Persistence** | IndexedDB + HTML5 BroadcastChannel | 0ms instant loading, multi-tab sync, and offline mutation queue |
| **Caching Tier** | Dual-Tier (L1 RAM + L2 Upstash Redis) | Sub-millisecond local RAM + distributed Redis cloud cache |
| **Background Jobs** | Debounced Async RAG Queue | 2.5s edit debouncer, concurrency locks, and exponential retries |
| **Authentication** | NextAuth.js v4 | Credentials auth + Google, GitHub, Apple, Facebook OAuth |
| **RAG AI Service** | Python FastAPI + LangChain + ChromaDB | Vector search and LLM synthesis with Google Gemini |
| **Code Execution** | Pyodide (WASM) + Sandboxed Eval | In-browser isolated execution for Python and JavaScript |
| **Payments** | Stripe Node SDK + Razorpay API | Global multi-currency subscription and checkout engine |
| **Graphics & Audio** | OGL (WebGL) + Web Speech API | 3D audio waveform canvas and speech transcription |
| **Notifications** | Sonner | Modern toast notification manager |

---

## 🔌 API Routes & Services Reference

| Category | Endpoint | Method | Purpose |
| :--- | :--- | :---: | :--- |
| **Pages** | `/api/pages` | `GET` / `POST` | Retrieve workspace page list or create a new page |
| **Pages** | `/api/pages/[id]` | `GET` / `PATCH` / `DELETE` | Retrieve, update, or soft-delete specific page ($O(1)$ subtree) |
| **Pages** | `/api/pages/[id]/restore` | `POST` | Restore a page from trash |
| **Pages** | `/api/pages/[id]/revisions` | `GET` / `POST` | Retrieve version snapshot timeline or record revision |
| **Pages** | `/api/pages/[id]/comments` | `GET` / `POST` | Manage inline comment threads on pages |
| **Pages** | `/api/pages/[id]/share` | `POST` | Update page public accessibility or invite collaborators |
| **Trash** | `/api/pages/trash` | `GET` / `DELETE` | List trashed pages or permanently wipe trash |
| **Calendar** | `/api/calendar` | `GET` / `POST` | Retrieve or create calendar events |
| **Calendar** | `/api/calendar/[id]` | `PATCH` / `DELETE` | Update or remove specific calendar events |
| **Notifications** | `/api/notifications` | `GET` / `PATCH` | Retrieve user notification list or mark as read |
| **AI / RAG** | `/api/ai/chat` | `POST` | Forward queries to FastAPI RAG or internal Gemini fallback |
| **AI / RAG** | `/api/ai/rag-query` | `POST` | Execute vector similarity search on workspace knowledge base |
| **AI / RAG** | `/api/ai/meeting-summary` | `POST` | Generate structured meeting summaries from audio transcripts |
| **Health** | `/api/health/db` | `GET` | Live MongoDB cluster health check and latency ping |
| **Scraper** | `/api/scrape-og` | `POST` | Extract OpenGraph metadata for live web bookmarks |
| **Media** | `/api/unsplash` | `GET` | Search Unsplash high-res cover photos |
| **Media** | `/api/upload` | `POST` / `GET` | Upload and serve attached files and assets |
| **Billing** | `/api/stripe/checkout` | `POST` | Create Stripe checkout sessions for global users |
| **Billing** | `/api/stripe/webhook` | `POST` | Stripe webhook verification and plan status sync |
| **Billing** | `/api/razorpay/order` | `POST` | Create Razorpay order for Indian payment methods (UPI/Cards) |
| **Billing** | `/api/razorpay/webhook` | `POST` | Razorpay webhook event verification |
| **User** | `/api/user/profile` | `GET` / `PATCH` | Manage user name, avatar, and workspace preferences |
| **User** | `/api/user/plan` | `GET` | Query current plan tier and usage limits |

---

## 📁 Project Directory Structure

```text
notion/
├── .github/workflows/                # CI/CD automation pipelines (lint, typecheck, build)
├── app/                              # Next.js App Router root
│   ├── (auth)/                       # Authentication routes (login, register, forgot-password)
│   ├── (marketing)/                  # Marketing landing & promotional pages (solutions, enterprise, etc.)
│   ├── api/                          # Next.js Serverless API endpoints
│   │   ├── ai/                       # AI chat, meeting summary & vector RAG endpoints
│   │   ├── auth/                     # NextAuth authentication handlers
│   │   ├── calendar/                 # Calendar events CRUD endpoints
│   │   ├── health/                   # Database health check endpoints
│   │   ├── notifications/            # User notification endpoints
│   │   ├── pages/                    # Page CRUD, revisions, comments, share, trash & restore
│   │   ├── razorpay/                 # Razorpay order generation & webhook handlers
│   │   ├── scrape-og/                # OpenGraph link preview metadata scraper
│   │   ├── stripe/                   # Stripe checkout session & webhook handlers
│   │   ├── unsplash/                 # Unsplash image search & preset gateway
│   │   ├── upload/                   # Local file upload & retrieval endpoints
│   │   └── user/                     # User profile, settings and plan handlers
│   ├── checkout/                     # Subscription checkout page
│   ├── dashboard/                    # Main app workspace & dynamic page routes
│   │   ├── [pageId]/                 # Dynamic Notion page document canvas
│   │   └── calendar/                 # Notion Calendar workspace page
│   ├── globals.css                   # Tailwind CSS v4 tokens and theme variables
│   └── layout.tsx                    # Root layout with ThemeProvider and Sonner
├── components/                       # Reusable React components
│   ├── auth/                         # Login and registration form cards
│   ├── dashboard/                    # Workspace interface components
│   │   ├── editor/                   # Block editor, Kanban, Timeline, Table, CodeBlock, Comments, etc.
│   │   ├── modals/                   # Diff viewer, history, share, settings, trash, AI chat, import, checkout
│   │   ├── command-palette.tsx       # Global Cmd+K spotlight search overlay
│   │   ├── notion-ai-panel.tsx       # RAG AI assistant drawer
│   │   ├── notion-calendar.tsx       # Interactive multi-view calendar
│   │   ├── notifications-popover.tsx # User activity and notification bell popover
│   │   ├── pricing-modal.tsx         # Multi-region pricing and upgrade dialog
│   │   ├── sidebar.tsx               # Recursive navigation tree sidebar
│   │   ├── top-bar.tsx               # Document breadcrumbs, presence, export/import, and action bar
│   │   └── Strands.tsx               # WebGL 3D audio waveform canvas
│   └── ui/                           # Base UI atomic components (buttons, dialogs, dropdowns, logo-loop)
├── hooks/                            # Custom React hooks (use-autosave, use-pages, use-media-query)
├── lib/                              # Shared utilities, DB connection, code runner, logger, rate limiter
│   ├── actions/                      # Client-side cached fetch actions (pages, calendar, notifications)
│   ├── models/                       # Mongoose schemas (User, Page with Materialized Path, Revision, etc.)
│   ├── storage/                      # Local-first IndexedDB persistence engine & BroadcastChannel sync
│   ├── cache.ts                      # Dual-Tier cache engine (L1 RAM + L2 Upstash Redis REST)
│   ├── rag-queue.ts                  # Asynchronous debounced RAG vector indexing queue
│   ├── code-runner.ts                # JavaScript & Pyodide Python execution runners
│   ├── db-health.ts                  # Background MongoDB ping & failover health monitor
│   ├── duckduckgo.ts                 # DuckDuckGo search integration
│   ├── export-import.ts              # Markdown and JSON export/import handlers
│   ├── logger.ts                     # Production structured JSON logger
│   ├── markdown-blocks.ts            # Markdown to Notion block conversion parser
│   ├── mongodb.ts                    # MongoDB connection with active-passive backup failover
│   ├── ratelimit.ts                  # Upstash Redis distributed rate limiting
│   ├── razorpay.ts                   # Razorpay API client initialization
│   ├── stripe.ts                     # Stripe API client initialization
│   └── utils.ts                      # ClassName merger (clsx + tailwind-merge)
├── rag_service/                      # Python FastAPI LangChain Vector RAG service
│   ├── chroma_db/                    # ChromaDB vector index directory
│   ├── main.py                       # FastAPI application & RAG query pipelines
│   └── requirements.txt              # Python dependencies
├── public/                           # Static assets, SVG icons, and uploads
├── scripts/                          # Orchestration, database migration, and test scripts
│   ├── dev.mjs                       # Unified Next.js + Python RAG dev process runner
│   ├── backfill-ancestors.mts        # One-time migration backfilling materialized path tree
│   └── test-db.mjs                   # MongoDB connection diagnostic script
├── Dockerfile                        # Multi-stage production container build
├── package.json                      # Node.js project manifest and scripts
└── tsconfig.json                     # TypeScript compiler configuration
```

---

## ⚙️ Quick Start & Local Setup

### Prerequisites

Ensure the following runtimes are installed on your machine:
- **Node.js**: `v20.x` or `v22.x` (recommended)
- **npm**: `v10.x` or higher
- **Python**: `v3.10+` (optional, for the FastAPI Vector RAG service)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster connection string

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Xentra5/Notion.git
   cd Notion
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

### Database Ancestors Migration

To backfill materialized path hierarchy for existing pages:
```bash
npx tsx scripts/backfill-ancestors.mts
```

---

## 🔐 Environment Configuration Matrix

Refer to [.env.example](file:///d:/notion/.env.example) for a full template. Key variables include:

| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `NEXTAUTH_URL` | **Yes** | Canonical root URL for authentication callbacks | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | **Yes** | Encryption secret for NextAuth session JWTs | `generate-with-openssl-rand-hex-32` |
| `MONGODB_URI` | **Yes** | Primary MongoDB connection string | `mongodb+srv://user:pass@cluster1.mongodb.net/notion_dev` |
| `MONGODB_BACKUP_URI` | Optional | Secondary MongoDB cluster for geo-redundant failover | `mongodb+srv://user:pass@cluster2.mongodb.net/notion_dev` |
| `UPSTASH_REDIS_REST_URL` | Optional | Distributed L2 cache & rate limiting REST URL | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Distributed L2 cache & rate limiting token | `replace_with_token` |
| `RAG_SERVICE_URL` | Optional | Python FastAPI RAG microservice endpoint | `http://localhost:8000` |
| `STRIPE_API_KEY` | Optional | Stripe secret key for US / Global billing | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signature verification secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | Optional | Stripe price ID for Pro tier | `price_...` |
| `NEXT_PUBLIC_STRIPE_ULTIMATE_PRICE_ID` | Optional | Stripe price ID for Ultimate tier | `price_...` |
| `RAZORPAY_KEY_ID` | Optional | Razorpay key ID for India regional billing | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret key | `replace_with_secret` |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Razorpay webhook verification signature | `replace_with_secret` |
| `GOOGLE_ID` / `GOOGLE_SECRET` | Optional | Google OAuth provider credentials | `your-google-oauth-client-id` |
| `GITHUB_ID` / `GITHUB_SECRET` | Optional | GitHub OAuth provider credentials | `your-github-oauth-client-id` |
| `APPLE_ID` / `APPLE_SECRET` | Optional | Apple OAuth provider credentials | `your-apple-oauth-client-id` |
| `FACEBOOK_ID` / `FACEBOOK_SECRET` | Optional | Facebook OAuth provider credentials | `your-facebook-app-id` |

---

## 🐳 Docker Deployment

A multi-stage [Dockerfile](file:///d:/notion/Dockerfile) is provided for optimized standalone production containerization.

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

## 🔄 CI/CD Automation Pipeline

Automated continuous integration and delivery is configured using GitHub Actions ([.github/workflows/ci-cd.yml](file:///.github/workflows/ci-cd.yml)):

- **Lint & Type Check**: Validates ESLint 9 rules and runs `npx tsc --noEmit` on Node.js 22.
- **Production Build Validation**: Compiles the Next.js standalone bundle to ensure zero build errors.
- **Automated Deployment**: Dispatches deployments to staging and production targets upon merge to `staging` or `main`.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the orchestrator launching both Next.js (:3000) & Python FastAPI RAG (:8000) |
| `npm run build` | Compiles and builds the production Next.js standalone distribution bundle |
| `npm run start` | Boots the built Next.js production server |
| `npm run lint` | Executes ESLint 9 checks across the codebase |
| `npx tsc --noEmit` | Performs TypeScript type-checking validation |
| `npx tsx scripts/backfill-ancestors.mts` | Backfills materialized path hierarchy for existing pages |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
