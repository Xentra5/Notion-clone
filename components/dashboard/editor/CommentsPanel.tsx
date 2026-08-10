"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, X, Send, User } from "lucide-react";
import { toast } from "sonner";

interface CommentItem {
  _id: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
}

export function CommentsPanel({ isOpen, onClose, pageId }: CommentsPanelProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/comments`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Fetch comments error:", err);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (isOpen && pageId) {
      fetchComments();
    }
  }, [isOpen, pageId, fetchComments]);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newCommentText.trim() || !pageId) return;

    try {
      const res = await fetch(`/api/pages/${pageId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newCommentText }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setNewCommentText("");
        toast.success("Comment added!");
      }
    } catch (err) {
      toast.error("Failed to post comment");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-border bg-popover text-popover-foreground flex flex-col shrink-0 h-full select-text shadow-xl">
      <div className="p-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span>Document Comments</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {loading ? (
          <div className="text-center py-6 text-xs text-muted-foreground animate-pulse">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No comments yet. Start a discussion or mention team members using @username.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="p-3 rounded-xl bg-background border border-border space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  {comment.userName}
                </span>
                <span className="text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment} className="p-3 border-t border-border bg-background space-y-2">
        <div className="relative">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment... (use @username to mention)"
            rows={2}
            className="w-full p-2.5 rounded-xl border border-input bg-popover text-xs outline-none focus:ring-2 focus:ring-primary/50 resize-none font-medium"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
