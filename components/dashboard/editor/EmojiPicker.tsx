"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, Shuffle, Sparkles, Shapes, Smile, Layers } from "lucide-react";
import { MODERN_LOGOS, MODERN_ICONS, ALL_CUSTOM_ICONS } from "../icon-registry";
import { PageIcon } from "../page-icon";

interface EmojiPickerProps {
  emoji: string;
  onSelect: (emoji: string) => void;
}

export const EMOJI_CATEGORIES = [
  {
    name: "Documents & Office",
    emojis: [
      { char: "📄", tags: ["document", "file", "page", "paper"] },
      { char: "📝", tags: ["note", "memo", "write", "pencil"] },
      { char: "📋", tags: ["clipboard", "task", "list"] },
      { char: "📁", tags: ["folder", "directory", "archive"] },
      { char: "📂", tags: ["open folder", "directory"] },
      { char: "📑", tags: ["tabs", "bookmark", "documents"] },
      { char: "📊", tags: ["chart", "stats", "graph", "bar"] },
      { char: "📈", tags: ["chart", "growth", "trend", "up"] },
      { char: "📉", tags: ["chart", "down", "trend"] },
      { char: "📌", tags: ["pin", "pushpin", "location"] },
      { char: "🗂️", tags: ["index", "divider", "card", "organize"] },
      { char: "🗃️", tags: ["file box", "storage", "archive"] },
      { char: "📦", tags: ["package", "box", "shipping"] },
      { char: "🏷️", tags: ["tag", "label", "price", "category"] },
      { char: "🗄️", tags: ["filing", "cabinet", "cabinet"] },
      { char: "📜", tags: ["scroll", "ancient", "history", "paper"] },
      { char: "🔖", tags: ["bookmark", "mark", "tag"] },
      { char: "📎", tags: ["paperclip", "attach", "link"] },
      { char: "🗞️", tags: ["newspaper", "news", "press"] },
      { char: "📬", tags: ["mailbox", "mail", "inbox"] },
      { char: "✉️", tags: ["envelope", "email", "letter"] },
      { char: "📒", tags: ["ledger", "yellow", "notebook"] },
      { char: "📓", tags: ["notebook", "cover"] },
      { char: "📕", tags: ["red book", "documentation"] },
      { char: "📗", tags: ["green book", "guide"] },
    ],
  },
  {
    name: "Productivity & Goals",
    emojis: [
      { char: "🚀", tags: ["rocket", "launch", "ship", "fast"] },
      { char: "⚡", tags: ["lightning", "zap", "quick", "energy"] },
      { char: "💡", tags: ["idea", "lightbulb", "inspire", "bright"] },
      { char: "🎯", tags: ["target", "bullseye", "goal", "okr"] },
      { char: "🔥", tags: ["fire", "streak", "hot", "trending"] },
      { char: "✨", tags: ["sparkles", "magic", "clean", "ai"] },
      { char: "⭐", tags: ["star", "favorite", "rate"] },
      { char: "🏆", tags: ["trophy", "win", "achievement", "award"] },
      { char: "📅", tags: ["calendar", "date", "schedule"] },
      { char: "⏱️", tags: ["stopwatch", "timer", "speed"] },
      { char: "⏳", tags: ["hourglass", "time", "wait"] },
      { char: "🧭", tags: ["compass", "explore", "guide"] },
      { char: "🏁", tags: ["finish flag", "race", "complete"] },
      { char: "🎖️", tags: ["medal", "military", "honor"] },
      { char: "🥇", tags: ["first place", "gold", "winner"] },
      { char: "💎", tags: ["gem", "diamond", "premium", "valuable"] },
      { char: "🌟", tags: ["glowing star", "featured"] },
      { char: "🏹", tags: ["bow and arrow", "aim"] },
      { char: "♟️", tags: ["chess", "strategy", "tactic"] },
      { char: "🎲", tags: ["dice", "game", "chance", "random"] },
      { char: "🧩", tags: ["puzzle", "piece", "problem"] },
      { char: "🗝️", tags: ["old key", "secret"] },
      { char: "🔔", tags: ["bell", "notification", "alert"] },
      { char: "📣", tags: ["megaphone", "announcement", "shout"] },
      { char: "🔮", tags: ["crystal ball", "fortune", "future"] },
    ],
  },
  {
    name: "Tech & Science",
    emojis: [
      { char: "💻", tags: ["laptop", "computer", "dev", "tech"] },
      { char: "🤖", tags: ["robot", "ai", "bot", "automate"] },
      { char: "🧠", tags: ["brain", "intelligence", "neural", "smart"] },
      { char: "⚙️", tags: ["gear", "settings", "engine", "config"] },
      { char: "🛠️", tags: ["tools", "hammer", "wrench", "build"] },
      { char: "🔒", tags: ["lock", "security", "secure", "private"] },
      { char: "🔑", tags: ["key", "auth", "access", "password"] },
      { char: "🔍", tags: ["magnifying glass", "search", "inspect"] },
      { char: "📱", tags: ["mobile", "phone", "iphone", "app"] },
      { char: "🌐", tags: ["web", "globe", "internet", "world"] },
      { char: "🖥️", tags: ["desktop", "monitor", "screen"] },
      { char: "🕹️", tags: ["joystick", "game", "gaming"] },
      { char: "🔌", tags: ["plug", "power", "integration", "adapter"] },
      { char: "🛰️", tags: ["satellite", "orbit", "space"] },
      { char: "🧪", tags: ["test tube", "experiment", "lab"] },
      { char: "📡", tags: ["radar", "broadcast", "antenna"] },
      { char: "🔋", tags: ["battery", "charge", "power"] },
      { char: "💾", tags: ["floppy disk", "save", "data"] },
      { char: "💿", tags: ["cd", "disk", "media"] },
      { char: "🖨️", tags: ["printer", "print"] },
      { char: "🔬", tags: ["microscope", "science", "research"] },
      { char: "🧬", tags: ["dna", "genetics", "biology"] },
      { char: "🔭", tags: ["telescope", "astronomy", "vision"] },
      { char: "⌨️", tags: ["keyboard", "typing"] },
      { char: "🖱️", tags: ["mouse", "click"] },
    ],
  },
  {
    name: "Design & Media",
    emojis: [
      { char: "🎨", tags: ["palette", "art", "design", "paint"] },
      { char: "🎬", tags: ["clapperboard", "movie", "video", "film"] },
      { char: "📸", tags: ["camera", "photo", "shot"] },
      { char: "🎵", tags: ["music note", "audio", "sound"] },
      { char: "🎧", tags: ["headphones", "music", "listen"] },
      { char: "🖌️", tags: ["brush", "artist", "paint"] },
      { char: "📐", tags: ["triangular ruler", "measure", "math"] },
      { char: "🖋️", tags: ["fountain pen", "signature", "calligraphy"] },
      { char: "🎭", tags: ["theater", "masks", "drama", "creative"] },
      { char: "🎪", tags: ["circus tent", "carnival"] },
      { char: "🎙️", tags: ["studio mic", "podcast", "voice"] },
      { char: "📻", tags: ["radio", "broadcast"] },
      { char: "📹", tags: ["camcorder", "record", "stream"] },
      { char: "🪄", tags: ["magic wand", "wizard", "magic"] },
      { char: "🖍️", tags: ["crayon", "draw"] },
      { char: "🎹", tags: ["piano keyboard", "chords"] },
      { char: "🎸", tags: ["guitar", "rock", "strings"] },
      { char: "🧵", tags: ["thread", "craft", "tailor"] },
      { char: "🖼️", tags: ["framed picture", "art", "gallery"] },
      { char: "🎞️", tags: ["film frames", "cinema"] },
    ],
  },
  {
    name: "Work & Life",
    emojis: [
      { char: "☕", tags: ["coffee", "tea", "break", "morning"] },
      { char: "💼", tags: ["briefcase", "work", "business", "job"] },
      { char: "🏢", tags: ["office building", "company", "corp"] },
      { char: "👥", tags: ["people", "team", "community", "users"] },
      { char: "💬", tags: ["speech bubble", "chat", "talk"] },
      { char: "🎓", tags: ["graduation cap", "education", "school"] },
      { char: "🌱", tags: ["seedling", "growth", "nature", "plant"] },
      { char: "🌍", tags: ["earth", "globe", "planet", "international"] },
      { char: "🎉", tags: ["party popper", "celebrate", "launch"] },
      { char: "🤝", tags: ["handshake", "deal", "partner", "agreement"] },
      { char: "💰", tags: ["money bag", "revenue", "finance", "cash"] },
      { char: "💳", tags: ["credit card", "payment", "bank"] },
      { char: "🏦", tags: ["bank", "institution", "finance"] },
      { char: "🏛️", tags: ["classical building", "policy", "gov"] },
      { char: "⚖️", tags: ["balance scale", "legal", "justice", "law"] },
      { char: "🗺️", tags: ["world map", "roadmap", "travel"] },
      { char: "🥂", tags: ["cheers", "glasses", "celebration"] },
      { char: "🍕", tags: ["pizza", "food", "dinner"] },
      { char: "🌴", tags: ["palm tree", "vacation", "chill"] },
      { char: "⛺", tags: ["tent", "camping", "retreat"] },
    ],
  },
];

