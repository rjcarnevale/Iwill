import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FeedList } from "@/components/FeedList";
import { AppPreview } from "@/components/AppPreview";
import { ActuallyUseful } from "@/components/ActuallyUseful";
import { NotificationBell } from "@/components/NotificationBell";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Get user's profile for the profile link
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    return (
      <main className="min-h-screen">
        {/* Gradient Header */}
        <header className="gradient-header sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wide">💀 Iwill</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/will/new"
                className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/30 transition"
              >
                + New Will
              </Link>
              <NotificationBell />
              {profile?.username && (
                <Link
                  href={`/profile/${profile.username}`}
                  className="hover:opacity-80 transition"
                  title="My Wills"
                >
                  👤
                </Link>
              )}
              <Link
                href="/profile/settings"
                className="hover:opacity-80 transition"
              >
                ⚙️
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <FeedList />
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

  // Landing page for logged out users
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="py-16 md:py-24 px-4 text-center">
        <h1 className="hero-title mb-2">
          <span className="skull-wobble">💀</span> Iwill
        </h1>
        <div className="mt-6 space-y-1">
          <p className="hero-tagline-primary text-[var(--purple)]">You can&apos;t take it with you.</p>
          <p className="hero-tagline">But you can decide who gets it.</p>
        </div>
      </div>

      {/* Tagline */}
      <div className="text-center px-4 -mt-4 pb-8">
        <p className="hero-tagline">
          Iwill💀 is the app for managing your legacy—
        </p>
        <p className="hero-tagline text-[var(--purple)]">
          inheritance just got interesting.
        </p>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center px-4 pb-12">
        <Link
          href="/auth/login"
          className="gradient-cta py-4 px-10 rounded-full font-bold text-xl hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-lg"
        >
          Start Willing Stuff 💀
        </Link>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="text-5xl">📦</div>
            <h3 className="font-display text-xl font-bold">Add Your Stuff</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Upload your prized possessions. Your watch. Your car. That haunted doll from eBay. We don&apos;t judge.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="text-5xl">👆</div>
            <h3 className="font-display text-xl font-bold">Pick Your People</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Assign beneficiaries for each item. Best friend gets the Bitcoin. Worst enemy gets the student loans.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="text-5xl">📢</div>
            <h3 className="font-display text-xl font-bold">Make It Public (or Don&apos;t)</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Share your wills to the feed and let the world react. Or keep it private like a normal person.
            </p>
          </div>
        </div>
      </div>

      {/* App Preview */}
      <AppPreview />

      {/* Actually Useful */}
      <ActuallyUseful />

      {/* Bottom CTA */}
      <div className="flex justify-center px-4 py-16">
        <Link
          href="/auth/login"
          className="gradient-cta py-4 px-10 rounded-full font-bold text-xl hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-lg"
        >
          Start Willing Stuff 💀
        </Link>
      </div>

      <footer className="gradient-cta py-3 text-center">
        <p className="text-sm font-bold tracking-wide flex items-center justify-center gap-2">
          <span>💀</span>
          <a
            href="https://instagram.com/gotwilled"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition"
          >
            @gotwilled
          </a>
        </p>
      </footer>
    </main>
  );
}
