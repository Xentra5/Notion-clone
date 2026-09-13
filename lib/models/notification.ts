import { Schema, models, model } from "mongoose";

/**
 * Notification — persisted per-user activity feed.
 *
 * Replaces the in-memory mock array in lib/actions/notifications.ts.
 * Each document is scoped to a recipient (by email) so the API
 * can fetch only the current user's notifications with a simple
 * indexed query: { recipientEmail, isRead }.
 */
const NotificationSchema = new Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    actorName: {
      type: String,
      default: "",
    },
    actorEmail: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    actorAvatar: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: [
        "page_shared",
        "comment_added",
        "page_edited",
        "mention",
        "invite_accepted",
      ],
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    pageId: {
      type: String,
      default: "",
    },
    pageTitle: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Most-recent-first feed for a user
NotificationSchema.index({ recipientEmail: 1, createdAt: -1 });
// Unread count badge
NotificationSchema.index({ recipientEmail: 1, isRead: 1 });

const Notification =
  models.Notification || model("Notification", NotificationSchema);

export default Notification;

// ---- TypeScript shapes -------------------------------------------------------

export type NotificationType =
  | "page_shared"
  | "comment_added"
  | "page_edited"
  | "mention"
  | "invite_accepted";

export interface NotificationDoc {
  _id: string;
  recipientEmail: string;
  actorName: string;
  actorEmail: string;
  actorAvatar: string;
  type: NotificationType;
  title: string;
  message: string;
  pageId: string;
  pageTitle: string;
  isRead: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
