"use client";

import { createClient } from "@/lib/supabase/client";
import { Will } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TAGS = [
  // Fun ones
  { name: "CURSED", color: "#ec4899" },
  { name: "HAUNTED", color: "#A855F7" },
  { name: "EMOTIONAL BAGGAGE", color: "#f43f5e" },
  { name: "QUESTIONABLE", color: "#f97316" },
  { name: "DISPUTED", color: "#f59e0b" },
  // Realistic ones
  { name: "SENTIMENTAL", color: "#3b82f6" },
  { name: "VALUABLE", color: "#eab308" },
  { name: "HEIRLOOM", color: "#8b5cf6" },
  { name: "PRACTICAL", color: "#6b7280" },
  { name: "RARE", color: "#06b6d4" },
  { name: "HANDMADE", color: "#f472b6" },
  { name: "VINTAGE", color: "#a78bfa" },
  { name: "COLLECTIBLE", color: "#34d399" },
  { name: "ONE OF A KIND", color: "#fbbf24" },
];

interface WillCardProps {
  will: Will;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function WillCard({ will, showActions = true, onDelete }: WillCardProps) {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState(will.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isPublic, setIsPublic] = useState(will.is_public);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const router = useRouter();

  const isOwner = currentUserId === will.giver_id;
  const isRecipient = currentUserId === will.recipient_id;

  // Use selected tag or fall back to random based on will id
  const selectedTag = will.tag ? TAGS.find(t => t.name === will.tag) : null;
  const fallbackTagIndex = will.id.charCodeAt(0) % TAGS.length;
  const tag = selectedTag || TAGS[fallbackTagIndex];

  useEffect(() => {
    const supabase = createClient();

    async function fetchReactions() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data: reactionData } = await supabase
        .from("reactions")
        .select("emoji, user_id")
        .eq("will_id", will.id);

      if (reactionData) {
        const counts: Record<string, number> = {};
        reactionData.forEach((r) => {
          counts[r.emoji] = (counts[r.emoji] || 0) + 1;
          if (user && r.user_id === user.id) {
            setUserReaction(r.emoji);
          }
        });
        setReactions(counts);
      }
    }

    fetchReactions();
  }, [will.id]);

  useEffect(() => {
    const handleClick = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [showMenu]);

  const handleReaction = async (emoji: string) => {
    if (!currentUserId) return;

    const supabase = createClient();

    if (userReaction === emoji) {
      await supabase
        .from("reactions")
        .delete()
        .eq("will_id", will.id)
        .eq("user_id", currentUserId);

      setReactions((prev) => ({
        ...prev,
        [emoji]: Math.max(0, (prev[emoji] || 0) - 1),
      }));
      setUserReaction(null);
    } else {
      if (userReaction) {
        await supabase
          .from("reactions")
          .delete()
          .eq("will_id", will.id)
          .eq("user_id", currentUserId);

        setReactions((prev) => ({
          ...prev,
          [userReaction]: Math.max(0, (prev[userReaction] || 0) - 1),
        }));
      }

      await supabase.from("reactions").insert({
        will_id: will.id,
        user_id: currentUserId,
        emoji,
      });

      // Create notification for will owner (if not reacting to own will)
      if (will.giver_id !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: will.giver_id,
          type: "reaction",
          actor_id: currentUserId,
          will_id: will.id,
          emoji,
        });
      }

      setReactions((prev) => ({
        ...prev,
        [emoji]: (prev[emoji] || 0) + 1,
      }));
      setUserReaction(emoji);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this will forever? This can't be undone.")) return;

    setIsDeleting(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("wills")
      .delete()
      .eq("id", will.id);

    if (!error) {
      onDelete?.(will.id);
    } else {
      alert("Failed to delete. Try again.");
      setIsDeleting(false);
    }
  };

  const handleReWill = () => {
    router.push(`/will/${will.id}/edit`);
  };

  const handleToggleVisibility = async () => {
    if (!currentUserId || !isOwner) return;

    setIsTogglingVisibility(true);
    const supabase = createClient();

    const newVisibility = !isPublic;
    const { error } = await supabase
      .from("wills")
      .update({ is_public: newVisibility })
      .eq("id", will.id);

    if (!error) {
      setIsPublic(newVisibility);
      setShowMenu(false);
    } else {
      alert("Failed to update visibility. Try again.");
    }
    setIsTogglingVisibility(false);
  };

  const handleStatusUpdate = async (newStatus: "accepted" | "declined") => {
    if (!currentUserId || !isRecipient) return;

    setIsUpdatingStatus(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("wills")
      .update({ status: newStatus })
      .eq("id", will.id);

    if (!error) {
      setStatus(newStatus);

      // Create notification for will giver
      await supabase.from("notifications").insert({
        user_id: will.giver_id,
        type: newStatus === "accepted" ? "will_accepted" : "will_declined",
        actor_id: currentUserId,
        will_id: will.id,
      });
    } else {
      alert("Failed to update. Try again.");
    }
    setIsUpdatingStatus(false);
  };

  const getStatusText = () => {
    if (status === "accepted") {
      return `${will.recipient?.display_name || will.recipient?.username || "They"} is honored`;
    }
    if (status === "declined") {
      return `${will.recipient?.display_name || will.recipient?.username || "They"} passed on this`;
    }
    return "Pending acceptance";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  const handleShare = async () => {
    const giverName = will.giver?.display_name || will.giver?.username || "Someone";
    const recipientName = will.recipient?.display_name ||
                          will.recipient?.username ||
                          will.recipient_email ||
                          "someone special";

    const shareUrl = `${window.location.origin}/will/${will.id}`;
    const shareText = `${giverName} willed their ${will.item_description} to ${recipientName}. See the full will:`;
    const fullMessage = `${shareText} ${shareUrl}`;

    // Try Web Share API first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${giverName}'s Will on Iwill`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall back to SMS
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fall back to SMS URI scheme
    const smsBody = encodeURIComponent(fullMessage);
    // Use different format for iOS vs Android
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const smsUrl = isIOS ? `sms:&body=${smsBody}` : `sms:?body=${smsBody}`;
    window.location.href = smsUrl;
  };

  if (isDeleting) {
    return (
      <article className="card-dark rounded-2xl p-8 text-center">
        <p className="text-[var(--text-secondary)]">Deleting...</p>
      </article>
    );
  }

  return (
    <article className="card-dark rounded-2xl overflow-hidden">
      {/* User header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-3.5">
        <Link href={`/profile/${will.giver?.username}`}>
          {will.giver?.avatar_url ? (
            <Image
              src={will.giver.avatar_url}
              alt={will.giver.display_name || will.giver.username}
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : (
            <div className="w-14 h-14 gradient-avatar rounded-full flex items-center justify-center text-2xl">
              👻
            </div>
          )}
        </Link>
        <div className="flex-1">
          <Link
            href={`/profile/${will.giver?.username}`}
            className="text-xl font-bold hover:underline"
          >
            {will.giver?.display_name || will.giver?.username}
          </Link>
          <p className="text-sm text-[var(--text-secondary)]">
            {isOwner && !isPublic && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] mr-1">
                <span>🔒</span>
              </span>
            )}
            willing to{" "}
            {will.recipient ? (
              <Link
                href={`/profile/${will.recipient.username}`}
                className="text-[var(--pink)] hover:underline"
              >
                {will.recipient.display_name || will.recipient.username}
              </Link>
            ) : will.recipient_email ? (
              <span>{will.recipient_email}</span>
            ) : (
              <span>someone special</span>
            )}
          </p>
        </div>

        {/* Owner menu */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <span className="text-[var(--text-muted)]">•••</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#1a1a2e] border border-[var(--card-border)] rounded-xl overflow-hidden shadow-lg z-20 min-w-[160px]">
                <button
                  onClick={handleToggleVisibility}
                  disabled={isTogglingVisibility}
                  className="w-full px-4 py-3 text-left hover:bg-white/5 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <span>{isPublic ? "🔒" : "🌍"}</span>
                  <span>{isTogglingVisibility ? "..." : isPublic ? "Make Private" : "Make Public"}</span>
                </button>
                <button
                  onClick={handleReWill}
                  className="w-full px-4 py-3 text-left hover:bg-white/5 transition flex items-center gap-2"
                >
                  <span>🔄</span>
                  <span>Re-will</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-3 text-left hover:bg-white/5 transition flex items-center gap-2 text-red-400"
                >
                  <span>🗑️</span>
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image/Emoji area */}
      <div className="mx-4 mb-4 rounded-2xl aspect-square flex flex-col items-center justify-center overflow-hidden">
        {will.image_url ? (
          <Image
            src={will.image_url}
            alt={will.item_description}
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
        ) : will.emoji ? (
          <div className="w-full h-full image-placeholder flex items-center justify-center text-8xl">
            {will.emoji}
          </div>
        ) : (
          <div className="w-full h-full image-placeholder flex flex-col items-center justify-center">
            <div className="text-5xl mb-2">🖼️</div>
            <p className="text-[var(--text-muted)] text-sm">YOUR IMAGE HERE</p>
            <p className="text-[var(--text-muted)] text-xs">Add photo in post-production</p>
          </div>
        )}
      </div>

      {/* Item details */}
      <div className="px-5 pb-4">
        <div className="flex items-start justify-between gap-4 mb-1">
          <h3 className="text-lg font-bold">{will.item_description}</h3>
          <span
            className="text-xs font-bold uppercase shrink-0"
            style={{ color: tag.color }}
          >
            {tag.name}
          </span>
        </div>

        {/* Accept/Decline buttons for recipient */}
        {showActions && isRecipient && status === "pending" && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--card-border)]">
            <button
              onClick={() => handleStatusUpdate("accepted")}
              disabled={isUpdatingStatus}
              className="flex-1 py-2.5 px-4 rounded-full bg-green-600 hover:bg-green-500 transition font-semibold text-sm disabled:opacity-50"
            >
              {isUpdatingStatus ? "..." : "Accept 🙏"}
            </button>
            <button
              onClick={() => handleStatusUpdate("declined")}
              disabled={isUpdatingStatus}
              className="flex-1 py-2.5 px-4 rounded-full bg-[var(--card-border)] hover:bg-white/10 transition font-semibold text-sm disabled:opacity-50"
            >
              {isUpdatingStatus ? "..." : "Decline 👎"}
            </button>
          </div>
        )}

        {/* Reactions and status */}
        {showActions && (
          <div className={`flex items-center justify-between ${isRecipient && status === "pending" ? "mt-3" : "mt-4 pt-4 border-t border-[var(--card-border)]"}`}>
            <div className="flex items-center gap-5">
              <button
                onClick={() => handleReaction("❤️")}
                className={`flex items-center gap-1.5 transition ${
                  userReaction === "❤️" ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`}
              >
                <span>❤️</span>
                <span className="text-sm font-semibold" style={{ color: "var(--hearts)" }}>
                  {formatNumber(reactions["❤️"] || 0)}
                </span>
              </button>
              <button
                onClick={() => handleReaction("💀")}
                className={`flex items-center gap-1.5 transition ${
                  userReaction === "💀" ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`}
              >
                <span>💀</span>
                <span className="text-sm font-semibold" style={{ color: "var(--skulls)" }}>
                  {formatNumber(reactions["💀"] || 0)}
                </span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 transition opacity-70 hover:opacity-100"
                title="Share via SMS"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-[150px] text-right">
              {getStatusText()}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
