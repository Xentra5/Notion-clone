# Notion Workspace & Modern SaaS Platform 🚀

A feature-rich, enterprise-grade collaborative workspace application built on **Next.js 16 (App Router)** and **MongoDB**, mimicking the core experience of Notion with real-time block editing, Notion Calendar app, advanced code editor with syntax highlighting, AI meeting notes, Markdown/PDF export & import, block comments & @mentions, page revision history, WebGL canvas shaders, and multi-region payment gateway support (Stripe & Razorpay).

---

## 🌟 Comprehensive Feature Overview

### 📄 1. Document & Block-Based Editor
- **Notion-Grade Block Architecture**: Support for Paragraphs, Headings (`H1`, `H2`, `H3`), Bulleted Lists, Numbered Lists (with relative sequence calculation), Callouts (with click-to-change Emoji Picker), Collapsible Toggle Blocks (with preserved nested child content), Quotes, Dividers, Dynamic Matrix Tables (with `+ Add Row` / `+ Add Column`), and Sub-Pages.
- **Code Block Editor (`CodeBlock.tsx`)**:
  - Pinned top-right language selector with **70+ supported languages** and filter search.
  - Pixel-perfect Notion styling with dark/light mode background integration.
  - Real-time syntax highlighting (`react-syntax-highlighter` integration).
  - Floating **"✦ Use AI"** contextual prompt on empty focused code blocks.
  - Intuitive keyboard navigation: `Enter` stays inside the code block (inserts newline), `Enter` on empty escapes to a new paragraph, and `Tab` / `Shift + Tab` handles indentation.
- **Debounced Auto-Save (`use-autosave.ts`)**: Automatic background saving with visual status indicators (`Saving...`, `Saved`).
- **Cover Photos & Custom Emojis**: Dynamic header cover image support and interactive Emoji Picker (`EmojiPicker.tsx`).
- **Toolbar & Format Bar**: Inline formatting for **Bold**, *Italic*, ~Strikethrough~, Underline, Code formatting, Text Colors, and Highlight Colors.

### 📅 2. Full Notion Calendar App (`/dashboard/calendar`)
- **Interactive Views**: Switch seamlessly between **Month**, **Week**, **Day**, and **Agenda** views.
- **Full Event Lifecycle**: Add, edit, and delete events with date pickers, start/end time selectors, all-day toggles, locations, tags, and multi-line descriptions.
- **Color Coding**: 8 curated event color themes (`blue`, `red`, `green`, `yellow`, `purple`, `pink`, `orange`, `gray`).
- **Navigation & Shortcuts**: One-click **Today** navigation button and relative month/week chevron controls.

### 🌿 3. Sub-Page Creation & Hierarchical Navigation
- **Nested Page Links**: Insert a `/page` block anywhere inside a document to generate a sub-page.
- **Instant Page Generation**: Clicking a sub-page link automatically provisions a new MongoDB page record and navigates directly into the nested route.
- **Sidebar Integration**: Sub-pages and parent-child hierarchies dynamically update in the sidebar tree.

### 📥 4. Document Export & Import Suite
- **Export to Markdown (`.md`)**: One-click export converting page blocks into clean GitHub-flavored Markdown text (`blocksToMarkdown`).
- **Export / Print to PDF**: Printable PDF export engine formatted with custom CSS typography.
- **Import Markdown Files (`import-modal.tsx`)**: Drag-and-drop `.md` file importer parsing headings, lists, code snippets, and to-do checkboxes directly into a new Notion workspace page.

### 💬 5. Block-Level Comments & @User Mentions
- **Slide-Out Comments Panel (`CommentsPanel.tsx`)**: Real-time document discussion drawer allowing users to view and post comments on documents.
- **Team @Mentions**: Support for `@username` tags and inline mentions within discussions.

