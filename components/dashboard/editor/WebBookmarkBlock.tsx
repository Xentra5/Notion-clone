"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Globe, Loader2 } from "lucide-react";

interface WebBookmarkBlockProps {
  url?: string;
  onUpdateUrl?: (url: string) => void;
}

interface OgData {
  url: string;
  title: string;
  description: string;
  image: string;
  favicon: string;
  domain: string;
}

export function WebBookmarkBlock({ url, onUpdateUrl }: WebBookmarkBlockProps) {
  const [inputUrl, setInputUrl] = useState(url || "");
  const [loading, setLoading] = useState(false);
  const [ogData, setOgData] = useState<OgData | null>(null);

  useEffect(() => {
    if (!url) return;
    let isCancelled = false;
    queueMicrotask(() => setLoading(true));

    fetch(`/api/scrape-og?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.title) setOgData(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [url]);

  const handleCreateBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !onUpdateUrl) return;
    onUpdateUrl(inputUrl.trim());
  };

  if (!url) {
    return (
      <form onSubmit={handleCreateBookmark} className="my-1.5 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-foreground/10 bg-foreground/[0.02] dark:bg-foreground/[0.03]">
          <Globe className="h-4 w-4 text-foreground/40 shrink-0" />
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste web link to create bookmark..."
            className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-foreground/30 font-sans"
          />
        </div>
        <button
          type="submit"
          disabled={!inputUrl.trim()}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition"
        >
          Create bookmark
        </button>
      </form>
    );
  }

  if (loading) {
    return (
      <div className="my-2 p-4 rounded-xl border border-foreground/10 bg-foreground/[0.02] flex items-center gap-3">
        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        <span className="text-xs text-muted-foreground font-medium">Fetching bookmark metadata…</span>
      </div>
    );
  }

  const title = ogData?.title || url;
  const description = ogData?.description;
  const image = ogData?.image;
  const domain = ogData?.domain || url;
  const favicon = ogData?.favicon;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-2 group block rounded-xl border border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] dark:bg-foreground/[0.03] dark:hover:bg-foreground/[0.06] transition-all overflow-hidden select-none"
    >
      <div className="flex items-stretch min-h-[96px]">
        {/* Left info column */}
        <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground group-hover:text-primary transition line-clamp-1">
              {title}
            </div>
            {description && (
              <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 pt-1 text-[11px] text-muted-foreground">
            {favicon ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={favicon} alt="" className="h-3.5 w-3.5 rounded shrink-0 object-contain" />
            ) : (
              <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            )}
            <span className="truncate font-medium">{domain}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-muted-foreground ml-auto shrink-0" />
          </div>
        </div>

        {/* Optional Right Cover Image */}
        {image && (
          <div className="w-36 sm:w-44 shrink-0 bg-foreground/5 relative overflow-hidden border-l border-foreground/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
      </div>
    </a>
  );
}
