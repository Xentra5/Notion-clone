"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Download, Loader2 } from "lucide-react";

interface FileUploadBlockProps {
  url?: string;
  fileName?: string;
  fileSize?: string;
  onUpdateFile?: (url: string, name: string, size?: string) => void;
}

export function FileUploadBlock({
  url,
  fileName,
  fileSize,
  onUpdateFile,
}: FileUploadBlockProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file || !onUpdateFile) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        onUpdateFile(data.url, data.fileName, data.fileSize);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleUpload(e.dataTransfer.files[0]);
    }
  };

  if (!url && !isUploading) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`my-2 p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 select-none ${
          dragActive
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-foreground/15 hover:border-foreground/30 bg-foreground/[0.02] dark:bg-foreground/[0.03]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              void handleUpload(e.target.files[0]);
            }
          }}
        />
        <div className="p-3 rounded-full bg-foreground/5 text-foreground/60">
          <Upload className="h-5 w-5" />
        </div>
        <div className="text-center">
          <span className="text-xs font-semibold text-foreground">Click to upload</span>
          <span className="text-xs text-muted-foreground"> or drag and drop file here</span>
        </div>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="my-2 px-4 py-3 rounded-xl border border-foreground/10 bg-foreground/[0.02] flex items-center gap-3">
        <Loader2 className="h-4 w-4 text-primary animate-spin" />
        <span className="text-xs text-foreground font-medium">Uploading file to workspace…</span>
      </div>
    );
  }

  return (
    <div className="my-2 px-4 py-3 rounded-xl border border-foreground/10 bg-foreground/[0.02] dark:bg-foreground/[0.03] flex items-center justify-between group hover:border-foreground/20 transition select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground truncate">{fileName || "Uploaded File"}</div>
          {fileSize && <div className="text-[11px] text-muted-foreground">{fileSize}</div>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href={url}
          download={fileName || true}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-medium transition"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download</span>
        </a>
      </div>
    </div>
  );
}
