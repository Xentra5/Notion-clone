"use client";

import { useState, useRef } from "react";
import {
  Globe,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  X,
  Link as LinkIcon,
  Layers,
  Play,
  Code2,
  LayoutDashboard,
} from "lucide-react";

type EmbedProvider =
  | "figma"
  | "youtube"
  | "codepen"
  | "codesandbox"
  | "google_docs"
  | "google_slides"
  | "google_maps"
  | "loom"
  | "airtable"
  | "typeform"
  | "excalidraw"
  | "generic";

interface EmbedMeta {
  label: string;
  icon: React.ReactNode;
  color: string;
  transform: (url: string) => string | null;
  placeholder: string;
}

function detectProvider(url: string): EmbedProvider {
  if (/figma\.com/.test(url)) return "figma";
  if (/youtu\.be|youtube\.com/.test(url)) return "youtube";
  if (/codepen\.io/.test(url)) return "codepen";
  if (/codesandbox\.io/.test(url)) return "codesandbox";
  if (/docs\.google\.com\/document/.test(url)) return "google_docs";
  if (/docs\.google\.com\/presentation/.test(url)) return "google_slides";
  if (/maps\.google\.com|google\.com\/maps/.test(url)) return "google_maps";
  if (/loom\.com/.test(url)) return "loom";
  if (/airtable\.com/.test(url)) return "airtable";
  if (/typeform\.com/.test(url)) return "typeform";
  if (/excalidraw\.com/.test(url)) return "excalidraw";
  return "generic";
}

const EMBED_META: Record<EmbedProvider, EmbedMeta> = {
  figma: {
    label: "Figma",
    icon: <Layers className="h-4 w-4" />,
    color: "text-purple-500",
    placeholder: "Paste a Figma design or prototype URL...",
    transform: (url) => {
      const encoded = encodeURIComponent(url);
      return `https://www.figma.com/embed?embed_host=notion&url=${encoded}`;
    },
  },
  youtube: {
    label: "YouTube",
    icon: <Play className="h-4 w-4" />,
    color: "text-red-500",
    placeholder: "Paste a YouTube video URL...",
    transform: (url) => {
      let id = "";
      const short = url.match(/youtu\.be\/([^?&]+)/);
      const long = url.match(/[?&]v=([^?&]+)/);
      if (short) id = short[1];
      else if (long) id = long[1];
      else return null;
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    },
  },
  codepen: {
    label: "CodePen",
    icon: <Code2 className="h-4 w-4" />,
    color: "text-emerald-500",
    placeholder: "Paste a CodePen URL...",
    transform: (url) => {
      const match = url.match(/codepen\.io\/([^/]+)\/pen\/([^/?]+)/);
      if (!match) return null;
      return `https://codepen.io/${match[1]}/embed/${match[2]}?default-tab=result&theme-id=dark`;
    },
  },
  codesandbox: {
    label: "CodeSandbox",
    icon: <Code2 className="h-4 w-4" />,
    color: "text-yellow-500",
    placeholder: "Paste a CodeSandbox URL...",
    transform: (url) => {
      return url.replace("codesandbox.io/s/", "codesandbox.io/embed/");
    },
  },
  google_docs: {
    label: "Google Docs",
    icon: <LayoutDashboard className="h-4 w-4" />,
    color: "text-blue-500",
    placeholder: "Paste a Google Docs URL...",
    transform: (url) => {
      if (url.includes("/edit")) return url.replace("/edit", "/preview");
      return url;
    },
  },
  google_slides: {
    label: "Google Slides",
    icon: <LayoutDashboard className="h-4 w-4" />,
    color: "text-amber-500",
    placeholder: "Paste a Google Slides URL...",
    transform: (url) => {
      if (url.includes("/edit")) return url.replace("/edit", "/embed");
      return url;
    },
  },
  google_maps: {
    label: "Google Maps",
    icon: <Globe className="h-4 w-4" />,
    color: "text-green-500",
    placeholder: "Paste a Google Maps URL...",
    transform: (url) => url,
  },
  loom: {
    label: "Loom",
    icon: <Globe className="h-4 w-4" />,
    color: "text-violet-500",
    placeholder: "Paste a Loom video URL...",
    transform: (url) => {
      const match = url.match(/loom\.com\/share\/([^?]+)/);
      if (!match) return null;
      return `https://www.loom.com/embed/${match[1]}`;
    },
  },
  airtable: {
    label: "Airtable",
    icon: <Globe className="h-4 w-4" />,
    color: "text-teal-500",
    placeholder: "Paste an Airtable URL...",
    transform: (url) => url,
  },
  typeform: {
    label: "Typeform",
    icon: <Globe className="h-4 w-4" />,
    color: "text-pink-500",
    placeholder: "Paste a Typeform URL...",
    transform: (url) => url,
  },
  excalidraw: {
    label: "Excalidraw",
    icon: <Globe className="h-4 w-4" />,
    color: "text-orange-500",
    placeholder: "Paste an Excalidraw URL...",
    transform: (url) => url,
  },
  generic: {
    label: "Website",
    icon: <Globe className="h-4 w-4" />,
    color: "text-foreground/60",
    placeholder: "Paste any URL to embed...",
    transform: (url) => url,
  },
};

const QUICK_EMBEDS = [
  { label: "Figma", provider: "figma" as EmbedProvider },
  { label: "YouTube", provider: "youtube" as EmbedProvider },
  { label: "CodePen", provider: "codepen" as EmbedProvider },
  { label: "CodeSandbox", provider: "codesandbox" as EmbedProvider },
  { label: "Google Docs", provider: "google_docs" as EmbedProvider },
  { label: "Google Slides", provider: "google_slides" as EmbedProvider },
  { label: "Loom", provider: "loom" as EmbedProvider },
  { label: "Excalidraw", provider: "excalidraw" as EmbedProvider },
];

