"use client";

import { createClient } from "@/lib/supabase/client";
import { FuneralPreferences, FuneralGuest, Profile } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FUNERAL_TYPES = [
  { value: "burial", label: "Traditional Burial", emoji: "⚰️" },
  { value: "cremation", label: "Cremation", emoji: "🔥" },
  { value: "celebration_of_life", label: "Celebration of Life", emoji: "🎉" },
  { value: "viking_funeral", label: "Viking Funeral", emoji: "⛵" },
  { value: "surprise_me", label: "Surprise Me", emoji: "🎲" },
  { value: "other", label: "Other", emoji: "✨" },
];

const CASKET_OPTIONS = [
  { value: "open", label: "Open Casket", description: "Let them see me one last time" },
  { value: "closed", label: "Closed Casket", description: "Remember me as I was" },
  { value: "no_casket", label: "No Casket", description: "Keep it simple" },
];

const DRESS_CODE_SUGGESTIONS = [
  "All black (classic)",
  "Wear something colorful",
  "Hawaiian shirts only",
  "Come as your favorite character",
  "Formal attire",
  "Whatever you want, I'll be dead",
];

export default function FuneralPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<Partial<FuneralPreferences>>({});
  const [guests, setGuests] = useState<FuneralGuest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [emailInvite, setEmailInvite] = useState("");
  const [emailName, setEmailName] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [inviting, setInviting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setCurrentUser(profile);

    // Get funeral preferences
    const { data: prefs } = await supabase
      .from("funeral_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (prefs) {
      setPreferences(prefs);
    }

    // Get guest list
    const { data: guestList } = await supabase
      .from("funeral_guests")
      .select(`
        *,
        guest_user:profiles!funeral_guests_guest_user_id_fkey(*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (guestList) {
      setGuests(guestList as FuneralGuest[]);
    }

    setLoading(false);
  }

  async function savePreferences() {
    if (!currentUser) return;
    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("funeral_preferences")
      .upsert({
        user_id: currentUser.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) {
      alert("Failed to save. Try again.");
    }
    setSaving(false);
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .neq("id", currentUser?.id)
      .limit(5);

    // Filter out already invited guests
    const guestUserIds = guests.map(g => g.guest_user_id);
    const filtered = (data || []).filter(p => !guestUserIds.includes(p.id));
    setSearchResults(filtered);
  }

  async function inviteUser(profile: Profile) {
    if (!currentUser) return;
    setInviting(true);

    const supabase = createClient();

    const { data: newGuest, error } = await supabase
      .from("funeral_guests")
      .insert({
        user_id: currentUser.id,
        guest_user_id: profile.id,
        guest_name: profile.display_name || profile.username,
        status: "invited",
      })
      .select(`
        *,
        guest_user:profiles!funeral_guests_guest_user_id_fkey(*)
      `)
      .single();

    if (!error && newGuest) {
      setGuests([newGuest as FuneralGuest, ...guests]);

      // Create notification for the invited user
      await supabase.from("notifications").insert({
        user_id: profile.id,
        type: "funeral_invite",
        actor_id: currentUser.id,
      });
    }

    setSearchQuery("");
    setSearchResults([]);
    setInviting(false);
  }

  async function inviteByEmail() {
    if (!currentUser || !emailInvite) return;
    setInviting(true);

    const supabase = createClient();

    const { data: newGuest, error } = await supabase
      .from("funeral_guests")
      .insert({
        user_id: currentUser.id,
        guest_email: emailInvite,
        guest_name: emailName || emailInvite,
        status: "invited",
      })
      .select()
      .single();

    if (!error && newGuest) {
      setGuests([newGuest as FuneralGuest, ...guests]);

      // Send invite email
      const giverName = currentUser.display_name || currentUser.username;
      await fetch("/api/notify-funeral-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: emailInvite,
          recipientName: emailName,
          giverName,
          inviteToken: newGuest.invite_token,
        }),
      }).catch(console.error);
    }

    setEmailInvite("");
    setEmailName("");
    setShowEmailForm(false);
    setInviting(false);
  }

  async function toggleGuestStatus(guest: FuneralGuest) {
    const newStatus = guest.status === "invited" ? "disinvited" : "invited";

    const supabase = createClient();
    const { error } = await supabase
      .from("funeral_guests")
      .update({ status: newStatus })
      .eq("id", guest.id);

    if (!error) {
      setGuests(guests.map(g =>
        g.id === guest.id ? { ...g, status: newStatus } : g
      ));
    }
  }

  async function removeGuest(guestId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("funeral_guests")
      .delete()
      .eq("id", guestId);

    if (!error) {
      setGuests(guests.filter(g => g.id !== guestId));
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading your eternal plans...</p>
      </main>
    );
  }

  const invitedCount = guests.filter(g => g.status === "invited").length;
  const disinvitedCount = guests.filter(g => g.status === "disinvited").length;

  return (
    <main className="min-h-screen pb-20">
      <header className="gradient-header sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href={`/profile/${currentUser?.username}`} className="hover:opacity-80 transition">
            ← Back
          </Link>
          <h1 className="font-bold tracking-wide">My Funeral</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Preview Card */}
        <div className="card-dark rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">⚰️</div>
          <h2 className="text-xl font-bold mb-1">
            {currentUser?.display_name || currentUser?.username}&apos;s Funeral
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">
            {preferences.funeral_type
              ? FUNERAL_TYPES.find(t => t.value === preferences.funeral_type)?.label
              : "Type TBD"}
            {preferences.vibe_description && ` • "${preferences.vibe_description}"`}
          </p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className="text-green-400">{invitedCount} invited</span>
            {disinvitedCount > 0 && (
              <span className="text-red-400">{disinvitedCount} banned</span>
            )}
          </div>
        </div>

        {/* Funeral Preferences */}
        <div className="card-dark rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🎭</span> Funeral Preferences
          </h3>

          <div className="space-y-5">
            {/* Funeral Type */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Type of Send-Off
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FUNERAL_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setPreferences({ ...preferences, funeral_type: type.value as FuneralPreferences["funeral_type"] })}
                    className={`p-3 rounded-xl text-left transition ${
                      preferences.funeral_type === type.value
                        ? "bg-[var(--purple)] text-white"
                        : "bg-[var(--card-border)] hover:bg-white/10"
                    }`}
                  >
                    <span className="text-xl mr-2">{type.emoji}</span>
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Casket Preference */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Casket Situation
              </label>
              <div className="space-y-2">
                {CASKET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences({ ...preferences, casket_preference: option.value as FuneralPreferences["casket_preference"] })}
                    className={`w-full p-3 rounded-xl text-left transition ${
                      preferences.casket_preference === option.value
                        ? "bg-[var(--purple)] text-white"
                        : "bg-[var(--card-border)] hover:bg-white/10"
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-70">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Vibe */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                The Vibe
              </label>
              <input
                type="text"
                value={preferences.vibe_description || ""}
                onChange={(e) => setPreferences({ ...preferences, vibe_description: e.target.value })}
                placeholder="More of a party than a sad thing..."
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)]"
              />
            </div>

            {/* Dress Code */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Dress Code
              </label>
              <input
                type="text"
                value={preferences.dress_code || ""}
                onChange={(e) => setPreferences({ ...preferences, dress_code: e.target.value })}
                placeholder="What should people wear?"
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)] mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {DRESS_CODE_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPreferences({ ...preferences, dress_code: suggestion })}
                    className="text-xs px-3 py-1 rounded-full bg-[var(--card-border)] hover:bg-white/10 transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Venue Preference
              </label>
              <input
                type="text"
                value={preferences.venue_preference || ""}
                onChange={(e) => setPreferences({ ...preferences, venue_preference: e.target.value })}
                placeholder="Beach, rooftop bar, haunted mansion..."
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)]"
              />
            </div>

            {/* Music */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Music / Playlist
              </label>
              <textarea
                value={preferences.music_playlist || ""}
                onChange={(e) => setPreferences({ ...preferences, music_playlist: e.target.value })}
                placeholder="Songs you want played, Spotify playlist link, or just 'play Wonderwall on repeat'..."
                rows={3}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)] resize-none"
              />
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Special Requests
              </label>
              <textarea
                value={preferences.special_requests || ""}
                onChange={(e) => setPreferences({ ...preferences, special_requests: e.target.value })}
                placeholder="Release doves, shoot my ashes into space, someone better cry..."
                rows={3}
                className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)] resize-none"
              />
            </div>

            <button
              onClick={savePreferences}
              disabled={saving}
              className="w-full gradient-cta py-3 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>

        {/* Guest List */}
        <div className="card-dark rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📋</span> Guest List
          </h3>

          {/* Search for users */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users to invite..."
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)]"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-[var(--card-border)] rounded-xl overflow-hidden z-10">
                {searchResults.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => inviteUser(profile)}
                    disabled={inviting}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition flex items-center gap-3"
                  >
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.username}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 gradient-avatar rounded-full flex items-center justify-center text-sm">
                        👻
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{profile.display_name || profile.username}</div>
                      <div className="text-xs text-[var(--text-muted)]">@{profile.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Email invite */}
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full py-3 border border-dashed border-[var(--card-border)] rounded-xl text-[var(--text-muted)] hover:border-[var(--purple)] hover:text-white transition mb-4"
            >
              + Invite by email
            </button>
          ) : (
            <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-xl p-4 mb-4 space-y-3">
              <input
                type="text"
                value={emailName}
                onChange={(e) => setEmailName(e.target.value)}
                placeholder="Their name"
                className="w-full bg-transparent border border-[var(--card-border)] rounded-lg py-2 px-3 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)]"
              />
              <input
                type="email"
                value={emailInvite}
                onChange={(e) => setEmailInvite(e.target.value)}
                placeholder="Their email"
                className="w-full bg-transparent border border-[var(--card-border)] rounded-lg py-2 px-3 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--purple)]"
              />
              <div className="flex gap-2">
                <button
                  onClick={inviteByEmail}
                  disabled={!emailInvite || inviting}
                  className="flex-1 py-2 bg-[var(--purple)] rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {inviting ? "Sending..." : "Send Invite"}
                </button>
                <button
                  onClick={() => { setShowEmailForm(false); setEmailInvite(""); setEmailName(""); }}
                  className="px-4 py-2 bg-[var(--card-border)] rounded-lg hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Guest list */}
          {guests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👻</div>
              <p className="text-[var(--text-muted)]">No guests yet. It&apos;s going to be a lonely funeral.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition ${
                    guest.status === "disinvited"
                      ? "bg-red-900/20 border border-red-900/50"
                      : "bg-[var(--background)]"
                  }`}
                >
                  {guest.guest_user?.avatar_url ? (
                    <Image
                      src={guest.guest_user.avatar_url}
                      alt={guest.guest_name || "Guest"}
                      width={40}
                      height={40}
                      className={`rounded-full ${guest.status === "disinvited" ? "opacity-50" : ""}`}
                    />
                  ) : (
                    <div className={`w-10 h-10 gradient-avatar rounded-full flex items-center justify-center ${guest.status === "disinvited" ? "opacity-50" : ""}`}>
                      {guest.guest_email ? "📧" : "👻"}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className={`font-medium ${guest.status === "disinvited" ? "line-through text-red-400" : ""}`}>
                      {guest.guest_name || guest.guest_email}
                    </div>
                    {guest.guest_user && (
                      <div className="text-xs text-[var(--text-muted)]">@{guest.guest_user.username}</div>
                    )}
                    {guest.guest_email && !guest.guest_user && (
                      <div className="text-xs text-[var(--text-muted)]">{guest.guest_email}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleGuestStatus(guest)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        guest.status === "invited"
                          ? "bg-green-600 hover:bg-red-600"
                          : "bg-red-600 hover:bg-green-600"
                      }`}
                    >
                      {guest.status === "invited" ? "Disinvite" : "Re-invite"}
                    </button>
                    <button
                      onClick={() => removeGuest(guest.id)}
                      className="p-1 text-[var(--text-muted)] hover:text-red-400 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {disinvitedCount > 0 && (
            <p className="text-center text-xs text-[var(--text-muted)] mt-4">
              {disinvitedCount} {disinvitedCount === 1 ? "person is" : "people are"} banned from your funeral. Harsh.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
