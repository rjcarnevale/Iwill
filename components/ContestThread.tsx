"use client";

import { createClient } from "@/lib/supabase/client";
import { Contest, Profile } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContestModal } from "./ContestModal";

interface ContestWithContester extends Contest {
  contester: Profile;
}

interface ContestThreadProps {
  willId: string;
  willOwnerId: string;
  itemDescription: string;
  initialContests: ContestWithContester[];
}

export function ContestThread({
  willId,
  willOwnerId,
  itemDescription,
  initialContests,
}: ContestThreadProps) {
  const [contests, setContests] = useState<ContestWithContester[]>(initialContests);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    }
    getCurrentUser();
  }, []);

  const handleDelete = async (contestId: string) => {
    if (!confirm("Remove your contest?")) return;

    setIsDeleting(contestId);
    const supabase = createClient();

    const { error } = await supabase
      .from("contests")
      .delete()
      .eq("id", contestId)
      .eq("contester_user_id", currentUserId);

    if (!error) {
      setContests((prev) => prev.filter((c) => c.id !== contestId));
    } else {
      alert("Failed to remove contest");
    }
    setIsDeleting(null);
  };

  const handleEdit = (contest: Contest) => {
    setEditingContest(contest);
    setShowEditModal(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (contests.length === 0) {
    return null;
  }

  return (
    <>
      <div className="card-dark rounded-2xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[var(--card-border)]">
          <h3 className="font-bold flex items-center gap-2">
            <span>⚖️</span>
            <span>Contests ({contests.length})</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            The people have spoken. Drama ensues.
          </p>
        </div>
        <div className="divide-y divide-[var(--card-border)]">
          {contests.map((contest) => {
            const contesterName = contest.contester?.display_name || contest.contester?.username || "Someone";
            const isOwnContest = currentUserId === contest.contester_user_id;

            return (
              <div key={contest.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <Link href={`/profile/${contest.contester?.username}`}>
                    {contest.contester?.avatar_url ? (
                      <Image
                        src={contest.contester.avatar_url}
                        alt={contesterName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 gradient-avatar rounded-full flex items-center justify-center text-lg">
                        ⚖️
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/profile/${contest.contester?.username}`}
                        className="font-bold hover:underline"
                      >
                        {contesterName}
                      </Link>
                      <span className="text-xs text-[var(--text-muted)]">
                        contested
                      </span>
                    </div>
                    {contest.comment ? (
                      <p className="text-[var(--text-secondary)] mt-1">
                        {contest.comment}
                      </p>
                    ) : (
                      <p className="text-[var(--text-muted)] text-sm italic mt-1">
                        No comment
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatDate(contest.created_at)}
                      </span>
                      {isOwnContest && (
                        <>
                          <button
                            onClick={() => handleEdit(contest)}
                            className="text-xs text-[var(--purple)] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(contest.id)}
                            disabled={isDeleting === contest.id}
                            className="text-xs text-red-400 hover:underline disabled:opacity-50"
                          >
                            {isDeleting === contest.id ? "..." : "Remove"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingContest && (
        <ContestModal
          willId={willId}
          willOwnerId={willOwnerId}
          itemDescription={itemDescription}
          existingComment={editingContest.comment}
          isEditing={true}
          onClose={() => {
            setShowEditModal(false);
            setEditingContest(null);
          }}
          onContested={(newComment) => {
            setContests((prev) =>
              prev.map((c) =>
                c.id === editingContest.id
                  ? { ...c, comment: newComment, updated_at: new Date().toISOString() }
                  : c
              )
            );
          }}
        />
      )}
    </>
  );
}