### ⏳ 6. Page Revision History & Snapshot Restoration
- **Revision History Modal (`history-modal.tsx`)**: View historical edit snapshots with author timestamps.
- **Checkpoint Creation & Restore**: Create manual checkpoints and restore any past revision snapshot back to the live document.

### 🤖 7. Notion AI Assistant & AI Meeting Notes
- **In-App AI Assistant Modal (`ai-chat-modal.tsx`)**: Summarize notes, draft outlines, improve writing, or generate action items dynamically.
- **AI Meeting Notes View (`MeetingNoteView.tsx`)**: Dedicated view to automatically digest transcripts, generate executive meeting minutes, and extract assignees & action items.
- **AI Usage Tracking & Limits**: Built-in free trial limits (3 trial requests) with seamless upgrade prompts for Pro and Ultimate accounts.

### 🔍 8. Quick Search & Navigation (`Ctrl + K`)
- **Global Command Palette (`search-modal.tsx`)**: Keyboard shortcut `Ctrl + K` / `Cmd + K` search modal for instant lookup across all workspace page titles and block contents.
- **Dynamic Tree Hierarchy**: Nested page sidebars with drag-and-drop hierarchy support, quick page creation, collapsible lists, and favorites.

### 💳 9. Multi-Region Payment Gateways & SaaS Checkout (Stripe + Razorpay)
- **Regional Payment Selection**: Auto-detects region and lets users choose between **USA / Global (Stripe)** and **India (Razorpay)**.
- **Card & Platform Fee Transparency**: Dynamically renders base subscription costs, regional fee percentages, card processing fees, and net total breakdown.
- **Stripe Subscriptions**: Automated checkout sessions (`/api/stripe/checkout`) and webhook handling (`/api/stripe/webhook`).
- **Razorpay Integration**: Native support for Razorpay Order creation (`/api/razorpay/create-order`) and HMAC SHA256 payment signature verification (`/api/razorpay/verify`).
- **Subscription Tiers**:
  - **Free Tier**: Core workspace features, up to 3 AI trial prompts.
  - **Pro Tier**: Advanced editor capabilities, unlimited AI usage, up to 5 team members ($10/mo or ₹499/mo).
  - **Ultimate Tier**: Unlimited team members, custom domain mapping, 24/7 dedicated support ($25/mo or ₹999/mo).

### 🛡️ 10. Security, Performance & Monitoring
- **Rate Limiting Protection (`lib/ratelimit.ts`)**: `@upstash/ratelimit` integration with sliding-window token bucket fallback protecting API routes (`/api/user/plan`).
- **HTTP Security Headers**: Enforced `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS, and `Permissions-Policy` via `next.config.ts` and `proxy.ts`.
- **Observability & Analytics**: Universal error logging wrapper (`lib/logger.ts`) with Sentry integration and PostHog / Mixpanel event tracking (`lib/analytics.ts`).

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router with React 19)
- **Styling**: Tailwind CSS v4, Lucide React icons, Sonner toast notifications
- **Syntax Highlighting**: `react-syntax-highlighter` (Atom One Dark theme & CJS loader)
- **Interactive Graphics**: OGL (WebGL framework for 3D animated background canvas)
- **Database**: MongoDB (Mongoose models for User, Page, Block, Comment, Revision)
- **Authentication**: NextAuth.js (Credentials + OAuth for Google, GitHub, Apple, Facebook)
- **Payment Gateways**: Stripe Node SDK & Razorpay API (HMAC SHA256 verification)
- **Rate Limiting**: Upstash Redis & In-Memory Sliding Window
- **Containerization**: Multi-stage Docker build (`Dockerfile`)
- **CI/CD**: GitHub Actions workflow (`.github/workflows/ci-cd.yml`)

---

## 🔑 Environment Setup

Copy `.env.example` to create your local `.env` configuration file:

```bash
cp .env.example .env
```

---

## ⚙️ Development & Build Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Lint code
npm run lint

# TypeScript check
npx tsc --noEmit

# Build production bundle
npm run build

# Start production server
npm run start
```
