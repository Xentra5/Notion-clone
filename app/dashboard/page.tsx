"use client";

import { useState } from "react";
import { DocumentCanvas } from "@/components/dashboard/document-canvas";

// The Sidebar, TopBar, AI panel, and modals live in app/dashboard/layout.tsx.
// This page only renders the main content area (the canvas).
export default function DashboardPage() {
  const [activeTitle] = useState("Getting Started with Notion");

  return (
    <DocumentCanvas
      activeTitle={activeTitle}
      onOpenAi={() => window.dispatchEvent(new Event("open-quick-ai"))}
      onSelectSubPage={() => {}}
    />
  );
}

