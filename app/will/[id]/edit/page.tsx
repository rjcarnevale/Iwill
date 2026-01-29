"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile, Will } from "@/lib/types";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditWillPage() {
  const params = useParams();
  const willId = params.id as string;

  const [will, setWill] = useState<Will | null>(null);
  const [item, setItem] = useState("");
  const [recipientType, setRecipientType] = useState<"user" | "email">("user");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchWill() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("wills")
        .select(`
          *,
          recipient:profiles!wills_recipient_id_fkey(*)
        `)
        .eq("id", willId)
        .single();

      if (error || !data) {
        router.push("/");
        return;
      }

      // Check ownership
      if (data.giver_id !== user.id) {
        router.push("/");
        return;
      }

      setWill(data as Will);
      setItem(data.item_description);
      setIsPublic(data.is_public);

      if (data.recipient) {
        setRecipientType("user");
        setSelectedUser(data.recipient as Profile);
      } else if (data.recipient_email) {
        setRecipientType("email");
        setRecipientEmail(data.recipient_email);
      }

      setLoading(false);
    }

    fetchWill();
  }, [willId, router]);

  const handleSearch = async (query: string) => {
    setRecipientSearch(query);
    setSelectedUser(null);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(5);

    setSearchResults(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const supabase = createClient();

    const updateData: {
      item_description: string;
      is_public: boolean;
      recipient_id: string | null;
      recipient_email: string | null;
    } = {
      item_description: item,
      is_public: isPublic,
      recipient_id: null,
      recipient_email: null,
    };

    if (recipientType === "user" && selectedUser) {
      updateData.recipient_id = selectedUser.id;
    } else if (recipientType === "email" && recipientEmail) {
      updateData.recipient_email = recipientEmail;
    }

    const { error: updateError } = await supabase
      .from("wills")
      .update(updateData)
      .eq("id", willId);

    if (updateError) {
      setError("Failed to update. Try again.");
      setSaving(false);
      return;
    }

    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="gradient-header">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="hover:opacity-80 transition"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold">Edit Will</h1>
          <button
            onClick={handleSubmit}
            disabled={saving || !item.trim()}
            className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/30 transition disabled:opacity-50"
          >
            {saving ? "..." : "Save"}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-dark rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                What are you willing?
              </label>
              <div className="flex items-start gap-2">
                <span className="text-[var(--text-muted)] mt-3">I will my</span>
                <textarea
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="vintage jacket, crypto wallet password..."
                  className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-lg py-3 px-3 text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-pink)] resize-none"
                  rows={2}
                  maxLength={280}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                To whom?
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType("user");
                    setRecipientEmail("");
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    recipientType === "user"
                      ? "gradient-header"
                      : "bg-[var(--card-border)] text-[var(--text-muted)] hover:bg-[var(--card-border)]/80"
                  }`}
                >
                  Existing user
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType("email");
                    setSelectedUser(null);
                    setRecipientSearch("");
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    recipientType === "email"
                      ? "gradient-header"
                      : "bg-[var(--card-border)] text-[var(--text-muted)] hover:bg-[var(--card-border)]/80"
                  }`}
                >
                  Email (invite)
                </button>
              </div>

              {recipientType === "user" ? (
                <div className="relative">
                  <input
                    type="text"
                    value={selectedUser ? `@${selectedUser.username}` : recipientSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by username..."
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg py-3 px-3 text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-pink)]"
                  />
                  {searchResults.length > 0 && !selectedUser && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg overflow-hidden z-10">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setSearchResults([]);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-white/5 transition"
                        >
                          <span className="font-medium">
                            {user.display_name || user.username}
                          </span>
                          <span className="text-[var(--text-muted)] ml-2">
                            @{user.username}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="their@email.com"
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg py-3 px-3 text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-pink)]"
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">Make this public?</span>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`w-12 h-6 rounded-full transition ${
                  isPublic ? "gradient-header" : "bg-[var(--card-border)]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition transform ${
                    isPublic ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        </form>
      </div>
    </main>
  );
}
