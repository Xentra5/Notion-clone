# Notion Workspace & Modern SaaS Platform 🚀

A feature-rich, enterprise-grade collaborative workspace application built on **Next.js 16 (App Router)** and **MongoDB**, mimicking the core experience of Notion with real-time block editing, in-browser code execution, multi-view database boards, OpenGraph web bookmarks, Unsplash cover banners, live multi-cursor co-editing, version diff comparison, Notion Calendar, AI assistant, and multi-region payment gateway support (Stripe & Razorpay).

---

## 🌟 Comprehensive Feature Overview

### 🎨 1. Unsplash Cover Banner & Custom Icon Picker Engine
- **Notion-Style Page Header Cover**: Full-width page banner with hover action controls.
- **Unsplash Search & Presets ([app/api/unsplash/route.ts](file:///d:/notion/app/api/unsplash/route.ts))**: Search millions of Unsplash photos directly inside the app, pick from curated HD gradient presets, or submit custom image URLs.
- **Persistent Header State**: Saves cover photo URLs and page icons directly to the MongoDB `Page` schema.

### ⚡ 2. Real-Time Multi-Cursor Co-Editing & Live Presence
- **Remote Cursor Flags ([RemoteCursorOverlay.tsx](file:///d:/notion/components/dashboard/editor/RemoteCursorOverlay.tsx))**: Renders real-time collaborator mouse pointers with custom colored user flags on the document canvas.
- **Multi-Tab Presence Bar ([LivePresenceBar.tsx](file:///d:/notion/components/dashboard/editor/LivePresenceBar.tsx))**: Displays active session avatars at the top bar with live presence pulse indicators.

### 🗄️ 3. Database Multi-View Switcher (Kanban ↔ Timeline ↔ Table)
- **Multi-View Tab Bar ([DatabaseBlock.tsx](file:///d:/notion/components/dashboard/editor/DatabaseBlock.tsx))**: Instant switching between **Board**, **Timeline**, and **Table** database layouts.
- **Kanban Board ([KanbanBoard.tsx](file:///d:/notion/components/dashboard/editor/KanbanBoard.tsx))**: Interactive drag-and-drop Kanban columns with customizable tag colors and inline card creation.
- **Timeline / Gantt Chart ([TimelineView.tsx](file:///d:/notion/components/dashboard/editor/TimelineView.tsx))**: Visual Gantt chart rendering tasks across calendar days.
- **Table View ([TableView.tsx](file:///d:/notion/components/dashboard/editor/TableView.tsx))**: Dynamic database grid supporting inline title editing, status selects, and row management.

### 💻 4. In-Browser Code Runner Sandbox Engine
- **JavaScript & Python Execution ([lib/code-runner.ts](file:///d:/notion/lib/code-runner.ts))**:
  - Sandboxed `Function` eval engine for JavaScript.
  - Pyodide WebAssembly / CDN execution engine for client-side Python execution.
- **Output Console Panel ([CodeBlock.tsx](file:///d:/notion/components/dashboard/editor/CodeBlock.tsx))**: Collapsible bottom output console drawer showing execution timing, `console.log` output, and runtime error tracebacks.
- **70+ Supported Languages**: Syntax highlighting powered by `react-syntax-highlighter` (Atom One Dark theme).

### 🔗 5. OpenGraph Web Bookmarks & File Upload Engine
- **OpenGraph API Scraper ([app/api/scrape-og/route.ts](file:///d:/notion/app/api/scrape-og/route.ts))**: Scrapes title, description, cover image, domain favicon, and site name for pasted links.
- **Web Bookmark Cards ([WebBookmarkBlock.tsx](file:///d:/notion/components/dashboard/editor/WebBookmarkBlock.tsx))**: Renders rich visual link cards with domain favicons and image previews.
- **Local File Upload Engine ([app/api/upload/route.ts](file:///d:/notion/app/api/upload/route.ts) & [FileUploadBlock.tsx](file:///d:/notion/components/dashboard/editor/FileUploadBlock.tsx))**: Drag-and-drop file upload block writing to server storage with download links and file size badges.

### ⌨️ 6. Global Command Palette (`Cmd + K`)
- **Spotlight Search Overlay ([command-palette.tsx](file:///d:/notion/components/dashboard/command-palette.tsx))**: Binds globally to `Cmd + K` / `Ctrl + K`.
- **Instant Workspace Search**: Instant fuzzy search across page titles and block text, recent history jumping, theme toggling, and Notion AI launching.

### 📜 7. Version History Visual Diff Viewer
- **Side-by-Side & Unified Diff ([version-diff-modal.tsx](file:///d:/notion/components/dashboard/modals/version-diff-modal.tsx))**: Visual comparison tool comparing current page content against past revision snapshots.
- **Green / Red Line Highlighting**: Clearly demarcates added blocks (green) and removed/edited blocks (red).
- **One-Click Restoration**: Restore any past version snapshot directly back into the live document canvas.

### 🌿 8. Hierarchical Recursive Sub-Pages
- **Nested Page Links**: Insert `/page` blocks anywhere inside a page to generate child pages.
- **Parent-Child Tree Architecture**: Supports infinite level nesting (`Root → Sub-page → Sub-sub-page`).
- **Circular Reference Safety**: Built-in validation in `/api/pages/[id]` preventing circular parent loops.

### 📄 9. Document & Block-Based Editor
- **Rich Block Types**: Paragraphs, Headings (`H1`, `H2`, `H3`), Bulleted Lists, Numbered Lists, Callouts, Toggle Blocks, Quotes, Dividers, Tables, Web Bookmarks, File Uploads, Kanban Boards, and Code Blocks.
- **Debounced Auto-Save ([use-autosave.ts](file:///d:/notion/hooks/use-autosave.ts))**: Automatic background saving with visual status indicators (`Saving...`, `Saved`).
- **Formatting Bar**: Bold, Italic, Strikethrough, Underline, Code, Text Colors, and Highlight Colors.

### 📅 10. Notion Calendar App (`/dashboard/calendar`)
- **Interactive Views**: Switch seamlessly between **Month**, **Week**, **Day**, and **Agenda** views.
- **Event Lifecycle**: Create, edit, and delete events with date pickers, time selectors, tags, and locations.

### 📥 11. Export & Import Suite
- **Export to Markdown (`.md`)**: One-click export converting page blocks into clean GitHub-flavored Markdown text.
- **PDF Export**: Printable PDF engine formatted with custom typography.
- **Markdown Importer ([import-modal.tsx](file:///d:/notion/components/dashboard/modals/import-modal.tsx))**: Importer parsing `.md` files directly into a new Notion workspace page.

### 🤖 12. Notion AI Assistant & Meeting Notes
- **AI Assistant Modal ([ai-chat-modal.tsx](file:///d:/notion/components/dashboard/modals/ai-chat-modal.tsx))**: Summarize notes, draft outlines, and answer workspace questions.
- **AI Meeting Notes View ([MeetingNoteView.tsx](file:///d:/notion/components/dashboard/editor/MeetingNoteView.tsx))**: Digest meeting transcripts and extract action items.

### 💳 13. Multi-Region Payment Gateways (Stripe + Razorpay)
- **Regional Selection**: Choose between USA / Global (Stripe) and India (Razorpay).
- **Transparent Fee Breakdown**: Renders base subscription costs, regional fee percentages, and net total.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with React 19)
- **Styling**: Tailwind CSS v4, Lucide React icons, Sonner toast notifications
- **Execution Engines**: Pyodide (Python WebAssembly) & Sandboxed JS Function Eval
- **Database**: MongoDB & Mongoose
- **Authentication**: NextAuth.js (Credentials + OAuth)
- **Payment Gateways**: Stripe Node SDK & Razorpay API
- **Code Highlighting**: `react-syntax-highlighter` (Atom One Dark)
- **Graphics**: OGL (WebGL 3D animated canvas)

---

## ⚙️ Development & Build Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Lint code (0 errors)
npm run lint

# TypeScript compilation check
npx tsc --noEmit

# Build production bundle
npm run build
```
