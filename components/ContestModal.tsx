"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface ContestModalProps {
  willId: string;
  willOwnerId: string;
  itemDescription: string;
  existingComment?: string | null;
  isEditing?: boolean;
  onClose: () => void;
  onContested: (comment: string | null) => void;
}

export function ContestModal({
  willId,
  willOwnerId,
  itemDescription,
  existingComment,
  isEditing = false,
  onClose,
  onContested,
}: ContestModalProps) {
  const [comment, setComment] = useState(existingComment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (withComment: boolean) => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to contest a will");
      setLoading(false);
      return;
    }

    const contestData = {
      will_id: willId,
      contester_user_id: user.id,
      comment: withComment && comment.trim() ? comment.trim() : null,
    };

    if (isEditing) {
      const { error: updateError } = await supabase
        .from("contests")
        .update({
          comment: withComment && comment.trim() ? comment.trim() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("will_id", willId)
        .eq("contester_user_id", user.id);

      if (updateError) {
        setError("Failed to update contest. Try again.");
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("contests")
        .insert(contestData);

      if (insertError) {
        if (insertError.code === "23505") {
          setError("You've already contested this will");
        } else {
          setError("Failed to contest. Try again.");
        }
        setLoading(false);
        return;
      }

      // Create notification for will owner
      if (willOwnerId !== user.id) {
        await supabase.from("notifications").insert({
          user_id: willOwnerId,
          type: "will_contested",
          actor_id: user.id,
          will_id: willId,
        });
      }
    }

    onContested(withComment && comment.trim() ? comment.trim() : null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md card-dark rounded-2xl p-6 space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-3">⚖️</div>
          <h2 className="text-xl font-bold">
            {isEditing ? "Edit Your Contest" : "Contest This Will"}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {isEditing
              ? "Update your contest comment"
              : `Challenge the bequest of "${itemDescription}"`}
          </p>
        </div>

        {/* Comment input */}
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Who should get it instead? (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="This should go to @sarah honestly..."
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)] resize-none"
            rows={3}
            maxLength={280}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1 text-right">
            {comment.length}/280
          </p>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* Actions */}
        <div className="space-y-3">
          {comment.trim() && (
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="w-full gradient-cta py-3 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "..." : isEditing ? "Update Contest" : "Contest with Comment ⚖️"}
            </button>
          )}
          {!isEditing && (
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className={`w-full py-3 rounded-full font-semibold transition disabled:opacity-50 ${
                comment.trim()
                  ? "border border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-white/5"
                  : "gradient-cta hover:opacity-90"
              }`}
            >
              {loading ? "..." : "Just Contest It ⚖️"}
            </button>
          )}
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 rounded-full font-semibold border border-[var(--card-border)] text-[var(--text-muted)] hover:bg-white/5 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
