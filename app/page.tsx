import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FeedList } from "@/components/FeedList";
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
    <main className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 text-9xl">💀</div>
          <div className="absolute bottom-20 right-10 text-9xl">⚰️</div>
          <div className="absolute top-1/2 left-1/4 text-7xl">⚖️</div>
        </div>

        <div className="relative z-10">
          <h1 className="hero-title mb-4">
            <span className="skull-wobble text-7xl md:text-8xl">💀</span>
          </h1>
          <h2 className="font-['Bebas_Neue'] text-5xl md:text-7xl tracking-wider text-white mb-4">
            IWILL
          </h2>
          <p className="text-2xl md:text-3xl text-[var(--purple)] font-bold mb-4">
            Your last wishes, but make it social.
          </p>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl mx-auto mb-10">
            The app where you publicly declare who gets your stuff when you&apos;re gone.
            Morbid? Maybe. Fun? Absolutely.
          </p>

          <Link
            href="/auth/login"
            className="inline-block gradient-cta py-4 px-12 rounded-full font-bold text-xl hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            Start Your Will 💀
          </Link>

          <p className="text-[var(--text-muted)] text-sm mt-6">
            Free. Takes 30 seconds. No actual death required.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 border-t border-[var(--card-border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--purple)] text-sm font-bold uppercase tracking-widest mb-3">
              Dead Simple
            </p>
            <h2 className="font-['Bebas_Neue'] text-4xl md:text-5xl tracking-wider">
              HOW IT WORKS
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-cta flex items-center justify-center">
                <span className="text-4xl">📝</span>
              </div>
              <div className="text-[var(--purple)] font-bold text-sm mb-2">STEP 1</div>
              <h3 className="font-bold text-xl mb-3">Create a Will</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Pick an item. Pick a person. Add a dramatic tag like &quot;CURSED&quot; or &quot;HAUNTED&quot;.
                You know, for vibes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-cta flex items-center justify-center">
                <span className="text-4xl">📲</span>
              </div>
              <div className="text-[var(--purple)] font-bold text-sm mb-2">STEP 2</div>
              <h3 className="font-bold text-xl mb-3">Share It</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Post it to the public feed or send someone a mysterious text that they&apos;ve
                been named in your Will.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-cta flex items-center justify-center">
                <span className="text-4xl">🍿</span>
              </div>
              <div className="text-[var(--purple)] font-bold text-sm mb-2">STEP 3</div>
              <h3 className="font-bold text-xl mb-3">Watch the Drama</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                People react. People contest. Someone gets offended they didn&apos;t get the
                vintage lamp. Classic inheritance drama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-4 border-t border-[var(--card-border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--purple)] text-sm font-bold uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="font-['Bebas_Neue'] text-4xl md:text-5xl tracking-wider">
              EVERYTHING YOU NEED TO<br />PLAN YOUR DRAMATIC EXIT
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Social Feed */}
            <div className="card-dark rounded-2xl p-8 hover:border-[var(--purple)] transition-colors border border-transparent">
              <div className="text-5xl mb-5">📱</div>
              <h3 className="font-bold text-2xl mb-3">Social Feed</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                It&apos;s like Venmo, but for your final wishes. See what everyone&apos;s leaving to who.
                React with 💀 or ❤️. Judge silently.
              </p>
              <p className="text-[var(--purple)] text-sm font-semibold">
                &quot;@jessica is leaving her crystals collection to @brad&quot; — and 47 people have thoughts about it.
              </p>
            </div>

            {/* Contest a Will */}
            <div className="card-dark rounded-2xl p-8 hover:border-[var(--purple)] transition-colors border border-transparent">
              <div className="text-5xl mb-5">⚖️</div>
              <h3 className="font-bold text-2xl mb-3">Contest a Will</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Think someone else deserves that vintage jacket? Challenge it publicly.
                Start drama. We encourage it.
              </p>
              <p className="text-[var(--purple)] text-sm font-semibold">
                &quot;This should go to @sarah honestly&quot; — now that&apos;s a contested will.
              </p>
            </div>

            {/* Funeral Planning */}
            <div className="card-dark rounded-2xl p-8 hover:border-[var(--purple)] transition-colors border border-transparent">
              <div className="text-5xl mb-5">⚰️</div>
              <h3 className="font-bold text-2xl mb-3">Funeral Planning</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Plan your own send-off. Pick the vibe. Choose the music. Decide if it&apos;s open casket
                or &quot;let them remember me young.&quot;
              </p>
              <p className="text-[var(--purple)] text-sm font-semibold">
                Dress code: All black, no crying. Spotify playlist: Already curated.
              </p>
            </div>

            {/* Guest List */}
            <div className="card-dark rounded-2xl p-8 hover:border-[var(--purple)] transition-colors border border-transparent">
              <div className="text-5xl mb-5">📋</div>
              <h3 className="font-bold text-2xl mb-3">Funeral Guest List</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Invite people. Disinvite people. Your funeral, your rules.
                Some exes simply don&apos;t make the cut.
              </p>
              <p className="text-[var(--purple)] text-sm font-semibold">
                Invited: 127 people. Disinvited: That one guy. He knows what he did.
              </p>
            </div>

            {/* SMS Sharing */}
            <div className="card-dark rounded-2xl p-8 hover:border-[var(--purple)] transition-colors border border-transparent">
              <div className="text-5xl mb-5">💬</div>
              <h3 className="font-bold text-2xl mb-3">Mysterious SMS</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                Send someone a text saying they&apos;ve been named in a Will. Watch them panic.
                Then reveal it&apos;s your weighted blanket.
              </p>
              <p className="text-[var(--purple)] text-sm font-semibold">
                &quot;Someone left you something in their Will 👀&quot; — the ultimate conversation starter.
              </p>
            </div>

            {/* Export PDF */}
            <div className="card-dark rounded-2xl p-8 hover:border-[var(--purple)] transition-colors border border-transparent">
              <div className="text-5xl mb-5">📄</div>
              <h3 className="font-bold text-2xl mb-3">Export Your Will</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                When you&apos;re done being dramatic, export a real PDF. Show it to your lawyer.
                They&apos;ll have questions.
              </p>
              <p className="text-[var(--purple)] text-sm font-semibold">
                &quot;This is... unconventional&quot; — Every estate attorney, probably.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Feed Preview */}
      <section className="py-20 px-4 border-t border-[var(--card-border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[var(--purple)] text-sm font-bold uppercase tracking-widest mb-3">
              Sneak Peek
            </p>
            <h2 className="font-['Bebas_Neue'] text-4xl md:text-5xl tracking-wider mb-4">
              THE FEED IS UNHINGED
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Real people. Real wills. Real drama. Here&apos;s what you&apos;re missing.
            </p>
          </div>

          {/* Mock Feed Items */}
          <div className="space-y-4 max-w-md mx-auto">
            <div className="card-dark rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 gradient-avatar rounded-full flex items-center justify-center">👻</div>
                <div>
                  <p className="font-bold">Marcus</p>
                  <p className="text-sm text-[var(--text-secondary)]">willing to <span className="text-[var(--pink)]">@jenny</span></p>
                </div>
              </div>
              <p className="font-bold mb-2">My entire vinyl collection</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <span>❤️ 234</span>
                  <span>💀 89</span>
                  <span className="text-amber-400">⚖️ 12 contests</span>
                </div>
                <span className="text-xs font-bold text-pink-400">DISPUTED</span>
              </div>
            </div>

            <div className="card-dark rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 gradient-avatar rounded-full flex items-center justify-center">🎭</div>
                <div>
                  <p className="font-bold">Samantha</p>
                  <p className="text-sm text-[var(--text-secondary)]">willing to <span className="text-[var(--pink)]">@alex</span></p>
                </div>
              </div>
              <p className="font-bold mb-2">My Netflix password (after I&apos;m gone)</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <span>❤️ 1.2k</span>
                  <span>💀 456</span>
                </div>
                <span className="text-xs font-bold text-purple-400">VALUABLE</span>
              </div>
            </div>

            <div className="card-dark rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 gradient-avatar rounded-full flex items-center justify-center">🖤</div>
                <div>
                  <p className="font-bold">Devon</p>
                  <p className="text-sm text-[var(--text-secondary)]">willing to <span className="text-[var(--pink)]">@mom</span></p>
                </div>
              </div>
              <p className="font-bold mb-2">The truth about what happened to the car in 2019</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <span>❤️ 567</span>
                  <span>💀 234</span>
                </div>
                <span className="text-xs font-bold text-red-400">EMOTIONAL BAGGAGE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 border-t border-[var(--card-border)]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">💀</div>
          <h2 className="font-['Bebas_Neue'] text-4xl md:text-5xl tracking-wider mb-4">
            READY TO GET MORBID?
          </h2>
          <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-lg mx-auto">
            Join thousands of people who&apos;ve decided to make their final wishes
            everyone else&apos;s business.
          </p>

          <Link
            href="/auth/login"
            className="inline-block gradient-cta py-4 px-12 rounded-full font-bold text-xl hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-500/25 mb-8"
          >
            Create Your Will 💀
          </Link>

          <p className="text-[var(--text-muted)] text-sm">
            You can&apos;t take it with you. But you can decide who gets it.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-cta py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bold tracking-wide flex items-center gap-2">
            <span>💀</span>
            <span>IWILL</span>
          </div>
          <a
            href="https://instagram.com/gotwilled"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sm tracking-wide hover:opacity-80 transition flex items-center gap-2"
          >
            <span>📸</span>
            <span>@gotwilled</span>
          </a>
          <p className="text-sm text-white/70">
            © 2025 Iwill. All rights reserved. Hopefully.
          </p>
        </div>
      </footer>
    </main>
  );
}
