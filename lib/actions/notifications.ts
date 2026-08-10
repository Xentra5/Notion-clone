export interface NotificationItem {
  id: string;
  recipientId: string;
  actorName: string;
  actorAvatar?: string;
  type: "page_shared" | "comment_added" | "page_edited" | "mention";
  title: string;
  message: string;
  pageId: string;
  isRead: boolean;
  createdAt: string;
}

// In-memory notifications store for instant responsiveness
let mockNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    recipientId: "current-user",
    actorName: "Sarah Connor",
    actorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    type: "page_shared",
    title: "Shared a page with you",
    message: "invited you to collaborate on 'Q3 Product Roadmap'",
    pageId: "getting-started",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "notif-2",
    recipientId: "current-user",
    actorName: "Alex Rivera",
    actorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    type: "comment_added",
    title: "New comment on document",
    message: "commented: 'Looks great! Let's ship this tomorrow.'",
    pageId: "getting-started",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "notif-3",
    recipientId: "current-user",
    actorName: "Notion AI",
    type: "mention",
    title: "AI Summary ready",
    message: "generated meeting minutes for your recent session",
    pageId: "getting-started",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export async function getNotifications(): Promise<NotificationItem[]> {
  return mockNotifications;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  mockNotifications = mockNotifications.map((n) =>
    n.id === id ? { ...n, isRead: true } : n
  );
}

export async function markAllNotificationsAsRead(): Promise<void> {
  mockNotifications = mockNotifications.map((n) => ({ ...n, isRead: true }));
}

export async function addNotification(
  notif: Omit<NotificationItem, "id" | "isRead" | "createdAt">
): Promise<NotificationItem> {
  const newNotif: NotificationItem = {
    ...notif,
    id: `notif-${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  mockNotifications = [newNotif, ...mockNotifications];
  return newNotif;
}
