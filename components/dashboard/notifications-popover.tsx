"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, MessageSquare, UserPlus, FileEdit, Sparkles, X } from "lucide-react";
import { NotificationItem } from "@/lib/actions/notifications";
import { toast } from "sonner";

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage?: (pageId: string) => void;
}

export function NotificationsPopover({
  isOpen,
  onClose,
  onSelectPage,
}: NotificationsPopoverProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "mentions">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => {
      setIsLoading(true);
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data.notifications || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "mentions") return n.type === "mention";
    return true;
  });

  async function handleMarkAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "readAll" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleNotificationClick(item: NotificationItem) {
    if (!item.isRead) {
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      }).catch(console.error);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
    }
    onClose();
    if (onSelectPage && item.pageId) {
      onSelectPage(item.pageId);
    }
    if (item.pageId) {
      router.push(`/dashboard/${item.pageId}`);
    }
  }

  function getIcon(type: NotificationItem["type"]) {
    switch (type) {
      case "page_shared":
        return <UserPlus className="h-3.5 w-3.5 text-blue-500" />;
      case "comment_added":
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />;
      case "page_edited":
        return <FileEdit className="h-3.5 w-3.5 text-amber-500" />;
      case "mention":
        return <Sparkles className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <Bell className="h-3.5 w-3.5 text-foreground/50" />;
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover Card */}
      <div className="absolute right-12 top-11 z-50 w-80 sm:w-96 bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden text-popover-foreground animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-neutral-50/50 dark:bg-[#1b1b1b]">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-foreground/70" />
            <h3 className="text-xs font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-accent transition"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center border-b border-border px-3 py-1.5 bg-neutral-50/30 dark:bg-[#161616] gap-1">
          {(["all", "unread", "mentions"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition ${
                filter === tab
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
              Loading activity...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No notifications found
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`w-full text-left p-3 flex items-start gap-3 hover:bg-accent/50 transition ${
                  !item.isRead ? "bg-blue-500/[0.04] dark:bg-blue-500/[0.08]" : ""
                }`}
              >
                {/* Avatar / Icon */}
                <div className="relative shrink-0 mt-0.5">
                  {item.actorAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.actorAvatar}
                      alt={item.actorName}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-[#333] flex items-center justify-center text-xs font-semibold text-foreground">
                      {item.actorName.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-background border border-border shadow-xs">
                    {getIcon(item.type)}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[12px] font-semibold text-foreground truncate">
                      {item.actorName}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-foreground/90 mt-0.5">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    {item.message}
                  </p>
                </div>

                {/* Unread Dot */}
                {!item.isRead && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
