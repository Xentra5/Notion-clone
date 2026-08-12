"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, X, Search, RefreshCw } from "lucide-react";

interface PageCoverBannerProps {
  url?: string;
  onUpdateCover: (url?: string) => void;
}

interface CoverItem {
  id: string;
  url: string;
  thumb: string;
  alt: string;
}

export function PageCoverBanner({ url, onUpdateCover }: PageCoverBannerProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [covers, setCovers] = useState<CoverItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const fetchCovers = (q = "") => {
    setLoading(true);
    fetch(`/api/unsplash?query=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) setCovers(data.results);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (showModal && covers.length === 0) {
      queueMicrotask(() => {
        fetchCovers();
      });
    }
  }, [showModal, covers.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCovers(searchQuery);
  };

  if (!url) return null;

  return (
    <div className="relative group/cover w-full h-44 sm:h-52 md:h-64 overflow-hidden select-none bg-foreground/5">
      {/* Cover Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Page Cover Banner"
        className="w-full h-full object-cover transition-all duration-300"
      />

      {/* Hover Action Buttons */}
      <div className="absolute right-4 bottom-3 flex items-center gap-1.5 opacity-0 group-hover/cover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/80 hover:bg-background backdrop-blur-md border border-foreground/10 text-foreground text-xs font-semibold shadow-sm transition"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Change cover</span>
        </button>

        <button
          type="button"
          onClick={() => onUpdateCover(undefined)}
          className="p-1.5 rounded-lg bg-background/80 hover:bg-red-500 hover:text-white backdrop-blur-md border border-foreground/10 text-muted-foreground transition"
          title="Remove cover"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Change Cover Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-foreground/10">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Select Banner Cover</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Unsplash Search Form */}
            <div className="p-4 border-b border-foreground/10 bg-foreground/[0.02]">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-foreground/15 bg-background">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Unsplash (e.g. nature, minimalist, abstract)…"
                    className="w-full text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Custom URL Input */}
            <div className="px-4 py-2 border-b border-foreground/10 flex items-center gap-2">
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Or paste custom image URL…"
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-foreground/15 bg-background outline-none text-foreground"
              />
              <button
                type="button"
                disabled={!customUrl.trim()}
                onClick={() => {
                  onUpdateCover(customUrl.trim());
                  setShowModal(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-foreground/10 hover:bg-foreground/15 text-foreground text-xs font-semibold disabled:opacity-40 transition"
              >
                Submit URL
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="p-4 overflow-y-auto flex-1 min-h-[220px]">
              {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  <span>Loading covers…</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {covers.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onUpdateCover(item.url);
                        setShowModal(false);
                      }}
                      className="group/item relative h-24 rounded-xl overflow-hidden border border-foreground/10 hover:border-primary transition focus:outline-none"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumb}
                        alt={item.alt}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-200"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
