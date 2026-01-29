"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    // Check if username is taken
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .single();

    if (existing) {
      setError("Username already taken. Try another one.");
      setLoading(false);
      return;
    }

    // Create or update profile
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      username: username.toLowerCase(),
      display_name: displayName || username,
      avatar_url: user.user_metadata?.avatar_url || null,
    });

    if (profileError) {
      setError("Failed to create profile. Try again.");
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Choose your handle</h1>
          <p className="text-zinc-400">
            This is how people will find you when they want to leave you their
            stuff.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-zinc-400 mb-2"
            >
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                @
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
                }
                placeholder="yourname"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 px-3 pl-8 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                required
                minLength={3}
                maxLength={20}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-zinc-400 mb-2"
            >
              Display Name (optional)
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 px-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
              maxLength={50}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || username.length < 3}
            className="w-full bg-white text-black py-3 px-6 rounded-full font-medium hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Let's Go"}
          </button>
        </form>
      </div>
    </main>
  );
}
