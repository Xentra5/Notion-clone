import { Schema, models, model } from "mongoose";

/**
 * Collaboration — join table for page-level access grants.
 *
 * Lifecycle:
 *   Owner invites email → status:"pending", token set, email sent
 *   Invitee clicks link  → status:"accepted", acceptedAt set
 *   Invitee declines     → status:"declined"
 *
 * The unique index on (pageId + invitedEmail) prevents duplicate invites.
 * Query pattern for "pages shared with me": find({ invitedEmail, status:"accepted" })
 */
const CollaborationSchema = new Schema(
  {
    pageId: {
      type: String,
      required: true,
      index: true,
    },
    pageTitle: {
      type: String,
      required: true,
    },
    inviterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    inviterName: {
      type: String,
      default: "",
    },
    invitedEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["full", "edit", "comment", "view"],
      default: "edit",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    /**
     * Opaque invite token — a URL-safe random string included in the email link.
     * On acceptance the token is cleared (set to null) so it can't be replayed.
     */
    token: {
      type: String,
      default: null,
      sparse: true, // allow multiple nulls in the unique index
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate invites for the same page+email pair
CollaborationSchema.index({ pageId: 1, invitedEmail: 1 }, { unique: true });
// Efficient "pages shared with me" look-up
CollaborationSchema.index({ invitedEmail: 1, status: 1 });
// Token-based accept look-up
CollaborationSchema.index({ token: 1 }, { sparse: true });

const Collaboration =
  models.Collaboration || model("Collaboration", CollaborationSchema);

export default Collaboration;

// ---- TypeScript shapes -------------------------------------------------------

export type CollaborationRole = "full" | "edit" | "comment" | "view";
export type CollaborationStatus = "pending" | "accepted" | "declined";

export interface CollaborationDoc {
  _id: string;
  pageId: string;
  pageTitle: string;
  inviterEmail: string;
  inviterName: string;
  invitedEmail: string;
  role: CollaborationRole;
  status: CollaborationStatus;
  token: string | null;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
