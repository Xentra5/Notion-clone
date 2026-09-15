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

An enterprise-grade, high-performance collaborative workspace application built with **Next.js 16 (App Router)** and **MongoDB**. Faithfully engineered to deliver the full Notion experience with real-time block editing, autonomous multi-persona AI Agent workspaces, local-first 0ms persistence, dual-tier distributed caching (L1 RAM + L2 Redis), $O(1)$ materialized path tree hierarchy, asynchronous debounced RAG vector indexing, in-browser polyglot code execution, database multi-views (Kanban, Timeline, Table), voice-to-text meeting summaries with WebGL waveform visualizers, version diff rollback, document import/export, geo-redundant database failover, multi-region billing (Stripe & Razorpay), and collaborative multi-cursor presence.

---

## 📑 Table of Contents

- [📊 Implementation Readiness Matrix (What is Implemented vs What is Not)](#-implementation-readiness-matrix)
- [🌟 Key Features & Capabilities](#-key-features--capabilities)
  - [1. Autonomous Multi-Persona AI Agent Workspace](#1-autonomous-multi-persona-ai-agent-workspace)
  - [2. Block Editor & Dynamic Canvas](#2-block-editor--dynamic-canvas)
  - [3. Local-First 0ms Architecture & Multi-Tab Sync](#3-local-first-0ms-architecture--multi-tab-sync)
  - [4. Dual-Tier Distributed Cache Engine (L1 Memory + L2 Redis)](#4-dual-tier-distributed-cache-engine-l1-memory--l2-redis)
  - [5. Materialized Path Tree Hierarchy & Cascade Restore](#5-materialized-path-tree-hierarchy--cascade-restore)
  - [6. Async Debounced RAG Queue & Voice Transcriber](#6-async-debounced-rag-queue--voice-transcriber)
  - [7. Multi-View Database Boards](#7-multi-view-database-boards)
  - [8. In-Browser Polyglot Code Runner Sandbox](#8-in-browser-polyglot-code-runner-sandbox)
  - [9. Real-Time Multi-Cursor Collaboration, Invites & Notifications](#9-real-time-multi-cursor-collaboration-invites--notifications)
  - [10. Version History, Revisions & Visual Diff Rollback](#10-version-history-revisions--visual-diff-rollback)
  - [11. Notion Calendar Workspace](#11-notion-calendar-workspace)
  - [12. Dedicated Views: Tasks, Templates, Library & Help Center](#12-dedicated-views-tasks-templates-library--help-center)
  - [13. Document Export & Import Engine](#13-document-export--import-engine)
  - [14. Global Spotlight Command Palette](#14-global-spotlight-command-palette)
  - [15. Multi-Region Billing & Subscriptions](#15-multi-region-billing--subscriptions)
  - [16. Marketing, Enterprise & Solutions Showcase](#16-marketing-enterprise--solutions-showcase)
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

---

## 📊 Implementation Readiness Matrix

The following table provides a complete, transparent breakdown of what is fully implemented, what is functional with optional environment dependencies, and what remains as future architectural scope:

| Feature / System | Status | Implementation Details & Backing Files |
| :--- | :---: | :--- |
| **Block Editor Engine** | `✅ Fully Implemented` | Text, H1–H3, To-do, Bullets, Numbers, Toggle, Callout, Quote, Divider, Table, Web Bookmarks, File Upload, Code Blocks, AI Meeting Notes ([components/dashboard/editor/BlockItem.tsx](file:///d:/notion/components/dashboard/editor/BlockItem.tsx), [BlockRenderer.tsx](file:///d:/notion/components/dashboard/editor/BlockRenderer.tsx)). |
| **Multi-View Databases** | `✅ Fully Implemented` | Kanban Board with drag-and-drop, Gantt Timeline, and Table Grid with inline cell editing ([KanbanBoard.tsx](file:///d:/notion/components/dashboard/editor/KanbanBoard.tsx), [TimelineView.tsx](file:///d:/notion/components/dashboard/editor/TimelineView.tsx), [TableView.tsx](file:///d:/notion/components/dashboard/editor/TableView.tsx)). |
| **Autonomous AI Agent** | `✅ Fully Implemented` | 4 Personas, Fast/Think/DeepSearch modes, LangChain tool execution, long-term memory, session history, emotive animated bot logo ([app/dashboard/agent/page.tsx](file:///d:/notion/app/dashboard/agent/page.tsx), [rag_service/main.py](file:///d:/notion/rag_service/main.py)). |
| **Vector RAG & Search** | `✅ Fully Implemented` | 6-stage LangChain RAG pipeline, ChromaDB vector store, Gemini 1.5 Flash synthesis, page citations, live web search via DuckDuckGo ([rag_service/main.py](file:///d:/notion/rag_service/main.py)). |
| **Async Debounced RAG Queue** | `✅ Fully Implemented` | Collapses keystroke PATCH bursts, manages concurrency limits, handles exponential backoff retries ([lib/rag-queue.ts](file:///d:/notion/lib/rag-queue.ts)). |
| **Code Runner Sandbox** | `✅ Fully Implemented` | Client-side execution for JavaScript (sandboxed `Function` eval) and Python (Pyodide WASM) with live console drawer ([lib/code-runner.ts](file:///d:/notion/lib/code-runner.ts), [CodeBlock.tsx](file:///d:/notion/components/dashboard/editor/CodeBlock.tsx)). |
| **Voice Transcriber & Audio Waveform** | `✅ Fully Implemented` | Web Speech API speech-to-text paired with interactive WebGL 3D audio waveform canvas ([MeetingNoteView.tsx](file:///d:/notion/components/dashboard/editor/MeetingNoteView.tsx), [Strands.tsx](file:///d:/notion/components/dashboard/Strands.tsx)). |
| **Version History & Diff Viewer** | `✅ Fully Implemented` | Side-by-side and unified visual diff viewer with one-click snapshot rollback ([components/dashboard/modals/version-diff-modal.tsx](file:///d:/notion/components/dashboard/modals/version-diff-modal.tsx)). |
| **Notion Calendar Workspace** | `✅ Fully Implemented` | Month, Week, Day, and Agenda views with complete MongoDB persistence for events, tags, and times ([app/dashboard/calendar/page.tsx](file:///d:/notion/app/dashboard/calendar/page.tsx), [lib/models/calendar-event.ts](file:///d:/notion/lib/models/calendar-event.ts)). |
| **Local-First 0ms Persistence** | `✅ Fully Implemented` | Instant load from IndexedDB, BroadcastChannel multi-tab synchronization, offline mutation queues ([lib/storage/local-store.ts](file:///d:/notion/lib/storage/local-store.ts)). |
| **Materialized Path Tree Hierarchy** | `✅ Fully Implemented` | Ordered `ancestors` array in MongoDB schema enabling $O(1)$ subtree querying and cascading restore ([lib/models/page.ts](file:///d:/notion/lib/models/page.ts), [app/api/pages/[id]/restore/route.ts](file:///d:/notion/app/api/pages/[id]/restore/route.ts)). |
| **Dedicated Views (Tasks, Templates, Library, Help)** | `✅ Fully Implemented` | Personal task management, blueprints, team knowledge wiki with verification stamps, interactive Help Center ([components/dashboard/utility-page.tsx](file:///d:/notion/components/dashboard/utility-page.tsx), [help-center.tsx](file:///d:/notion/components/dashboard/help/help-center.tsx)). |
| **Centralized State Store** | `✅ Fully Implemented` | Zustand store managing active page, split views, command palette, sidebar, presence, and cross-component reactivity ([store/workspace-store.ts](file:///d:/notion/store/workspace-store.ts)). |
| **Real-Time Collaboration (SSE)** | `⚠️ Implemented (Single-Node)` | Server-Sent Events hub for live cursor pointers and presence ([lib/collaboration/hub.ts](file:///d:/notion/lib/collaboration/hub.ts)). Works across users on the same server instance. *(Multi-container Redis Pub/Sub cluster adapter is future scope)*. |
| **Workspace Invites & Notifications** | `⚠️ Implemented (Optional SMTP)` | Share modal, tokenized invite links, acceptance flow, MongoDB notifications ([app/invite/accept/page.tsx](file:///d:/notion/app/invite/accept/page.tsx), [lib/models/notification.ts](file:///d:/notion/lib/models/notification.ts)). Email sending requires `MAIL_SERVER` in `.env` (falls back to logging). |
| **Multi-Tier Caching (L1 + L2)** | `⚠️ Implemented (Optional Redis)` | In-memory LRU cache (L1) with Upstash Redis (L2) integration ([lib/cache.ts](file:///d:/notion/lib/cache.ts)). Automatically runs in memory-only mode if Redis credentials are omitted. |
| **Multi-Region Billing (Stripe & Razorpay)** | `⚠️ Implemented (Requires API Keys)` | Full checkout sessions, order generation, and signature verification ([app/api/stripe/checkout/route.ts](file:///d:/notion/app/api/stripe/checkout/route.ts), [app/api/razorpay/verify/route.ts](file:///d:/notion/app/api/razorpay/verify/route.ts)). Requires Stripe/Razorpay keys in `.env`. |
| **OAuth Providers (Google, GitHub, Apple, Facebook)** | `⚠️ Implemented (Requires Client IDs)` | NextAuth.js OAuth configuration in [lib/auth.ts](file:///d:/notion/lib/auth.ts). Requires OAuth client IDs and secrets in `.env` (Credentials login works out-of-the-box). |
| **Calendar 2-Way External Sync** | `📅 Future Roadmap` | User model includes integration flags (`connections: { google, outlook }`), but automated continuous 2-way background sync with Google Calendar / Microsoft Graph API is planned. |
| **Headless Server-Side PDF Rendering** | `📅 Future Roadmap` | Current PDF export uses custom CSS print typography formatting (`window.print()`). Server-side Puppeteer/Chromium rendering is planned. |
| **Full-Duplex Audio-to-Audio Streaming** | `📅 Future Roadmap` | Voice recording uses browser Web Speech API transcription sent to LLM. Real-time audio streaming websockets (e.g. Gemini Live) are planned. |

---

## 🌟 Key Features & Capabilities

### 1. Autonomous Multi-Persona AI Agent Workspace
- **Dedicated Agent Interface ([app/dashboard/agent/page.tsx](file:///d:/notion/app/dashboard/agent/page.tsx))**: An autonomous AI assistant workspace with conversational execution and tool calling.
- **4 Specialized Personas**:
  - **Project HR (`project_hr`)**: People & Operations, onboarding workflows, culture documentation, meeting agendas.
  - **Executive Assistant (`executive_assistant`)**: Fast scheduling, proactive task management, meeting follow-ups.
  - **Tech Lead & PM (`tech_lead`)**: System architecture, sprint planning, PRDs, engineering task breakdowns.
  - **Note Architect (`note_taker`)**: Document restructuring, summary extraction, Notion block formatting.
- **3 Reasoning Modes**:
  - **Fast**: Quick direct responses for routine workspace questions.
  - **Think**: Step-by-step reasoning showing tool calls and intermediate thoughts.
  - **DeepSearch**: Multi-step query planning executing both vector RAG and live web search.
- **Autonomous Tool Execution**:
  - `create_calendar_event`, `update_calendar_event`, `delete_calendar_event`, `list_calendar_events`
  - `create_page`, `update_page`, `list_pages`
  - `search_workspace` (ChromaDB vector similarity search)
  - `remember_fact` (Persists preferences and facts to MongoDB long-term memory)
  - `web_search` (Live web queries via DuckDuckGo)
- **Emotive Bot Avatar ([components/dashboard/animated-bot-logo.tsx](file:///d:/notion/components/dashboard/animated-bot-logo.tsx))**: Visual state changes across `idle`, `thinking`, `speaking`, `celebrating`, and `error`.
- **Memory & Session History**:
  - Long-term memory modal ([components/dashboard/modals/agent-memory-modal.tsx](file:///d:/notion/components/dashboard/modals/agent-memory-modal.tsx))
  - Session history drawer ([components/dashboard/modals/agent-history-drawer.tsx](file:///d:/notion/components/dashboard/modals/agent-history-drawer.tsx))

### 2. Block Editor & Dynamic Canvas
- **Modular Block Architecture ([components/dashboard/editor/BlockItem.tsx](file:///d:/notion/components/dashboard/editor/BlockItem.tsx))**: Deconstructed into lightweight, memoized block items to eliminate unnecessary re-renders during rapid editing.
- **Extensive Block Catalog**: Text, Headings (`H1`, `H2`, `H3`), Checklists/Todos, Bulleted/Numbered Lists, Callouts, Toggle Blocks, Blockquotes, Dividers, Tables, Web Bookmarks, File Uploads, Kanban Databases, Code Blocks, and AI Meeting Notes.
- **Slash Command Menu ([components/dashboard/editor/SlashCommandMenu.tsx](file:///d:/notion/components/dashboard/editor/SlashCommandMenu.tsx))**: Type `/` to open a categorized quick-insert menu with keyboard navigation.
- **Markdown Block Parser ([lib/markdown-blocks.ts](file:///d:/notion/lib/markdown-blocks.ts))**: Paste raw Markdown directly into the editor to automatically convert it into native Notion blocks.
- **Unsplash Cover Banner & Icon Engine ([components/dashboard/editor/PageCoverBanner.tsx](file:///d:/notion/components/dashboard/editor/PageCoverBanner.tsx))**: Full-width page headers with direct Unsplash photo search ([app/api/unsplash/route.ts](file:///d:/notion/app/api/unsplash/route.ts)), gradient presets, custom image uploads, and emoji icon pickers.

### 3. Local-First 0ms Architecture & Multi-Tab Sync
- **Instant IndexedDB Retrieval ([lib/storage/local-store.ts](file:///d:/notion/lib/storage/local-store.ts))**: 0ms local reads for page lists and document bodies using browser IndexedDB.
- **BroadcastChannel Multi-Tab Sync**: Edits made in one browser tab instantly propagate to other open tabs without requiring network round-trips.
- **Offline Mutation Queue**: Modifications made while offline are queued and automatically synced with exponential backoff once connectivity is restored.

### 4. Dual-Tier Distributed Cache Engine (L1 Memory + L2 Redis)
- **High-Speed L1 Cache**: In-memory LRU cache in Node.js runtime providing sub-millisecond data access.
- **Distributed L2 Cache ([lib/cache.ts](file:///d:/notion/lib/cache.ts))**: Optional Upstash Redis integration providing cache consistency across serverless and containerized instances.
- **Granular Tag Invalidation**: Cache entries are tagged by workspace, page, and user for precise, instant invalidation upon mutations.

### 5. Materialized Path Tree Hierarchy & Cascade Restore
- **Materialized Path Schema ([lib/models/page.ts](file:///d:/notion/lib/models/page.ts))**: Stores an ordered `ancestors` array from root to direct parent, transforming deep tree lookups into single $O(1)$ MongoDB queries.
- **Circular Dependency Guard ([app/api/pages/[id]/route.ts](file:///d:/notion/app/api/pages/[id]/route.ts))**: Cycle detection ensures pages cannot be set as descendants of themselves.
- **Cascading Trash & Restore ([app/api/pages/[id]/restore/route.ts](file:///d:/notion/app/api/pages/[id]/restore/route.ts))**: Soft-deleting a page hides all sub-pages; restoring a page automatically cascades through all descendants and queues them for RAG vector re-indexing.
- **Migration Script ([scripts/backfill-ancestors.mts](file:///d:/notion/scripts/backfill-ancestors.mts))**: CLI script to backfill ancestor arrays on legacy databases.

### 6. Async Debounced RAG Queue & Voice Transcriber
- **Background Indexing Queue ([lib/rag-queue.ts](file:///d:/notion/lib/rag-queue.ts))**: Decouples document saves from vector embedding generation, eliminating save latency.
- **LangChain + FastAPI Microservice ([rag_service/main.py](file:///d:/notion/rag_service/main.py))**:
  - `SentenceTransformerEmbeddings` (`all-MiniLM-L6-v2`) with local ChromaDB storage.
  - Multi-tenant workspace isolation ensuring cross-tenant data privacy.
  - Streaming responses (`/query-stream`) and standard citations (`/query`).
- **Live Voice Recording & AI Meeting Notes ([components/dashboard/editor/MeetingNoteView.tsx](file:///d:/notion/components/dashboard/editor/MeetingNoteView.tsx))**: Browser speech-to-text recording with WebGL audio visualizer ([components/dashboard/Strands.tsx](file:///d:/notion/components/dashboard/Strands.tsx)) and one-click AI summarization.

### 7. Multi-View Database Boards
- **Dynamic View Switcher ([components/dashboard/editor/DatabaseBlock.tsx](file:///d:/notion/components/dashboard/editor/DatabaseBlock.tsx))**:
  - **Kanban Board ([KanbanBoard.tsx](file:///d:/notion/components/dashboard/editor/KanbanBoard.tsx))**: Drag-and-drop columns, customizable tag colors, priority badges, and quick-add cards.
  - **Timeline / Gantt Chart ([TimelineView.tsx](file:///d:/notion/components/dashboard/editor/TimelineView.tsx))**: Visual Gantt timeline mapping task durations across dates.
  - **Data Table View ([TableView.tsx](file:///d:/notion/components/dashboard/editor/TableView.tsx))**: Grid view with inline editing, schema types, and row management.

### 8. In-Browser Polyglot Code Runner Sandbox
- **Client-Side Execution ([lib/code-runner.ts](file:///d:/notion/lib/code-runner.ts))**:
  - **JavaScript Sandbox**: Isolated `Function` evaluation engine intercepting `console.log` streams.
  - **Python Sandbox**: Authentic Python execution powered by Pyodide WebAssembly (WASM).
- **Interactive Console Panel ([components/dashboard/editor/CodeBlock.tsx](file:///d:/notion/components/dashboard/editor/CodeBlock.tsx))**: Output drawer displaying execution runtime, standard output, and error tracebacks.

### 9. Real-Time Multi-Cursor Collaboration, Invites & Notifications
- **Server-Sent Events Stream ([app/api/collaboration/[pageId]/stream/route.ts](file:///d:/notion/app/api/collaboration/[pageId]/stream/route.ts))**: Real-time event hub broadcasting cursor coordinates, active blocks, and edits.
- **Remote Cursor Flags ([RemoteCursorOverlay.tsx](file:///d:/notion/components/dashboard/editor/RemoteCursorOverlay.tsx))**: Colored mouse pointers with user tags.
- **Live Presence Bar ([LivePresenceBar.tsx](file:///d:/notion/components/dashboard/editor/LivePresenceBar.tsx))**: Collaborator avatars with online status badges.
- **Workspace Sharing & Invites ([components/dashboard/modals/share-modal.tsx](file:///d:/notion/components/dashboard/modals/share-modal.tsx))**: Invite team members via email with role permissions (`viewer`, `editor`). Tokenized acceptance page ([app/invite/accept/page.tsx](file:///d:/notion/app/invite/accept/page.tsx)).
- **Notifications Feed ([components/dashboard/notifications-popover.tsx](file:///d:/notion/components/dashboard/notifications-popover.tsx))**: In-app notification bell with MongoDB persistence and unread count badges.

### 10. Version History, Revisions & Visual Diff Rollback
- **Visual Revision Comparator ([components/dashboard/modals/version-diff-modal.tsx](file:///d:/notion/components/dashboard/modals/version-diff-modal.tsx))**: Compare historical snapshots against current document states.
- **Unified & Side-by-Side Diffs**: Highlights added blocks in green and removed blocks in red.
- **One-Click Rollback**: Restore any previous version snapshot directly back into the live canvas.

### 11. Notion Calendar Workspace
- **Interactive Calendar ([app/dashboard/calendar/page.tsx](file:///d:/notion/app/dashboard/calendar/page.tsx))**: Switch between **Month**, **Week**, **Day**, and **Agenda** views.
- **Event Lifecycle ([lib/models/calendar-event.ts](file:///d:/notion/lib/models/calendar-event.ts))**: Create, reschedule, tag, and assign color-coded metadata to workspace deadlines.

### 12. Dedicated Views: Tasks, Templates, Library & Help Center
- **My Tasks ([app/dashboard/tasks/page.tsx](file:///d:/notion/app/dashboard/tasks/page.tsx))**: Personal task manager with priority filtering, due dates, and completion status.
- **Templates Directory ([app/dashboard/templates/page.tsx](file:///d:/notion/app/dashboard/templates/page.tsx))**: Pre-built blueprints (Project Brief, Architecture Decision Record, Meeting Notes, Weekly Review).
- **Workspace Library ([app/dashboard/library/page.tsx](file:///d:/notion/app/dashboard/library/page.tsx))**: Team knowledge base for SOPs, guides, and policies with official verification stamps.
- **Help Center ([app/dashboard/help/page.tsx](file:///d:/notion/app/dashboard/help/page.tsx))**: Interactive guide with searchable articles, keyboard shortcut cheat sheets, and FAQs.

### 13. Document Export & Import Engine
- **Export Formats**: One-click export to GitHub-flavored Markdown (`.md`) or printable PDF format with clean typography.
- **Markdown Importer ([components/dashboard/modals/import-modal.tsx](file:///d:/notion/components/dashboard/modals/import-modal.tsx))**: Parses `.md` files directly into a new structured Notion page.

### 14. Global Spotlight Command Palette
- **Universal Shortcut (`Cmd + K` / `Ctrl + K`) ([components/dashboard/command-palette.tsx](file:///d:/notion/components/dashboard/command-palette.tsx))**: Global fuzzy search across page titles and block content.
- **Quick Actions**: Jump to recent pages, toggle theme (Light/Dark), launch modals, or trigger Notion AI.

### 15. Multi-Region Billing & Subscriptions
- **Dual Payment Gateways ([app/api/stripe/checkout/route.ts](file:///d:/notion/app/api/stripe/checkout/route.ts) & [app/api/razorpay/create-order/route.ts](file:///d:/notion/app/api/razorpay/create-order/route.ts))**:
  - **Stripe**: International subscriptions (USD / Global currencies).
  - **Razorpay**: Domestic Indian payment methods (UPI, NetBanking, Cards in INR).
- **Checkout & Pricing Modal ([components/dashboard/pricing-modal.tsx](file:///d:/notion/components/dashboard/pricing-modal.tsx))**: Dynamic tier comparison (`Free`, `Pro`, `Ultimate`) with regional fee breakdowns and webhook verification.

### 16. Marketing, Enterprise & Solutions Showcase
- **Enterprise Showcase ([app/(Marketing)/enterprise/page.tsx](file:///d:/notion/app/(Marketing)/enterprise/page.tsx))**: Enterprise features, security governance, audit logs, and compliance.
- **Interactive Solutions Hub ([app/(Marketing)/solutions/page.tsx](file:///d:/notion/app/(Marketing)/solutions/page.tsx))**: Tailored workflows for Engineering, Product, Design, and Operations teams.
- **Developer Portal ([app/(Marketing)/developers/page.tsx](file:///d:/notion/app/(Marketing)/developers/page.tsx))**: API documentation, webhook setup, and code snippets.
- **Demo Request Page ([app/(Marketing)/request-demo/page.tsx](file:///d:/notion/app/(Marketing)/request-demo/page.tsx))**: Lead capture form for enterprise consultations.

---

## 🏗️ System Architecture & Tech Stack

```mermaid
graph TD
    Client["Browser / Client (Next.js 16 App Router + React 19)"]

    subgraph State["Client-Side State & Persistence"]
        Zustand["Zustand Workspace Store (store/workspace-store.ts)"]
        LocalStore["Local-First IndexedDB & BroadcastChannel (lib/storage/local-store.ts)"]
    end

    subgraph Frontend["Frontend Layer"]
        AgentUI["AI Agent Workspace (/dashboard/agent)"]
        Editor["Block Canvas (BlockItem.tsx & BlockRenderer.tsx)"]
        Sandbox["Pyodide WASM & JS Sandbox"]
        Views["Kanban / Timeline / Table Multi-Views"]
        Calendar["Notion Calendar"]
        Audio["Web Speech API & WebGL Visualizer"]
    end

    subgraph NextBackend["Next.js 16 API Layer (:3000)"]
        AuthAPI["NextAuth (OAuth + Credentials)"]
        PagesAPI["Pages CRUD & Materialized Path Engine"]
        CollabHub["Real-time SSE Event Hub (lib/collaboration/hub.ts)"]
        CacheLayer["Dual-Tier Cache Engine (L1 Memory + L2 Redis)"]
        RagQueue["Async Debounced RAG Queue (lib/rag-queue.ts)"]
        PayAPI["Stripe & Razorpay Gateways"]
    end

    subgraph RAGMicroservice["Python FastAPI RAG Microservice (:8000)"]
        FastAPI["FastAPI App (rag_service/main.py)"]
        Chroma["ChromaDB Vector Store"]
        Embeddings["SentenceTransformers (all-MiniLM-L6-v2)"]
        LangChainAgent["LangChain Multi-Persona Tool Agent"]
        Gemini["Google Gemini 1.5 Flash LLM"]
        WebSearch["DuckDuckGo Live Search Tool"]
    end

    subgraph DataStorage["Data Layer"]
        MongoDB[("Primary MongoDB Cluster")]
        MongoBackup[("Secondary MongoDB Cluster (Failover)")]
        UpstashRedis[("Upstash Redis (L2 Cache & Rate Limiting)")]
    end

    Client --> State
    State --> Frontend
    Frontend --> NextBackend
    NextBackend --> CacheLayer
    CacheLayer --> MongoDB
    MongoDB -.->|Geo-Failover| MongoBackup
    CacheLayer -.->|L2 Distributed| UpstashRedis
    NextBackend --> RagQueue
    RagQueue -->|Debounced HTTP Tasks| RAGMicroservice
    Frontend -.->|Direct or Proxy AI Queries| RAGMicroservice
    RAGMicroservice --> Chroma
    RAGMicroservice --> LangChainAgent
    LangChainAgent --> Gemini
    LangChainAgent --> WebSearch
```

| Layer / Subsystem | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2.11 (App Router) | High-performance React 19 server & client runtime |
| **State Management** | Zustand 5.x | Centralized reactive store for dashboard & collaboration state |
| **Local Storage** | IndexedDB + HTML5 BroadcastChannel | 0ms local-first document retrieval and cross-tab synchronization |
| **Database & ODM** | MongoDB + Mongoose 9.x | Document database with materialized path ancestor hierarchy |
| **Caching Tier** | In-Memory LRU (L1) + Upstash Redis (L2) | Multi-tier sub-millisecond caching and distributed rate limiting |
| **AI Agent & RAG** | Python FastAPI + LangChain + ChromaDB | Autonomous agent, multi-persona tool calling, vector search |
| **LLM Provider** | Google Gemini 1.5 Flash | Fast, high-context AI synthesis and reasoning |
| **Code Sandbox** | Pyodide (WASM) + Sandboxed Eval | Isolated in-browser execution for Python and JavaScript |
| **Audio & Graphics** | OGL (WebGL) + Web Speech API | 3D audio waveform visualization and live meeting transcription |
| **Styling & UI** | Tailwind CSS v4 + Lucide React + Sonner | Modern responsive layout, dark/light modes, toast notifications |

---

## 🔌 API Routes & Services Reference

### Next.js API Routes (`:3000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET / POST` | `/api/pages` | List workspace pages (0ms cached) or create a new page |
| `GET / PATCH / DELETE` | `/api/pages/[id]` | Fetch page body, apply optimistic update, or move to trash |
| `POST` | `/api/pages/[id]/restore` | Cascade restore page and descendants; re-index into RAG queue |
| `POST` | `/api/pages/[id]/share` | Generate collaboration invite token and send invite email |
| `GET` | `/api/pages/shared` | Fetch pages shared with the current authenticated user |
| `GET` | `/api/invite/accept` | Validate collaboration token, mark accepted, redirect to page |
| `GET` | `/api/collaboration/[pageId]/stream` | Server-Sent Events stream for real-time cursor pointers and presence |
| `POST` | `/api/collaboration/[pageId]/event` | Broadcast document updates or cursor movements to active room |
| `GET / POST` | `/api/notifications` | Fetch user notification feed or mark notifications as read |
| `GET / POST` | `/api/calendar` | List user calendar events or create a new scheduled event |
| `PATCH / DELETE` | `/api/calendar/[id]` | Update event details/times or delete calendar event |
| `POST` | `/api/ai/agent` | Proxy endpoint for AI Agent tool reasoning |
| `GET / POST` | `/api/ai/agent/memory` | Fetch or store long-term user memory facts |
| `GET / POST` | `/api/ai/agent/sessions` | Fetch or manage AI Agent chat sessions and message logs |
| `POST` | `/api/ai/rag-query` | Multi-turn RAG query with page citations |
| `POST` | `/api/ai/meeting-summary` | Generates summary, key takeaways, and action items from transcripts |
| `POST` | `/api/upload` | Validates and stores user file attachments |
| `GET` | `/api/scrape-og` | Scrapes OpenGraph metadata and favicons from URLs |
| `GET` | `/api/unsplash` | Direct Unsplash image search API |
| `GET` | `/api/health/db` | Real-time MongoDB and Redis health check diagnostics |
| `POST` | `/api/stripe/checkout` | Creates Stripe subscription checkout sessions |
| `POST` | `/api/razorpay/create-order` | Generates Razorpay order IDs for INR transactions |
| `POST` | `/api/razorpay/verify` | Cryptographically verifies Razorpay payment signatures |

### Python FastAPI Microservice (`:8000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Microservice health check & ChromaDB status |
| `POST` | `/agent` | LangChain autonomous multi-persona tool-calling agent |
| `POST` | `/query` | Vector similarity search with Google Gemini synthesis |
| `POST` | `/query-stream` | Streaming SSE response for RAG search queries |
| `POST` | `/index-page` | Chunks and embeds single page blocks into ChromaDB |
| `POST` | `/index-pages-batch` | Batch vectorization for workspace initialization |
| `DELETE` | `/delete-page` | Purges page vectors from ChromaDB index |
| `POST` | `/meeting-summary` | Summarizes meeting audio transcripts |

---

## 📁 Project Directory Structure

```text
notion/
├── app/                              # Next.js App Router root
│   ├── (auth)/                       # Auth routes (login, register, forgot-password)
│   ├── (Marketing)/                  # Marketing, solutions, enterprise, developers, pricing
│   ├── api/                          # Next.js Serverless API endpoints
│   │   ├── ai/                       # AI Agent, RAG query, meeting summary endpoints
│   │   ├── auth/                     # NextAuth authentication handlers
│   │   ├── calendar/                 # Calendar event CRUD endpoints
│   │   ├── collaboration/            # SSE real-time presence & event streaming
│   │   ├── health/                   # Database & cache health check diagnostics
│   │   ├── invite/                   # Workspace invite acceptance handler
│   │   ├── notifications/            # User notification feed endpoints
│   │   ├── pages/                    # Page CRUD, sub-pages, versions, restore, sharing
│   │   ├── razorpay/                 # Razorpay order generation & verification
│   │   ├── scrape-og/                # OpenGraph link preview scraper
│   │   ├── stripe/                   # Stripe checkout session & webhook handlers
│   │   ├── unsplash/                 # Unsplash photo search gateway
│   │   └── upload/                   # Local file attachment storage engine
│   ├── checkout/                     # Subscription checkout flow page
│   ├── dashboard/                    # Main workspace application
│   │   ├── [pageId]/                 # Dynamic document canvas route
│   │   ├── agent/                    # Autonomous AI Agent workspace
│   │   ├── calendar/                 # Full-featured Notion Calendar workspace
│   │   ├── help/                     # Interactive Help Center
│   │   ├── library/                  # Team knowledge wiki (Guides, SOPs)
│   │   ├── tasks/                    # Personal task management dashboard
│   │   └── templates/                # Blueprint workspace templates
│   ├── invite/                       # Invite acceptance user landing page
│   ├── globals.css                   # Tailwind CSS v4 design tokens and theme rules
│   └── layout.tsx                    # Root layout with ThemeProvider and Sonner
├── components/                       # Reusable React components
│   ├── auth/                         # Login and registration form cards
│   ├── dashboard/                    # Workspace interface components
│   │   ├── editor/                   # BlockItem, BlockRenderer, CodeBlock, Kanban, etc.
│   │   ├── help/                     # Help center articles and keyboard shortcut views
│   │   ├── modals/                   # Diff viewer, share, trash, memory, history, checkout
│   │   ├── animated-bot-logo.tsx     # Emotive bot logo with dynamic states
│   │   ├── command-palette.tsx       # Cmd+K global spotlight overlay
│   │   ├── floating-help-button.tsx  # Floating quick-help button
│   │   ├── notifications-popover.tsx # In-app notification bell drawer
│   │   ├── notion-ai-panel.tsx       # Collapsible RAG assistant side panel
│   │   ├── notion-calendar.tsx       # Interactive calendar grid
│   │   ├── pricing-modal.tsx         # Multi-region pricing and upgrade dialog
│   │   ├── sidebar.tsx               # Recursive navigation tree sidebar
│   │   ├── top-bar.tsx               # Breadcrumbs, live presence bar, and action bar
│   │   └── utility-page.tsx          # Renderer for Tasks, Library, and Templates
│   └── ui/                           # Base UI primitives (buttons, dialogs, inputs)
├── hooks/                            # Custom React hooks (use-autosave, use-collaboration)
├── lib/                              # Core utilities, DB models, engines, and actions
│   ├── actions/                      # Page, calendar, and notification fetch actions
│   ├── collaboration/                # Real-time SSE collaboration hub singleton
│   ├── models/                       # Mongoose schemas (Page, User, AgentSession, etc.)
│   ├── storage/                      # Local-First IndexedDB persistence engine
│   ├── cache.ts                      # Dual-tier L1 memory + L2 Redis caching
│   ├── clean-ai-text.ts              # Sanitizer for AI responses and markdown cleanup
│   ├── db-health.ts                  # Database connection health check utilities
│   ├── email.ts                      # Nodemailer workspace invite email dispatcher
│   ├── markdown-blocks.ts            # Markdown to Notion block parsing engine
│   ├── mongodb.ts                    # Geo-redundant MongoDB connection manager
│   ├── rag-queue.ts                  # Async debounced background RAG indexing queue
│   └── ratelimit.ts                  # Rate limiting engine with Redis/Memory fallback
├── rag_service/                      # Python FastAPI LangChain Vector RAG service
│   ├── chroma_db/                    # ChromaDB persistent vector database
│   ├── main.py                       # FastAPI application & LangChain Agent
│   └── requirements.txt              # Python service dependencies
├── scripts/                          # Tooling and diagnostic scripts
│   ├── backfill-ancestors.mts        # Materialized path migration script
│   ├── dev.mjs                       # Unified Next.js + Python RAG process orchestrator
│   └── test-db.mjs                   # MongoDB connection diagnostic script
├── store/                            # Zustand centralized workspace state
│   └── workspace-store.ts            # Dashboard, presence, and modal state store
├── Dockerfile                        # Multi-stage production container build
├── package.json                      # Node.js dependencies and scripts
└── tsconfig.json                     # TypeScript compiler configuration
```

---

## ⚙️ Quick Start & Local Setup

### Prerequisites

Ensure the following runtimes are installed on your system:
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Python**: `v3.10+` (optional, for the FastAPI Vector RAG & Agent service)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster URI

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Xentra5/Notion-clone.git
   cd Notion-clone
   ```

2. **Install Node.js Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the template environment file and fill in your keys:
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
> If Python is not installed or the virtual environment is absent, the Next.js frontend will still launch normally and route AI queries through internal fallback endpoints.

### Database Ancestors Migration

For workspaces with pre-existing pages created prior to the materialized path upgrade, execute the ancestor backfill script:

```bash
npx tsx scripts/backfill-ancestors.mts
```

---

## 🔐 Environment Configuration Matrix

Refer to [.env.example](file:///d:/notion/.env.example) for a complete template:

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `NEXTAUTH_URL` | **Yes** | `http://localhost:3000` | Canonical root URL for authentication callbacks |
| `NEXTAUTH_SECRET` | **Yes** | `generate-with-openssl-rand-hex-32` | Encryption secret for NextAuth JWT sessions |
| `MONGODB_URI` | **Yes** | `mongodb+srv://.../notion_dev` | Primary MongoDB connection URI |
| `MONGODB_BACKUP_URI` | Optional | `mongodb+srv://.../notion_backup` | Secondary MongoDB URI for geo-failover |
| `GEMINI_API_KEY` | Optional | `your-gemini-api-key` | Google Gemini API key for Vector RAG & AI Agent |
| `RAG_SERVICE_URL` | Optional | `http://localhost:8000` | Python FastAPI RAG microservice endpoint |
| `RAG_INTERNAL_SECRET` | Optional | `internal-shared-secret` | Internal authentication token between Next.js & FastAPI |
| `UPSTASH_REDIS_REST_URL` | Optional | `https://...upstash.io` | Upstash Redis REST URL for L2 cache and rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | `replace-with-token` | Upstash Redis REST authentication token |
| `MAIL_SERVER` | Optional | `smtp://user:pass@smtp.mailtrap.io:2525` | SMTP connection URI for workspace email invites |
| `EMAIL_FROM` | Optional | `"Notion Workspace <no-reply@domain.com>"` | Sender name and address for notification emails |
| `STRIPE_API_KEY` | Optional | `sk_test_...` | Stripe secret key for US / Global billing |
| `STRIPE_WEBHOOK_SECRET` | Optional | `whsec_...` | Stripe webhook signature verification secret |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | Optional | `price_...` | Stripe price ID for Pro tier |
| `NEXT_PUBLIC_STRIPE_ULTIMATE_PRICE_ID` | Optional | `price_...` | Stripe price ID for Ultimate tier |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_...` | Razorpay key ID for India regional billing |
| `RAZORPAY_KEY_SECRET` | Optional | `replace_with_secret` | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | `replace_with_secret` | Razorpay webhook verification signature |
| `GOOGLE_ID` / `GOOGLE_SECRET` | Optional | `your-google-client-id` | Google OAuth provider credentials |
| `GITHUB_ID` / `GITHUB_SECRET` | Optional | `your-github-client-id` | GitHub OAuth provider credentials |
| `APPLE_ID` / `APPLE_SECRET` | Optional | `your-apple-client-id` | Apple OAuth provider credentials |
| `FACEBOOK_ID` / `FACEBOOK_SECRET` | Optional | `your-facebook-app-id` | Facebook OAuth provider credentials |

---

## 🐳 Docker Deployment

A multi-stage [Dockerfile](file:///d:/notion/Dockerfile) is provided for standalone production containerization.

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
