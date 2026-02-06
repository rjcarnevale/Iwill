import { createClient } from "@/lib/supabase/server";
import { Will, Contest, Profile } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ContestThread } from "@/components/ContestThread";

interface WillPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WillPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: will } = await supabase
    .from("wills")
    .select(`
      *,
      giver:profiles!wills_giver_id_fkey(*),
      recipient:profiles!wills_recipient_id_fkey(*)
    `)
    .eq("id", id)
    .single();

  if (!will) {
    return {
      title: "Will Not Found - Iwill",
    };
  }

  const giverName = will.giver?.display_name || will.giver?.username || "Someone";
  const recipientName = will.recipient?.display_name ||
                        will.recipient?.username ||
                        will.recipient_email ||
                        "someone special";

  const title = `${giverName} left ${recipientName} something in their Will`;
  const description = `${giverName} left ${recipientName} something in their Will. See what it is on Iwill.`;

  return {
    title: `${title} - Iwill`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Iwill",
      images: will.image_url ? [{ url: will.image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: will.image_url ? [will.image_url] : undefined,
    },
  };
}

const TAGS = [
  { name: "CURSED", color: "#ec4899" },
  { name: "HAUNTED", color: "#A855F7" },
  { name: "EMOTIONAL BAGGAGE", color: "#f43f5e" },
  { name: "QUESTIONABLE", color: "#f97316" },
  { name: "DISPUTED", color: "#f59e0b" },
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

export default async function WillPage({ params }: WillPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get the will with giver and recipient info
  const { data: will } = await supabase
    .from("wills")
    .select(`
      *,
      giver:profiles!wills_giver_id_fkey(*),
      recipient:profiles!wills_recipient_id_fkey(*)
    `)
    .eq("id", id)
    .single();

  if (!will) {
    notFound();
  }

  // Check if current user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch contests
  const { data: contests } = await supabase
    .from("contests")
    .select(`
      *,
      contester:profiles!contests_contester_user_id_fkey(*)
    `)
    .eq("will_id", id)
    .order("created_at", { ascending: false });

  const giverName = will.giver?.display_name || will.giver?.username || "Someone";
  const recipientName = will.recipient?.display_name ||
                        will.recipient?.username ||
                        will.recipient_email ||
                        "someone special";

  // Get tag
  const selectedTag = will.tag ? TAGS.find(t => t.name === will.tag) : null;
  const fallbackTagIndex = will.id.charCodeAt(0) % TAGS.length;
  const tag = selectedTag || TAGS[fallbackTagIndex];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
      {/* Header */}
      <header className="gradient-header">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition">
            ← Back
          </Link>
          <h1 className="font-['Bebas_Neue'] text-xl text-[#A855F7] tracking-wide">
            IWILL 💀
          </h1>
          <div className="w-12" /> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        {/* Will Card */}
        <div className="card-dark rounded-2xl overflow-hidden mb-6">
          {/* User header */}
          <div className="px-5 pt-4 pb-3 flex items-center gap-3.5">
            <Link href={`/profile/${will.giver?.username}`}>
              {will.giver?.avatar_url ? (
                <Image
                  src={will.giver.avatar_url}
                  alt={giverName}
                  width={56}
                  height={56}
                  className="rounded-full"
                />
              ) : (
                <div className="w-14 h-14 gradient-avatar rounded-full flex items-center justify-center text-2xl">
                  👻
                </div>
              )}
            </Link>
            <div className="flex-1">
              <Link
                href={`/profile/${will.giver?.username}`}
                className="text-xl font-bold hover:underline"
              >
                {giverName}
              </Link>
              <p className="text-sm text-[var(--text-secondary)]">
                willing to{" "}
                {will.recipient ? (
                  <Link
                    href={`/profile/${will.recipient.username}`}
                    className="text-[var(--pink)] hover:underline"
                  >
                    {recipientName}
                  </Link>
                ) : (
                  <span>{recipientName}</span>
                )}
              </p>
            </div>
          </div>

          {/* Image/Emoji area */}
          <div className="mx-4 mb-4 rounded-2xl aspect-square flex flex-col items-center justify-center overflow-hidden">
            {will.image_url ? (
              <Image
                src={will.image_url}
                alt={will.item_description}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            ) : will.emoji ? (
              <div className="w-full h-full image-placeholder flex items-center justify-center text-8xl">
                {will.emoji}
              </div>
            ) : (
              <div className="w-full h-full image-placeholder flex flex-col items-center justify-center">
                <div className="text-5xl mb-2">🖼️</div>
              </div>
            )}
          </div>

          {/* Item details */}
          <div className="px-5 pb-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="text-xl font-bold">{will.item_description}</h2>
              <div className="flex items-center gap-2 shrink-0">
                {contests && contests.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold uppercase text-amber-400">
                    <span>Contested</span>
                    <span>⚖️</span>
                  </span>
                )}
                <span
                  className="text-xs font-bold uppercase"
                  style={{ color: tag.color }}
                >
                  {tag.name}
                </span>
              </div>
            </div>

            <p className="text-[var(--text-muted)] text-sm">
              {will.status === "accepted"
                ? `${recipientName} has accepted this will.`
                : will.status === "declined"
                ? `${recipientName} declined this will.`
                : "This will is pending acceptance."}
            </p>
          </div>
        </div>

        {/* Contest Thread */}
        {contests && contests.length > 0 && (
          <ContestThread
            willId={id}
            willOwnerId={will.giver_id}
            itemDescription={will.item_description}
            initialContests={contests as (Contest & { contester: Profile })[]}
          />
        )}

        {/* CTA for non-logged in users */}
        {!user ? (
          <div className="card-dark rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">👀</div>
            <h3 className="text-lg font-bold mb-2">
              Has someone left YOU something?
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              Sign up for Iwill to find out what people are leaving you in their Wills.
            </p>
            <Link
              href="/auth/login"
              className="block w-full gradient-cta py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Check It Out on Iwill 👀
            </Link>
            <p className="text-[var(--text-muted)] text-xs mt-3">
              You can&apos;t take it with you. But you can decide who gets it.
            </p>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 text-center gradient-cta py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              Go to Feed
            </Link>
            <Link
              href="/will/new"
              className="flex-1 text-center border border-[var(--purple)] text-[var(--purple)] py-3 rounded-full font-semibold hover:bg-[var(--purple)]/10 transition"
            >
              Will Something
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
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
