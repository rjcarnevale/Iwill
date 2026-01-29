"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [executorEmail, setExecutorEmail] = useState("");
  const [originalExecutorEmail, setOriginalExecutorEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState("");
  const [executorMessage, setExecutorMessage] = useState("");
  const [savingExecutor, setSavingExecutor] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url);
        setExecutorEmail(data.executor_email || "");
        setOriginalExecutorEmail(data.executor_email || "");
      }
      setLoading(false);
    }

    fetchProfile();
  }, [router]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    let newAvatarUrl = avatarUrl;

    // Upload new avatar if selected
    if (avatarFile) {
      setUploadingAvatar(true);
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile);

      if (uploadError) {
        setMessage(`Upload failed: ${uploadError.message}`);
        setSaving(false);
        setUploadingAvatar(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      newAvatarUrl = publicUrl.publicUrl;
      setUploadingAvatar(false);
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio: bio,
        avatar_url: newAvatarUrl,
      })
      .eq("id", profile.id);

    if (error) {
      setMessage("Failed to save. Try again.");
    } else {
      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setAvatarPreview(null);
      setMessage("Saved!");
    }
    setSaving(false);
  };

  const handleSaveExecutor = async () => {
    if (!profile) return;
    setSavingExecutor(true);
    setExecutorMessage("");

    const supabase = createClient();
    const isNewExecutor = executorEmail && executorEmail !== originalExecutorEmail;

    const { error } = await supabase
      .from("profiles")
      .update({
        executor_email: executorEmail || null,
      })
      .eq("id", profile.id);

    if (error) {
      setExecutorMessage("Failed to save. Try again.");
      setSavingExecutor(false);
      return;
    }

    // Send notification email if this is a new executor
    if (isNewExecutor) {
      try {
        const response = await fetch("/api/notify-executor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            executorEmail,
            giverName: displayName || profile.username,
          }),
        });

        if (!response.ok) {
          setExecutorMessage("Saved, but email notification failed.");
          setOriginalExecutorEmail(executorEmail);
          setSavingExecutor(false);
          return;
        }
      } catch {
        setExecutorMessage("Saved, but email notification failed.");
        setOriginalExecutorEmail(executorEmail);
        setSavingExecutor(false);
        return;
      }
    }

    setOriginalExecutorEmail(executorEmail);
    setExecutorMessage(isNewExecutor ? "Saved! Your executor has been notified." : "Saved!");
    setSavingExecutor(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </main>
    );
  }

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <main className="min-h-screen pb-20">
      <header className="gradient-header sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="hover:opacity-80 transition"
          >
            &larr; Back
          </button>
          <h1 className="font-bold tracking-wide">Settings</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Settings Card */}
        <div className="card-dark rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold">Profile</h2>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 gradient-avatar rounded-full flex items-center justify-center text-3xl">
                    👻
                  </div>
                )}
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm hover:bg-red-600 transition"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="px-4 py-2 bg-[var(--card-border)] rounded-lg text-sm cursor-pointer hover:bg-white/10 transition text-center"
                >
                  📷 {displayAvatar ? "Change Photo" : "Upload Photo"}
                </label>
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Username
            </label>
            <input
              type="text"
              value={`@${profile?.username || ""}`}
              disabled
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg py-3 px-3 text-[var(--text-muted)] cursor-not-allowed"
            />
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Username cannot be changed.
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should we remember you?"
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg py-3 px-3 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--pink)]"
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What do you want people to remember about you?"
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg py-3 px-3 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--pink)] resize-none"
              rows={3}
              maxLength={160}
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="gradient-cta px-6 py-2 rounded-full font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {saving
                ? uploadingAvatar
                  ? "Uploading..."
                  : "Saving..."
                : "Save Profile"}
            </button>
            {message && (
              <span
                className={
                  message === "Saved!" ? "text-green-400" : "text-red-400"
                }
              >
                {message}
              </span>
            )}
          </div>
        </div>

        {/* Executor Card */}
        <div className="card-dark rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚰️</span>
            <div>
              <h2 className="text-lg font-bold">Choose Your Executor</h2>
              <p className="text-[var(--text-muted)] text-sm">
                The lucky soul who gets to sort through your digital baggage when you kick the bucket.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Executor&apos;s Email
            </label>
            <input
              type="email"
              value={executorEmail}
              onChange={(e) => setExecutorEmail(e.target.value)}
              placeholder="executor@email.com"
              className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg py-3 px-3 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--pink)]"
            />
            <p className="text-[var(--text-muted)] text-sm mt-2">
              They&apos;ll get access to all your wills when the time comes. We&apos;ll notify them of this tremendous honor.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveExecutor}
              disabled={savingExecutor}
              className="gradient-cta px-6 py-2 rounded-full font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {savingExecutor ? "Saving..." : "Save Executor"}
            </button>
            {executorMessage && (
              <span
                className={
                  executorMessage.includes("failed") ? "text-red-400" : "text-green-400"
                }
              >
                {executorMessage}
              </span>
            )}
          </div>
        </div>

        {/* Sign Out Card */}
        <div className="card-dark rounded-2xl p-6">
          <button
            onClick={handleSignOut}
            className="text-red-400 hover:text-red-300 transition"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 gradient-cta">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
          <span>💀</span>
          <a
            href="https://instagram.com/gotwilled"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sm tracking-wide hover:opacity-80 transition"
          >
            @gotwilled
          </a>
        </div>
      </footer>
    </main>
  );
}