export function EmojiPicker({ emoji }: EmojiPickerProps) {
  return (
    <div className="relative group/emoji">
      <button
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="text-4xl p-1.5 rounded-xl hover:bg-accent transition inline-flex items-center justify-center select-none cursor-pointer"
        title="Change icon"
      >
        <PageIcon icon={emoji} className="w-10 h-10 text-4xl" />
      </button>
    </div>
  );
}

interface EmojiDropdownProps {
  onSelect: (icon: string) => void;
  onClose: () => void;
}

type TabType = "logos" | "icons" | "emojis";

export function EmojiDropdown({ onSelect, onClose }: EmojiDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>("logos");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    // Focus search on open
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  // Filtered logos
  const filteredLogos = useMemo(() => {
    if (!query) return MODERN_LOGOS;
    return MODERN_LOGOS.filter(
      (l) =>
        l.name.toLowerCase().includes(query) ||
        l.tags.some((t) => t.toLowerCase().includes(query))
    );
  }, [query]);

  // Filtered icons
  const filteredIcons = useMemo(() => {
    if (!query) return MODERN_ICONS;
    return MODERN_ICONS.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        i.tags.some((t) => t.toLowerCase().includes(query))
    );
  }, [query]);

  // Filtered emojis
  const filteredEmojis = useMemo(() => {
    if (!query) return EMOJI_CATEGORIES;
    return EMOJI_CATEGORIES.map((cat) => ({
      name: cat.name,
      emojis: cat.emojis.filter(
        (e) =>
          e.char.includes(query) ||
          e.tags.some((t) => t.toLowerCase().includes(query))
      ),
    })).filter((cat) => cat.emojis.length > 0);
  }, [query]);

  // Handle random pick
  const handleRandomPick = () => {
    const allOptions = [
      ...MODERN_LOGOS.map((l) => l.id),
      ...MODERN_ICONS.map((i) => i.id),
      ...EMOJI_CATEGORIES.flatMap((c) => c.emojis.map((e) => e.char)),
    ];
    const randomIndex = Math.floor(Math.random() * allOptions.length);
    const chosen = allOptions[randomIndex];
    onSelect(chosen);
    onClose();
  };

  // Handle remove icon (revert to default document)
  const handleRemove = () => {
    onSelect("📄");
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="absolute left-0 top-full mt-2 w-80 sm:w-96 p-3 bg-popover/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl z-[9999] animate-in zoom-in-95 duration-100 space-y-3"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Choose Page Icon
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRandomPick}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-accent transition cursor-pointer"
            title="Pick a random icon"
          >
            <Shuffle className="h-3 w-3" />
            <span>Random</span>
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] font-medium text-muted-foreground hover:text-destructive px-2 py-1 rounded-md hover:bg-destructive/10 transition cursor-pointer"
            title="Reset to default icon"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search logos, icons, emojis..."
          className="w-full bg-muted/60 hover:bg-muted/80 focus:bg-background border border-border/60 focus:border-primary/60 rounded-xl pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-2 p-0.5 text-muted-foreground hover:text-foreground rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-border/40">
        <button
          type="button"
          onClick={() => setActiveTab("logos")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === "logos"
              ? "bg-background text-foreground shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Logos & Tech</span>
          <span className="text-[10px] text-muted-foreground/70 ml-0.5">({MODERN_LOGOS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("icons")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === "icons"
              ? "bg-background text-foreground shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shapes className="h-3.5 w-3.5 text-blue-500" />
          <span>Icons</span>
          <span className="text-[10px] text-muted-foreground/70 ml-0.5">({MODERN_ICONS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("emojis")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === "emojis"
              ? "bg-background text-foreground shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Smile className="h-3.5 w-3.5 text-emerald-500" />
          <span>Emojis</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="max-h-64 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
        {/* LOGOS TAB */}
        {activeTab === "logos" && (
          <div className="space-y-1">
            <div className="text-[10px] font-medium text-muted-foreground px-1 mb-1">
              Popular Tech & Developer Logos
            </div>
            {filteredLogos.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No logos match &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5">
                {filteredLogos.map((logo) => (
                  <button
                    key={logo.id}
                    type="button"
                    onClick={() => {
                      onSelect(logo.id);
                      onClose();
                    }}
                    title={logo.name}
                    className="group relative p-2 rounded-xl hover:bg-accent hover:scale-105 active:scale-95 transition flex flex-col items-center justify-center aspect-square border border-transparent hover:border-border/60 cursor-pointer"
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      {logo.render({ className: "w-full h-full object-contain" })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ICONS TAB */}
        {activeTab === "icons" && (
          <div className="space-y-1">
            <div className="text-[10px] font-medium text-muted-foreground px-1 mb-1">
              Modern Notion-Style Icons
            </div>
            {filteredIcons.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No icons match &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5">
                {filteredIcons.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => {
                      onSelect(icon.id);
                      onClose();
                    }}
                    title={icon.name}
                    className="p-2 rounded-xl hover:bg-accent hover:scale-105 active:scale-95 transition flex items-center justify-center aspect-square border border-transparent hover:border-border/60 cursor-pointer"
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {icon.render({ className: "w-full h-full" })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EMOJIS TAB */}
        {activeTab === "emojis" && (
          <div className="space-y-3">
            {filteredEmojis.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No emojis match &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredEmojis.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="text-[10px] font-medium text-muted-foreground px-1">
                    {cat.name}
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-7 gap-1">
                    {cat.emojis.map((em) => (
                      <button
                        key={em.char}
                        type="button"
                        onClick={() => {
                          onSelect(em.char);
                          onClose();
                        }}
                        title={em.tags.join(", ")}
                        className="text-2xl p-1.5 rounded-lg hover:bg-accent hover:scale-110 active:scale-95 transition flex items-center justify-center aspect-square cursor-pointer select-none"
                      >
                        {em.char}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
