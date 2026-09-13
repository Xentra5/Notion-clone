"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Globe, Copy, Check, Trash2, Users, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type CollaboratorRole = "full" | "edit" | "comment" | "view";
type CollaboratorStatus = "pending" | "accepted" | "declined";

interface Collaborator {
  invitedEmail: string;
  inviterEmail: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  createdAt: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  activeTitle: string;
}

const ROLE_LABELS: Record<CollaboratorRole, string> = {
  full: "Full access",
  edit: "Can edit",
  comment: "Can comment",
  view: "Can view",
};

export function ShareModal({
  isOpen,
  onClose,
  pageId,
  activeTitle,
}: ShareModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<CollaboratorRole>("edit");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${pageId ?? "demo"}`
      : "";

  // ── Load collaborators from API ───────────────────────────────────────────
  const loadCollaborators = useCallback(async () => {
    if (!pageId) return;
    setIsLoadingCollaborators(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/share`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setCollaborators(data.collaborators ?? []);
    } catch {
      // Silent fail — keep previous state
    } finally {
      setIsLoadingCollaborators(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen, loadCollaborators]);

  if (!isOpen) return null;

  // ── Invite ────────────────────────────────────────────────────────────────
  async function handleInvite() {
    const email = emailInput.trim();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!pageId) {
      toast.error("Save the page first before sharing");
      return;
    }

    setIsInviting(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: roleInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to invite collaborator");
        return;
      }

      if (data.alreadyInvited) {
        toast.info(`${email} was already invited — resent the invite link`);
      } else {
        toast.success(`Invite sent to ${email} (${ROLE_LABELS[roleInput]})`);
      }

      setEmailInput("");
      await loadCollaborators();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setIsInviting(false);
    }
  }

  // ── Remove collaborator ───────────────────────────────────────────────────
  async function handleRemoveCollaborator(email: string) {
    if (!pageId) return;
    setRemovingEmail(email);
    try {
      const res = await fetch(`/api/pages/${pageId}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      setCollaborators((prev) => prev.filter((c) => c.invitedEmail !== email));
      toast.success(`Removed ${email}`);
    } catch {
      toast.error("Failed to remove collaborator");
    } finally {
      setRemovingEmail(null);
    }
  }

  // ── Copy link ─────────────────────────────────────────────────────────────
  function handleCopyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Share link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Toggle public ─────────────────────────────────────────────────────────
  async function handleTogglePublic() {
    if (!pageId) return;
    const nextState = !isPublic;
    setIsTogglingPublic(true);
    setIsPublic(nextState);
    try {
      await fetch(`/api/pages/${pageId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: nextState }),
      });
      toast.success(nextState ? "Public link enabled" : "Public link disabled");
    } catch {
      setIsPublic(!nextState); // revert
      toast.error("Failed to update sharing settings");
    } finally {
      setIsTogglingPublic(false);
    }
  }

  const pendingCount = collaborators.filter((c) => c.status === "pending").length;

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
          <div className="flex items-center gap-1">
            <button
              onClick={loadCollaborators}
              title="Refresh collaborators"
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInvite();
                }}
                placeholder="Enter email address..."
                className="flex-1 bg-accent/30 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-blue-500 transition text-xs"
              />
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value as CollaboratorRole)}
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition active:scale-95 disabled:opacity-50 shrink-0"
              >
                {isInviting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                {isInviting ? "Inviting..." : "Invite"}
              </button>
            </div>
          </div>

          {/* Active Collaborators */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                People with access ({collaborators.length + 1})
              </label>
              {pendingCount > 0 && (
                <span className="text-[10px] text-amber-500 font-medium">
                  {pendingCount} pending {pendingCount === 1 ? "invite" : "invites"}
                </span>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {/* Owner (You) */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-accent/20">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0">
                    You
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-xs">Workspace Owner</div>
                    <div className="text-[10px] text-muted-foreground">Owner</div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground px-2 py-1 bg-accent rounded-md">
                  Full access
                </span>
              </div>

              {/* Loading skeleton */}
              {isLoadingCollaborators && collaborators.length === 0 && (
                <div className="flex items-center gap-2 p-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Loading collaborators…</span>
                </div>
              )}

              {/* Invited Collaborators */}
              {collaborators.map((c) => (
                <div
                  key={c.invitedEmail}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/50 hover:bg-accent/30 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-[#333] text-foreground flex items-center justify-center font-bold text-xs shrink-0">
                      {c.invitedEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate min-w-0">
                      <div className="font-medium text-foreground truncate text-xs">
                        {c.invitedEmail}
                      </div>
                      {c.status === "pending" && (
                        <div className="text-[10px] text-amber-500">
                          Invite pending…
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] capitalize px-2 py-0.5 rounded bg-accent text-foreground font-medium">
                      {ROLE_LABELS[c.role]}
                    </span>
                    <button
                      onClick={() => handleRemoveCollaborator(c.invitedEmail)}
                      disabled={removingEmail === c.invitedEmail}
                      className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition disabled:opacity-50"
                      title="Remove access"
                    >
                      {removingEmail === c.invitedEmail ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {!isLoadingCollaborators && collaborators.length === 0 && (
                <p className="px-2 py-2 text-[11px] text-muted-foreground italic">
                  No collaborators yet — invite someone above.
                </p>
              )}
            </div>
          </div>

          {/* Web Share Link Section */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-semibold text-foreground text-xs">Share to web</div>
                  <div className="text-[10px] text-muted-foreground">
                    Anyone with the link can view this page
                  </div>
                </div>
              </div>
              <button
                onClick={handleTogglePublic}
                disabled={isTogglingPublic}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-60 ${
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
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
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
