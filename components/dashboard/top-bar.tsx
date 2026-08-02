"use client";

import { useState } from "react";
import {
  Lock,
  ChevronDown,
  Link as LinkIcon,
  Star,
  MoreHorizontal,
  Check,
  Sidebar as SidebarIcon,
  Sparkles,
  Globe,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

interface TopBarProps {
  activeTitle: string;
  onToggleSidebar?: () => void;
  onToggleAi: () => void;
  isAiOpen?: boolean;
}

export function TopBar({
  activeTitle,
  onToggleSidebar,
  onToggleAi,
  isAiOpen,
}: TopBarProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [permission, setPermission] = useState("Private");
  const [showPermissionDropdown, setShowPermissionDropdown] = useState(false);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header className="h-11 border-b border-border bg-background px-3 flex items-center justify-between text-xs text-muted-foreground select-none shrink-0 font-sans">
      {/* Left section: Sidebar toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 overflow-hidden">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] text-neutral-600 dark:text-[#9b9b9b] hover:text-neutral-900 dark:hover:text-white transition md:hidden"
            title="Toggle Sidebar"
          >
            <SidebarIcon className="h-4 w-4" />
          </button>
        )}

        <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
          <span className="hover:text-foreground/80 transition cursor-pointer truncate font-semibold">
            {activeTitle}
          </span>

          {/* Permission Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPermissionDropdown(!showPermissionDropdown)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:bg-neutral-200 dark:hover:bg-[#252525] hover:text-foreground px-1.5 py-0.5 rounded transition"
            >
              <Lock className="h-3 w-3" />
              <span>{permission}</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showPermissionDropdown && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-popover border border-border rounded-xl shadow-2xl p-1 z-50 text-xs text-popover-foreground">
                <button
                  onClick={() => {
                    setPermission("Private");
                    setShowPermissionDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] text-left"
                >
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Private</span>
                </button>
                <button
                  onClick={() => {
                    setPermission("Workspace");
                    setShowPermissionDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] text-left"
                >
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Workspace</span>
                </button>
                <button
                  onClick={() => {
                    setPermission("Public");
                    setShowPermissionDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#2c2c2c] text-left"
                >
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Public Web</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Metadata & Page Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <span className="hidden sm:inline-block text-[11px] text-muted-foreground mr-1">
          Edited 1y ago
        </span>

        {/* Share Button */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] hover:text-foreground transition text-xs font-semibold text-foreground"
          >
            <Lock className="h-3 w-3 text-muted-foreground" />
            <span>Share</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showShareMenu && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-popover border border-border rounded-2xl shadow-2xl p-3.5 z-50 text-xs text-popover-foreground animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                <span className="font-bold text-foreground">Share page</span>
                <span className="text-[10px] text-muted-foreground bg-background border border-border px-2 py-0.5 rounded-full font-medium">
                  {permission}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                Only you have access to this page. Invite others to start collaborating.
              </p>
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-[#0078df] hover:bg-[#0067c2] text-white py-2 px-3 rounded-xl font-semibold transition shadow-sm"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span>{copied ? "Link Copied!" : "Copy link"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Link Button */}
        <button
          onClick={handleCopyLink}
          className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] hover:text-foreground transition text-muted-foreground"
          title="Copy link"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <LinkIcon className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Favorite / Star */}
        <button
          onClick={() => setIsStarred(!isStarred)}
          className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] hover:text-foreground transition text-muted-foreground"
          title="Favorite page"
        >
          <Star
            className={`h-3.5 w-3.5 transition-colors ${
              isStarred ? "fill-amber-500 text-amber-500 font-bold" : ""
            }`}
          />
        </button>

        {/* More Options */}
        <button
          className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-[#252525] hover:text-foreground transition text-muted-foreground"
          title="More options"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>

        {/* Theme Toggle option */}
        <div className="h-7 w-[1px] bg-border mx-1" />
        <ThemeToggle />
        <div className="h-7 w-[1px] bg-border mx-1" />

        {/* Notion AI Toggle Button */}
        <button
          onClick={onToggleAi}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition ml-1 ${
            isAiOpen
              ? "bg-purple-900/30 border border-purple-800/50 text-purple-600 dark:text-purple-300"
              : "hover:bg-neutral-200 dark:hover:bg-[#252525] text-purple-500 dark:text-purple-400"
          }`}
          title="Toggle Notion AI Side Panel"
        >
          <Sparkles className="h-3.5 w-3.5 fill-purple-500/20" />
          <span className="hidden sm:inline">Notion AI</span>
        </button>
      </div>
    </header>
  );
}
