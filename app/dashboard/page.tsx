"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DocumentCanvas } from "@/components/dashboard/document-canvas";
import { createPage } from "@/lib/actions/pages";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTitle] = useState("Getting Started with Notion");

  const handleSelectSubPage = useCallback(
    async (_blockId: string, subPageId?: string, title?: string) => {
      if (subPageId) {
        router.push(`/dashboard/${subPageId}`);
        return;
      }

      try {
        const newPage = await createPage({
          title: title || "Untitled",
          category: "Private",
        });
        window.dispatchEvent(new CustomEvent("page-created", { detail: { page: newPage } }));
        router.push(`/dashboard/${newPage._id}`);
      } catch (err) {
        console.error("Failed to create sub-page:", err);
      }
    },
    [router]
  );

  return (
    <DocumentCanvas
      activeTitle={activeTitle}
      onSelectSubPage={handleSelectSubPage}
    />
  );
}
