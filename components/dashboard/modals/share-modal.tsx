"use client";

import { useState } from "react";
import { X, Globe, Copy, Check, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

interface Collaborator {
  email: string;
  role: "full" | "edit" | "comment" | "view";
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  activeTitle: string;
}

export function ShareModal({
  isOpen,
  onClose,
  pageId,
  activeTitle,
}: ShareModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<"full" | "edit" | "comment" | "view">("edit");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { email: "sarah.connor@acme.com", role: "edit" },
    { email: "alex.rivera@design.co", role: "view" },
  ]);
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  if (!isOpen) return null;

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${pageId || "demo"}`;

  async function handleInvite() {
    if (!emailInput.trim() || !emailInput.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsInviting(true);
    try {
      if (pageId) {
        await fetch(`/api/pages/${pageId}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput.trim(), role: roleInput }),
        });
      }

      setCollaborators((prev) => [
        ...prev.filter((c) => c.email !== emailInput.trim()),
        { email: emailInput.trim(), role: roleInput },
      ]);
      setEmailInput("");
      toast.success(`Invited ${emailInput} as ${roleInput} access`);
    } catch (err) {
      toast.error("Failed to invite collaborator");
      console.error(err);
    } finally {
      setIsInviting(false);
    }
  }

  function handleRemoveCollaborator(email: string) {
    setCollaborators((prev) => prev.filter((c) => c.email !== email));
    toast.success(`Removed ${email}`);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Public share link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleTogglePublic() {
    const nextState = !isPublic;
    setIsPublic(nextState);
    if (pageId) {
      fetch(`/api/pages/${pageId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: nextState }),
      }).catch(console.error);
    }
    toast.success(nextState ? "Public web link enabled" : "Public web link disabled");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden text-popover-foreground font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-neutral-50/50 dark:bg-[#1b1b1b]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-foreground/70" />
            <h2 className="text-xs font-semibold text-foreground truncate">
              Share &quot;{activeTitle}&quot;
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 text-xs">
          {/* Email Invite Row */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
              Invite Members
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
                placeholder="Add emails, separated by commas..."
                className="flex-1 bg-accent/30 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-blue-500 transition text-xs"
              />
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value as "full" | "edit" | "comment" | "view")}
                className="bg-accent/30 border border-border rounded-lg px-2 py-2 text-foreground outline-none text-xs font-medium cursor-pointer"
              >
                <option value="full">Full access</option>
                <option value="edit">Can edit</option>
                <option value="comment">Can comment</option>
                <option value="view">Can view</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={isInviting || !emailInput.trim()}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition active:scale-95 disabled:opacity-50"
              >
                {isInviting ? "Inviting..." : "Invite"}
              </button>
            </div>
          </div>

          {/* Active Collaborators */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              People with access ({collaborators.length + 1})
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {/* Owner */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-accent/20">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold text-xs">
                    You
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Workspace Owner</div>
                    <div className="text-[10px] text-muted-foreground">Owner</div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground px-2 py-1 bg-accent rounded-md">
                  Full access
                </span>
              </div>

              {/* Invited Collaborators */}
              {collaborators.map((c) => (
                <div key={c.email} className="flex items-center justify-between p-2 rounded-lg border border-border/50 hover:bg-accent/30 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-[#333] text-foreground flex items-center justify-center font-bold text-xs">
                      {c.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate max-w-[200px]">
                      <div className="font-medium text-foreground truncate">{c.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] capitalize px-2 py-0.5 rounded bg-accent text-foreground font-medium">
                      {c.role === "edit" ? "Can edit" : c.role === "comment" ? "Can comment" : "Can view"}
                    </span>
                    <button
                      onClick={() => handleRemoveCollaborator(c.email)}
                      className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition"
                      title="Remove access"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Web Share Link Section */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-semibold text-foreground">Share to web</div>
                  <div className="text-[10px] text-muted-foreground">
                    Anyone with the link can view this page
                  </div>
                </div>
              </div>
              <button
                onClick={handleTogglePublic}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isPublic ? "bg-blue-600" : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isPublic ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {isPublic && (
              <div className="flex items-center gap-2 mt-3 animate-in fade-in duration-150">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 bg-accent/40 border border-border rounded-lg px-3 py-1.5 text-[11px] text-muted-foreground outline-none font-mono truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/80 font-medium text-foreground transition shrink-0 text-xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy link"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
