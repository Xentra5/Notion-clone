"use client";

import { useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { markdownToBlocks } from "@/lib/export-import";
import { createPage } from "@/lib/actions/pages";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const { title, blocks } = markdownToBlocks(text);

      const newPage = await createPage({
        title: title || file.name.replace(/\.md$/i, ""),
        icon: "📄",
        blocks: blocks as any,
      });

      toast.success("Markdown page imported successfully!");
      onClose();
      if (newPage?._id) {
        router.push(`/dashboard/${newPage._id}`);
      }
    } catch (err) {
      console.error("Import error:", err);
      toast.error("Failed to import Markdown file");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-text">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl animate-in zoom-in-95 duration-150 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Import Markdown File</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition cursor-pointer relative bg-background/50">
          <input
            type="file"
            accept=".md,.txt"
            onChange={handleFileUpload}
            disabled={isImporting}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-accent text-foreground">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-foreground">
              {isImporting ? "Importing document..." : "Click or drag & drop .md file here"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Supports standard Markdown (.md) documents
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
