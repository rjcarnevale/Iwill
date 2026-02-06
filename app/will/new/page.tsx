"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Image from "next/image";

const ITEM_EMOJIS = [
  "🎸", "🎺", "🎨", "📷", "💍", "⌚", "👗", "👠", "🧥", "👜",
  "🎣", "⚓", "🏺", "🪆", "🧸", "🎭", "🎪", "🎯", "🎲", "🃏",
  "📚", "📖", "🖼️", "🗿", "⚱️", "🏆", "🎖️", "💎", "💰", "🪙",
  "🔑", "🗝️", "🧭", "⏰", "🕰️", "📺", "📻", "🎹", "🪕", "🎻",
  "🚗", "🏍️", "🚲", "⛵", "🏠", "🏡", "🌵", "🪴", "🐕", "🐈",
  "🦜", "🐠", "🦇", "🐊", "🦎", "🕷️", "🧿", "🔮", "⚗️", "🧪",
];

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

export default function NewWillPage() {
  const [item, setItem] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [recipientType, setRecipientType] = useState<"user" | "email">("user");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear emoji if image is selected
      setSelectedEmoji(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    let imageUrl: string | null = null;

    // Upload image if selected
    if (imageFile) {
      setUploadingImage(true);
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("will-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setLoading(false);
        setUploadingImage(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("will-images")
        .getPublicUrl(fileName);

      imageUrl = publicUrl.publicUrl;
      setUploadingImage(false);
    }

    const willData: {
      giver_id: string;
      item_description: string;
      is_public: boolean;
      emoji?: string;
      image_url?: string;
      tag?: string;
      recipient_id?: string;
      recipient_email?: string;
    } = {
      giver_id: user.id,
      item_description: item,
      is_public: isPublic,
    };

    if (selectedEmoji) {
      willData.emoji = selectedEmoji;
    }

    if (imageUrl) {
      willData.image_url = imageUrl;
    }

    if (selectedTag) {
      willData.tag = selectedTag;
    }

    if (recipientType === "user" && selectedUser) {
      willData.recipient_id = selectedUser.id;
    } else if (recipientType === "email" && recipientEmail) {
      willData.recipient_email = recipientEmail;
    }

    const { error: insertError, data: newWill } = await supabase
      .from("wills")
      .insert(willData)
      .select()
      .single();

    if (insertError || !newWill) {
      setError("Failed to create will. Try again.");
      setLoading(false);
      return;
    }

    // Create notification for existing user recipients
    if (recipientType === "user" && selectedUser) {
      await supabase.from("notifications").insert({
        user_id: selectedUser.id,
        type: "will_received",
        actor_id: user.id,
        will_id: newWill.id,
      });
    }

    // Send email for email recipients (trigger creates pending_claim automatically)
    if (recipientType === "email" && recipientEmail) {
      // Fetch the claim token that was created by the database trigger
      const { data: pendingClaim } = await supabase
        .from("pending_claims")
        .select("claim_token")
        .eq("will_id", newWill.id)
        .single();

      if (pendingClaim?.claim_token) {
        // Get user's profile for the giver name
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, display_name")
          .eq("id", user.id)
          .single();

        const giverName = profile?.display_name || profile?.username || "Someone";
        const claimUrl = `${window.location.origin}/claim/${pendingClaim.claim_token}`;

        // Send email notification (fire and forget)
        fetch("/api/notify-claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientEmail,
            giverName,
            itemDescription: item,
            claimToken: pendingClaim.claim_token,
            claimUrl,
          }),
        }).catch(console.error);
      }

      // Show success screen with spam warning
      setSentToEmail(recipientEmail);
      setShowSuccess(true);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  // Success screen for email recipients
  if (showSuccess && sentToEmail) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="card-dark rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">💀</div>
          <h1 className="text-2xl font-bold mb-2">It&apos;s official</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            We let <span className="text-white font-medium">{sentToEmail}</span> know that you&apos;ve left them something in your Will 👀
          </p>

          <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-xl p-4 mb-6">
            <p className="text-sm text-[var(--text-secondary)]">
              <span className="text-yellow-400">⚠️</span> Heads up: Our emails sometimes land in spam. Give them a heads up to check their spam folder if they don&apos;t see it.
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full gradient-cta py-3 rounded-full font-semibold hover:opacity-90 transition"
          >
            Back to Feed
          </button>
        </div>
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
          <h1 className="text-lg font-semibold">New Will</h1>
          <button
            onClick={handleSubmit}
            disabled={loading || !item.trim()}
            className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/30 transition disabled:opacity-50"
          >
            {loading ? (uploadingImage ? "Uploading..." : "Willing...") : "Will It 💀"}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-dark rounded-2xl p-6 space-y-6">
            {/* Image/Emoji picker */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                Add a photo or emoji
              </label>

              {/* Preview area */}
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                ) : selectedEmoji ? (
                  <div className="relative">
                    <div className="w-32 h-32 image-placeholder rounded-2xl flex items-center justify-center text-6xl">
                      {selectedEmoji}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEmoji(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 image-placeholder rounded-2xl flex items-center justify-center text-4xl text-[var(--text-muted)]">
                    📷
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="px-4 py-2 bg-[var(--card-border)] rounded-lg text-sm cursor-pointer hover:bg-white/10 transition text-center"
                  >
                    📷 Upload Photo
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="px-4 py-2 bg-[var(--card-border)] rounded-lg text-sm hover:bg-white/10 transition"
                  >
                    😀 Choose Emoji
                  </button>
                </div>
              </div>

              {showEmojiPicker && (
                <div className="mt-4 p-4 bg-[var(--background)] border border-[var(--card-border)] rounded-2xl">
                  <div className="grid grid-cols-10 gap-2">
                    {ITEM_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setSelectedEmoji(emoji);
                          setShowEmojiPicker(false);
                          removeImage(); // Clear image if emoji selected
                        }}
                        className={`text-2xl p-2 rounded-lg hover:bg-white/10 transition ${
                          selectedEmoji === emoji ? "bg-white/20" : ""
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Item description */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                What are you willing?
              </label>
              <div className="flex items-start gap-2">
                <span className="text-[var(--text-muted)] mt-3">I will my</span>
                <textarea
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="vintage jacket, crypto wallet password, embarrassing photos..."
                  className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-lg py-3 px-3 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--pink)] resize-none"
                  rows={2}
                  maxLength={280}
                />
              </div>
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
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
                      ? "gradient-cta"
                      : "bg-[var(--card-border)] text-[var(--text-muted)] hover:opacity-80"
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
                      ? "gradient-cta"
                      : "bg-[var(--card-border)] text-[var(--text-muted)] hover:opacity-80"
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
                    className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg py-3 px-3 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--pink)]"
                  />
                  {searchResults.length > 0 && !selectedUser && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-[var(--card-border)] rounded-lg overflow-hidden z-10">
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
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg py-3 px-3 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--pink)]"
                />
              )}
            </div>

            {/* Tag selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Tag this item
              </label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition ${
                      selectedTag === tag.name
                        ? "ring-2 ring-white"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: tag.color + "30", color: tag.color }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Make this public?</span>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`w-12 h-6 rounded-full transition ${
                  isPublic ? "gradient-cta" : "bg-[var(--card-border)]"
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

            <p className="text-[var(--text-muted)] text-sm mb-6">
              {isPublic
                ? "Everyone will see this in their feed."
                : "Only you and the recipient will see this."}
            </p>

            {/* Big Will It button */}
            <button
              type="submit"
              disabled={loading || !item.trim()}
              className="w-full gradient-cta py-4 rounded-full font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? (uploadingImage ? "Uploading..." : "Willing...") : "Will It 💀"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
