"use client";

import { useState, useEffect } from "react";
import { CreditCard, KeyRound, LayoutGrid, Mail, Save, Settings, ShieldCheck, User, X, Check, CalendarDays, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { PricingModal } from "../pricing-modal";

type Tab = "profile" | "security" | "connections" | "billing";

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: session, update } = useSession();
  const [tab, setTab] = useState<Tab>("profile");
  const [name, setName] = useState(() => session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [google, setGoogle] = useState(false);
  const [outlook, setOutlook] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          if (data.user.name) setName(data.user.name);
          if (data.user.connections) {
            setGoogle(Boolean(data.user.connections.google));
            setOutlook(Boolean(data.user.connections.outlook));
          }
        }
      })
      .catch(() => {});
  }, [isOpen]);

  async function saveProfile() {
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        await update({ name: name.trim() });
        setNotice("Profile saved");
        toast.success("Profile updated successfully");
      } else {
        setNotice(data.error || "Could not save profile");
        toast.error(data.error || "Could not save profile");
      }
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setNotice("Password changed");
        toast.success("Password changed successfully");
      } else {
        setNotice(data.error || "Could not change password");
        toast.error(data.error || "Could not change password");
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleConnection(service: "google" | "outlook") {
    const nextGoogle = service === "google" ? !google : google;
    const nextOutlook = service === "outlook" ? !outlook : outlook;
    if (service === "google") setGoogle(nextGoogle);
    if (service === "outlook") setOutlook(nextOutlook);

    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connections: { google: nextGoogle, outlook: nextOutlook },
        }),
      });
      toast.success(
        `${service === "google" ? "Google" : "Outlook"} Calendar ${
          service === "google" ? (nextGoogle ? "connected" : "disconnected") : nextOutlook ? "connected" : "disconnected"
        }`
      );
    } catch {
      if (service === "google") setGoogle(google);
      if (service === "outlook") setOutlook(outlook);
      toast.error("Failed to update connection status");
    }
  }

  const tabs = [
    ["profile", User, "Profile", "Name and account details"],
    ["security", ShieldCheck, "Security", "Password and sign-in"],
    ["connections", LayoutGrid, "Connections", "Google, Outlook and apps"],
    ["billing", CreditCard, "Billing", "Plan and payment"],
  ] as const;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="flex h-[min(760px,calc(100vh-32px))] w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl animate-in zoom-in-95 duration-150">
          <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar p-4 sm:block">
            <div className="mb-8 flex items-center gap-2 px-2 text-sm font-semibold">
              <Settings className="h-4 w-4" /> Workspace settings
            </div>
            <nav className="space-y-1">
              {tabs.map(([id, Icon, label, desc]) => (
                <button
                  key={id}
                  onClick={() => {
                    setTab(id);
                    setNotice("");
                  }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left transition cursor-pointer ${
                    tab === id ? "bg-accent text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:bg-accent/70"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <span className="ml-6 text-[10px] opacity-70">{desc}</span>
                </button>
              ))}
            </nav>
            <div className="mt-auto pt-10 text-[11px] text-muted-foreground">
              <p>Signed in as</p>
              <p className="mt-1 truncate font-medium text-foreground">{session?.user?.email}</p>
            </div>
          </aside>
          <main className="min-w-0 flex-1 overflow-y-auto">
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h1 className="text-lg font-semibold">{tabs.find((t) => t[0] === tab)?.[2]}</h1>
                <p className="mt-0.5 text-xs text-muted-foreground">Manage your Notion workspace and account.</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent transition cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="mx-auto max-w-2xl space-y-6 p-6 sm:p-10">
              {tab === "profile" && (
                <>
                  <section>
                    <h2 className="mb-1 text-sm font-semibold">Profile</h2>
                    <p className="mb-5 text-xs text-muted-foreground">This name appears in your workspace and shared pages.</p>
                    <div className="flex items-center gap-4 rounded-xl border border-border p-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl font-semibold">
                        {(name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{name || "User"}</p>
                        <p className="text-xs text-muted-foreground">Workspace member</p>
                      </div>
                    </div>
                  </section>
                  <label className="block text-sm font-medium">
                    Name
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                      placeholder="Your name"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Email
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {session?.user?.email}
                    </div>
                  </label>
                  <button
                    onClick={saveProfile}
                    disabled={saving || !name.trim()}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {saving ? "Saving…" : "Save profile"}
                  </button>
                </>
              )}
              {tab === "security" && (
                <>
                  <section>
                    <h2 className="mb-1 text-sm font-semibold">Password and security</h2>
                    <p className="mb-5 text-xs text-muted-foreground">Change the password used to sign in to your account.</p>
                  </section>
                  <label className="block text-sm font-medium">
                    Current password
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    New password
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none"
                      placeholder="At least 8 characters"
                    />
                  </label>
                  <button
                    onClick={changePassword}
                    disabled={saving || !currentPassword || !newPassword}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Change password
                  </button>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2 font-medium text-emerald-500">
                      <ShieldCheck className="h-4 w-4" /> Your password is protected
                    </p>
                    <p className="mt-1">Passwords are encrypted before they are stored.</p>
                  </div>
                </>
              )}
              {tab === "connections" && (
                <>
                  <section>
                    <h2 className="mb-1 text-sm font-semibold">Connected apps</h2>
                    <p className="mb-5 text-xs text-muted-foreground">
                      Connect services to bring your calendar and meetings into this workspace.
                    </p>
                  </section>
                  {[
                    ["Google Calendar", google, "google", "Sync events and meeting notes", "G"],
                    ["Outlook Calendar", outlook, "outlook", "Connect Microsoft 365 events", "O"],
                  ].map(([label, connected, service, desc, icon]) => (
                    <div key={String(label)} className="flex items-center justify-between rounded-xl border border-border p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent font-bold">
                          {String(icon)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{String(label)}</p>
                          <p className="text-xs text-muted-foreground">{String(desc)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleConnection(service as "google" | "outlook")}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition shadow-xs ${
                          connected
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {connected ? (
                          <>
                            <Check className="mr-1 inline h-3 w-3" /> Connected
                          </>
                        ) : (
                          "Connect"
                        )}
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
                    <CalendarDays className="h-4 w-4" /> More integrations can be added here.
                  </div>
                </>
              )}
              {tab === "billing" && (
                <>
                  <section>
                    <h2 className="mb-1 text-sm font-semibold">Plan and billing</h2>
                    <p className="mb-5 text-xs text-muted-foreground">Manage your subscription and payment details.</p>
                  </section>
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Current plan</p>
                    <p className="mt-2 text-2xl font-semibold capitalize">{session?.user?.plan || "Free"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Upgrade for more AI messages and advanced workspace features.
                    </p>
                    <button
                      onClick={() => setShowPricing(true)}
                      className="mt-5 rounded-lg bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer shadow-xs"
                    >
                      Manage plan
                    </button>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <CreditCard className="h-4 w-4" /> Payment method
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      No payment method is connected yet. Payment details will appear here after checkout.
                    </p>
                  </div>
                </>
              )}
              {notice && (
                <p
                  className={`text-xs ${
                    notice.includes("Could") || notice.includes("incorrect") ? "text-red-500" : "text-emerald-500"
                  }`}
                >
                  {notice}
                </p>
              )}
            </div>
          </main>
        </div>
      </div>
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </>
  );
}