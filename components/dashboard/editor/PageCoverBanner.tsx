"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, X, Search, RefreshCw, Palette } from "lucide-react";

interface PageCoverBannerProps {
  url?: string;
  onUpdateCover: (url?: string) => void;
  /** When true, immediately opens the cover picker (used by "Add cover" button) */
  openPicker?: boolean;
  onPickerClosed?: () => void;
}

interface UnsplashItem {
  id: string;
  url: string;
  thumb: string;
  alt: string;
}

// ── Curated gradient presets ────────────────────────────────────────────────
const GRADIENTS = [
  { id: "g1",  label: "Ocean Sunrise",    css: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)" },
  { id: "g2",  label: "Peachy Dusk",      css: "linear-gradient(135deg,#f093fb 0%,#f5576c 100%)" },
  { id: "g3",  label: "Golden Hour",      css: "linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)" },
  { id: "g4",  label: "Arctic Aurora",    css: "linear-gradient(135deg,#a1c4fd 0%,#c2e9fb 100%)" },
  { id: "g5",  label: "Mango Paradise",   css: "linear-gradient(135deg,#f6d365 0%,#fda085 100%)" },
  { id: "g6",  label: "Emerald Pool",     css: "linear-gradient(135deg,#11998e 0%,#38ef7d 100%)" },
  { id: "g7",  label: "Midnight Storm",   css: "linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)" },
  { id: "g8",  label: "Cosmic Dust",      css: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" },
  { id: "g9",  label: "Rose Quartz",      css: "linear-gradient(135deg,#fbc2eb 0%,#a6c1ee 100%)" },
  { id: "g10", label: "Neon City",        css: "linear-gradient(135deg,#12c2e9 0%,#c471ed 50%,#f64f59 100%)" },
  { id: "g11", label: "Forest Mist",      css: "linear-gradient(135deg,#134e5e 0%,#71b280 100%)" },
  { id: "g12", label: "Warm Sunset",      css: "linear-gradient(135deg,#fc4a1a 0%,#f7b733 100%)" },
  { id: "g13", label: "Deep Space",       css: "linear-gradient(135deg,#141e30 0%,#243b55 100%)" },
  { id: "g14", label: "Lavender Dream",   css: "linear-gradient(135deg,#e0c3fc 0%,#8ec5fc 100%)" },
  { id: "g15", label: "Crimson Tide",     css: "linear-gradient(135deg,#642b73 0%,#c6426e 100%)" },
  { id: "g16", label: "Tidal Wave",       css: "linear-gradient(135deg,#43cea2 0%,#185a9d 100%)" },
  { id: "g17", label: "Amber Glow",       css: "linear-gradient(135deg,#f7971e 0%,#ffd200 100%)" },
  { id: "g18", label: "Nordic Fjord",     css: "linear-gradient(135deg,#16bffd 0%,#cb3066 100%)" },
];

// ── Solid color presets ─────────────────────────────────────────────────────
const SOLID_COLORS = [
  { id: "s1",  label: "Slate",       hex: "#1e293b" },
  { id: "s2",  label: "Charcoal",    hex: "#374151" },
  { id: "s3",  label: "Stone",       hex: "#44403c" },
  { id: "s4",  label: "Crimson",     hex: "#991b1b" },
  { id: "s5",  label: "Rust",        hex: "#92400e" },
  { id: "s6",  label: "Forest",      hex: "#14532d" },
  { id: "s7",  label: "Ocean",       hex: "#1e3a5f" },
  { id: "s8",  label: "Violet",      hex: "#4c1d95" },
  { id: "s9",  label: "Rose",        hex: "#881337" },
  { id: "s10", label: "Teal",        hex: "#134e4a" },
  { id: "s11", label: "Midnight",    hex: "#0f172a" },
  { id: "s12", label: "Warm White",  hex: "#faf9f7" },
  { id: "s13", label: "Cream",       hex: "#fef3c7" },
  { id: "s14", label: "Sky",         hex: "#e0f2fe" },
  { id: "s15", label: "Mint",        hex: "#d1fae5" },
  { id: "s16", label: "Lavender",    hex: "#ede9fe" },
  { id: "s17", label: "Blush",       hex: "#fce7f3" },
  { id: "s18", label: "Lemon",       hex: "#fef9c3" },
];

type Tab = "gradients" | "colors" | "unsplash" | "url";

/**
 * Converts a CSS gradient or hex colour to a data-URL so it can be stored
 * in the page `coverImage` field (which expects a URL).
 * We use a tiny inline SVG for gradients and a plain colour for solids.
 */
function gradientToDataUrl(css: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">${cssGradientToStops(css)}</linearGradient></defs><rect width="1200" height="300" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function solidToDataUrl(hex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300"><rect width="1200" height="300" fill="${hex}"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/** Very naive CSS gradient → SVG stop parser — covers our curated list */
function cssGradientToStops(css: string): string {
  const stops: string[] = [];
  const regex = /#[a-f0-9]{3,8}|rgba?\([^)]+\)/gi;
  const matches = css.match(regex) ?? [];
  matches.forEach((color, i) => {
    const offset = matches.length === 1 ? "0%" : `${Math.round((i / (matches.length - 1)) * 100)}%`;
    stops.push(`<stop offset="${offset}" stop-color="${color}"/>`);
  });
  return stops.join("");
}

export function PageCoverBanner({
  url,
  onUpdateCover,
  openPicker = false,
  onPickerClosed,
}: PageCoverBannerProps) {
  const [showModal, setShowModal] = useState(openPicker);
  const [tab, setTab] = useState<Tab>("gradients");
  const [searchQuery, setSearchQuery] = useState("");
  const [unsplashItems, setUnsplashItems] = useState<UnsplashItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  // Sync external openPicker prop
  useEffect(() => {
    if (openPicker) setShowModal(true);
  }, [openPicker]);

  const fetchUnsplash = (q = "") => {
    setLoading(true);
    fetch(`/api/unsplash?query=${encodeURIComponent(q || "nature landscape")}`)
      .then((r) => r.json())
      .then((d) => { if (d.results) setUnsplashItems(d.results); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (showModal && tab === "unsplash" && unsplashItems.length === 0) {
      fetchUnsplash();
    }
  }, [showModal, tab, unsplashItems.length]);

  function closeModal() {
    setShowModal(false);
    onPickerClosed?.();
  }

  function applyGradient(css: string) {
    onUpdateCover(gradientToDataUrl(css));
    closeModal();
  }

  function applySolid(hex: string) {
    onUpdateCover(solidToDataUrl(hex));
    closeModal();
  }

  function applyUnsplash(itemUrl: string) {
    onUpdateCover(itemUrl);
    closeModal();
  }

  function applyCustomUrl() {
    if (!customUrl.trim()) return;
    onUpdateCover(customUrl.trim());
    closeModal();
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "gradients", label: "Gradients" },
    { id: "colors",    label: "Colors" },
    { id: "unsplash",  label: "Unsplash" },
    { id: "url",       label: "URL" },
  ];

  return (
    <>
      {/* ── Cover display (only rendered when url is set) ─────────────────── */}
      {url && (
        <div className="relative group/cover w-full h-44 sm:h-52 md:h-64 overflow-hidden select-none">
          {/* Render data-URL backgrounds as CSS background-image to support gradients */}
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url('${url}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Hover action buttons */}
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
        </div>
      )}

      {/* ── Cover Picker Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-2xl bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-sans text-popover-foreground">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-neutral-50/50 dark:bg-[#1b1b1b] shrink-0">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-foreground/70" />
                <span className="text-sm font-semibold text-foreground">Page Cover</span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex items-center border-b border-border px-4 bg-neutral-50/30 dark:bg-[#161616] shrink-0">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition mr-1 ${
                    tab === t.id
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-4">

              {/* Gradients */}
              {tab === "gradients" && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => applyGradient(g.css)}
                      title={g.label}
                      className="group/item relative h-20 rounded-xl overflow-hidden border border-border hover:border-blue-500 hover:scale-[1.03] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ background: g.css }}
                    >
                      <span className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] font-medium py-0.5 px-1.5 opacity-0 group-hover/item:opacity-100 transition truncate text-center">
                        {g.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Solid colors */}
              {tab === "colors" && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                  {SOLID_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => applySolid(c.hex)}
                      title={c.label}
                      className="group/item relative h-16 rounded-xl overflow-hidden border border-border hover:border-blue-500 hover:scale-[1.04] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: c.hex }}
                    >
                      <span className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] font-medium py-0.5 opacity-0 group-hover/item:opacity-100 transition truncate text-center">
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Unsplash */}
              {tab === "unsplash" && (
                <div className="space-y-3">
                  <form
                    onSubmit={(e) => { e.preventDefault(); fetchUnsplash(searchQuery); }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-accent/30">
                      <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Unsplash (nature, abstract, city…)"
                        className="w-full text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                    >
                      Search
                    </button>
                  </form>

                  {loading ? (
                    <div className="py-10 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Loading…</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5">
                      {unsplashItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => applyUnsplash(item.url)}
                          className="group/item relative h-24 rounded-xl overflow-hidden border border-border hover:border-blue-500 hover:scale-[1.02] transition-all duration-150"
                        >
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
              )}

              {/* Custom URL */}
              {tab === "url" && (
                <div className="space-y-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    Paste any direct image URL — JPEG, PNG, WebP or GIF.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") applyCustomUrl(); }}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-accent/30 outline-none text-foreground focus:border-blue-500 transition"
                    />
                    <button
                      type="button"
                      disabled={!customUrl.trim()}
                      onClick={applyCustomUrl}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-40 transition"
                    >
                      Apply
                    </button>
                  </div>
                  {customUrl.trim() && (
                    <div className="mt-3 h-28 rounded-xl overflow-hidden border border-border">
                      <img
                        src={customUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