interface IframeEmbedBlockProps {
  url?: string;
  onUpdateUrl?: (url: string) => void;
}

export function IframeEmbedBlock({ url: initialUrl, onUpdateUrl }: IframeEmbedBlockProps) {
  const [inputUrl, setInputUrl] = useState(initialUrl || "");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [provider, setProvider] = useState<EmbedProvider>("generic");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [height, setHeight] = useState(420);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize from saved URL
  useState(() => {
    if (initialUrl) {
      handleEmbed(initialUrl);
    }
  });

  function handleEmbed(url?: string) {
    const target = url || inputUrl.trim();
    if (!target) return;

    let normalized = target;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = "https://" + normalized;
    }

    const det = detectProvider(normalized);
    const meta = EMBED_META[det];
    const transformed = meta.transform(normalized);

    setProvider(det);
    setIsLoading(true);
    setError(null);

    if (!transformed) {
      setError(`Could not convert this ${meta.label} URL to an embed. Try copying the share link.`);
      setIsLoading(false);
      return;
    }

    setEmbedUrl(transformed);
    setInputUrl(normalized);
    onUpdateUrl?.(normalized);
  }

  const handleRemove = () => {
    setEmbedUrl(null);
    setInputUrl("");
    onUpdateUrl?.("");
  };

  const handleReload = () => {
    setReloadKey((k) => k + 1);
    setIsLoading(true);
  };

  const meta = EMBED_META[provider];

  if (!embedUrl) {
    return (
      <div className="my-3 rounded-2xl border-2 border-dashed border-foreground/10 hover:border-foreground/20 transition-all bg-foreground/[0.01] hover:bg-foreground/[0.025]">
        {/* Quick embed pills */}
        <div className="flex items-center gap-2 flex-wrap px-4 pt-4 pb-2">
          <Globe className="h-4 w-4 text-foreground/30 shrink-0" />
          <span className="text-xs text-foreground/40 font-medium">Quick embed:</span>
          {QUICK_EMBEDS.map((q) => {
            const m = EMBED_META[q.provider];
            return (
              <button
                key={q.provider}
                type="button"
                onClick={() => {
                  const placeholder = prompt(`Paste your ${q.label} URL:`);
                  if (placeholder) {
                    setInputUrl(placeholder);
                    handleEmbed(placeholder);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-foreground/10 hover:border-foreground/25 bg-white dark:bg-[#1a1a1a] hover:bg-foreground/[0.04] transition-all ${m.color}`}
              >
                {m.icon}
                {q.label}
              </button>
            );
          })}
        </div>

        {/* URL input */}
        <div className="flex items-center gap-2 px-4 pb-4 pt-1">
          <div className="flex flex-1 items-center gap-2 bg-white dark:bg-[#111] border border-foreground/10 rounded-xl px-3 py-2 focus-within:border-blue-500/50 transition-colors">
            <LinkIcon className="h-4 w-4 text-foreground/30 shrink-0" />
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmbed()}
              placeholder="Paste any URL to embed (Figma, YouTube, CodePen, Loom...)"
              className="flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground/30"
            />
          </div>
          <button
            type="button"
            onClick={() => handleEmbed()}
            disabled={!inputUrl.trim()}
            className="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Embed
          </button>
        </div>

        {error && (
          <div className="mx-4 mb-4 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`my-3 rounded-2xl border border-foreground/10 overflow-hidden shadow-sm transition-all ${
        isFullscreen ? "fixed inset-4 z-[100] shadow-2xl rounded-3xl" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/90 dark:bg-[#111]/90 backdrop-blur-sm border-b border-foreground/[0.07]">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`${meta.color} shrink-0`}>{meta.icon}</div>
          <span className="text-[13px] font-semibold text-foreground/80 shrink-0">{meta.label}</span>
          <span className="text-xs text-foreground/30 truncate max-w-[240px]">{inputUrl}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {isLoading && <RefreshCw className="h-3.5 w-3.5 text-foreground/30 animate-spin mr-1" />}
          <button type="button" onClick={handleReload} title="Reload" className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/[0.06] transition-all">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <a href={inputUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab" className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/[0.06] transition-all">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button type="button" onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"} className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/[0.06] transition-all">
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button type="button" onClick={handleRemove} title="Remove embed" className="p-1.5 rounded-lg text-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-all">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div
        className="relative bg-white dark:bg-[#141414]"
        style={{ height: isFullscreen ? "calc(100% - 45px)" : height }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3 text-foreground/40">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="text-sm">Loading {meta.label}...</span>
            </div>
          </div>
        )}
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError("Could not load this embed. The site may block iframe embedding.");
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
          title={`${meta.label} embed`}
        />
      </div>

      {/* Resize handle */}
      {!isFullscreen && (
        <div
          className="flex items-center justify-center h-4 bg-foreground/[0.02] hover:bg-foreground/[0.05] cursor-ns-resize group/resize border-t border-foreground/[0.05] transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            const startY = e.clientY;
            const startH = height;
            const onMove = (me: MouseEvent) => setHeight(Math.max(200, Math.min(900, startH + (me.clientY - startY))));
            const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
          }}
        >
          <div className="w-8 h-0.5 rounded-full bg-foreground/20 group-hover/resize:bg-foreground/40 transition-colors" />
        </div>
      )}
    </div>
  );
}
