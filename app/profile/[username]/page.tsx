import { createClient } from "@/lib/supabase/server";
import { WillCard } from "@/components/WillCard";
import { Will } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const isOwnProfile = currentUser?.id === profile.id;

  // If viewing own profile, show all wills (including private)
  // Otherwise, only show public wills
  let willsQuery = supabase
    .from("wills")
    .select(
      `
      *,
      giver:profiles!wills_giver_id_fkey(*),
      recipient:profiles!wills_recipient_id_fkey(*)
    `
    )
    .eq("giver_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!isOwnProfile) {
    willsQuery = willsQuery.eq("is_public", true);
  }

  const { data: wills } = await willsQuery;

  // Fetch inherited wills (where user is recipient) - only for own profile
  let inheritedWills: Will[] = [];
  if (isOwnProfile) {
    const { data: inherited } = await supabase
      .from("wills")
      .select(
        `
        *,
        giver:profiles!wills_giver_id_fkey(*),
        recipient:profiles!wills_recipient_id_fkey(*)
      `
      )
      .eq("recipient_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50);

    inheritedWills = (inherited as Will[]) || [];
  }

  // Count stats
  const totalWills = wills?.length || 0;
  const publicWills = wills?.filter((w) => w.is_public).length || 0;
  const pendingInherited = inheritedWills.filter((w) => w.status === "pending").length;

  return (
    <main className="min-h-screen">
      <header className="gradient-header sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="hover:opacity-80 transition">
            ← Back
          </Link>
          <h1 className="font-bold tracking-wide">
            {profile.display_name || profile.username}
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        {/* Profile header */}
        <div className="py-6">
          <div className="card-dark rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.username}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 gradient-avatar rounded-full flex items-center justify-center text-3xl">
                    👻
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">
                    {profile.display_name || profile.username}
                  </h2>
                  <p className="text-[var(--text-secondary)]">@{profile.username}</p>
                </div>
              </div>
              {isOwnProfile && (
                <Link
                  href="/profile/settings"
                  className="px-4 py-1.5 border border-[var(--card-border)] rounded-full text-sm hover:bg-white/5 transition"
                >
                  Edit profile
                </Link>
              )}
            </div>

            {profile.bio && (
              <p className="mt-4 text-[var(--text-secondary)]">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex gap-6">
              <div>
                <span className="text-xl font-bold">{totalWills}</span>
                <span className="text-[var(--text-muted)] ml-2">
                  {totalWills === 1 ? "will" : "wills"}
                </span>
              </div>
              {isOwnProfile && inheritedWills.length > 0 && (
                <div>
                  <span className="text-xl font-bold">{inheritedWills.length}</span>
                  <span className="text-[var(--text-muted)] ml-2">inherited</span>
                </div>
              )}
              {isOwnProfile && totalWills !== publicWills && (
                <div className="text-[var(--text-muted)]">
                  <span>{publicWills} public</span>
                  <span className="mx-2">·</span>
                  <span>{totalWills - publicWills} private</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inherited wills - only show on own profile */}
        {isOwnProfile && inheritedWills.length > 0 && (
          <div className="pb-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              Inherited
              {pendingInherited > 0 && (
                <span className="bg-[var(--pink)] text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingInherited} pending
                </span>
              )}
            </h3>
            <div className="space-y-4">
              {inheritedWills.map((will) => (
                <WillCard key={will.id} will={will as Will} />
              ))}
            </div>
          </div>
        )}

        {/* Wills list */}
        <div className="pb-20">
          <h3 className="text-lg font-bold mb-4">
            {isOwnProfile ? "Your Wills" : "Wills"}
          </h3>

          {wills && wills.length > 0 ? (
            <div className="space-y-4">
              {wills.map((will) => (
                <WillCard key={will.id} will={will as Will} />
              ))}
            </div>
          ) : (
            <div className="card-dark rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">💀</div>
              <p className="text-[var(--text-muted)]">
                {isOwnProfile
                  ? "You haven't willed anything yet. Start your legacy."
                  : "No public wills yet."}
              </p>
              {isOwnProfile && (
                <Link
                  href="/will/new"
                  className="inline-block mt-4 gradient-cta px-6 py-2 rounded-full font-medium hover:opacity-90 transition"
                >
                  Create your first will
                </Link>
              )}
            </div>
          )}
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
