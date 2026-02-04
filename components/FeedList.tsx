"use client";

import { createClient } from "@/lib/supabase/client";
import { Will } from "@/lib/types";
import { useEffect, useState, useRef } from "react";
import { WillCard } from "./WillCard";

export function FeedList() {
  const [wills, setWills] = useState<Will[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWillIds, setNewWillIds] = useState<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchWills() {
      const { data, error } = await supabase
        .from("wills")
        .select(
          `
          *,
          giver:profiles!wills_giver_id_fkey(*),
          recipient:profiles!wills_recipient_id_fkey(*)
        `
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setWills(data as Will[]);
      }
      setLoading(false);
    }

    fetchWills().then(() => {
      isInitialLoad.current = false;
    });

    // Subscribe to will changes
    const channel = supabase
      .channel("public-wills")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "wills",
        },
        async (payload) => {
          // Only show public wills
          if (!payload.new.is_public) return;

          const { data } = await supabase
            .from("wills")
            .select(
              `
              *,
              giver:profiles!wills_giver_id_fkey(*),
              recipient:profiles!wills_recipient_id_fkey(*)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            // Mark as new for animation (only after initial load)
            if (!isInitialLoad.current) {
              setNewWillIds((prev) => new Set(prev).add(data.id));
              // Remove the "new" indicator after animation
              setTimeout(() => {
                setNewWillIds((prev) => {
                  const updated = new Set(prev);
                  updated.delete(data.id);
                  return updated;
                });
              }, 3000);
            }
            setWills((prev) => [data as Will, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "wills",
        },
        (payload) => {
          setWills((prev) => prev.filter((w) => w.id !== payload.old.id));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wills",
        },
        async (payload) => {
          // If will became private, remove from feed
          if (!payload.new.is_public) {
            setWills((prev) => prev.filter((w) => w.id !== payload.new.id));
            return;
          }

          // Refresh the will data
          const { data } = await supabase
            .from("wills")
            .select(
              `
              *,
              giver:profiles!wills_giver_id_fkey(*),
              recipient:profiles!wills_recipient_id_fkey(*)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setWills((prev) => {
              // Check if will already exists in feed
              const exists = prev.some((w) => w.id === data.id);
              if (exists) {
                // Update existing will
                return prev.map((w) => (w.id === data.id ? (data as Will) : w));
              } else {
                // Will became public - add to feed at the top
                if (!isInitialLoad.current) {
                  setNewWillIds((prevIds) => new Set(prevIds).add(data.id));
                  setTimeout(() => {
                    setNewWillIds((prevIds) => {
                      const updated = new Set(prevIds);
                      updated.delete(data.id);
                      return updated;
                    });
                  }, 3000);
                }
                return [data as Will, ...prev];
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = (deletedId: string) => {
    setWills((prev) => prev.filter((w) => w.id !== deletedId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--text-muted)]">Loading the afterlife...</div>
      </div>
    );
  }

  if (wills.length === 0) {
    return (
      <div className="card-dark rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">💀</div>
        <p className="text-[var(--text-muted)] text-lg">
          No one's died yet. Be the first to leave something behind.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {wills.map((will) => (
        <div
          key={will.id}
          className={newWillIds.has(will.id) ? "animate-slide-in" : ""}
        >
          {newWillIds.has(will.id) && (
            <div className="text-center mb-2">
              <span className="text-xs bg-[var(--purple)] text-white px-3 py-1 rounded-full">
                ✨ New will just dropped
              </span>
            </div>
          )}
          <WillCard will={will} onDelete={handleDelete} />
        </div>
      ))}
    </div>
  );
}
