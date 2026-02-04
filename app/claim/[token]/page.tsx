import { createClient } from "@/lib/supabase/server";
import { WillCard } from "@/components/WillCard";
import { Will } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ClaimPageProps {
  params: Promise<{ token: string }>;
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { token } = await params;
  const supabase = await createClient();

  // Find the pending claim
  const { data: claim } = await supabase
    .from("pending_claims")
    .select("*, will:wills(*)")
    .eq("claim_token", token)
    .single();

  if (!claim) {
    notFound();
  }

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the full will with giver info
  const { data: will } = await supabase
    .from("wills")
    .select(
      `
      *,
      giver:profiles!wills_giver_id_fkey(*),
      recipient:profiles!wills_recipient_id_fkey(*)
    `
    )
    .eq("id", claim.will_id)
    .single();

  if (!will) {
    notFound();
  }

  // If user is logged in and claim hasn't been processed, link it
  if (user && !claim.claimed) {
    // Update the will to set recipient_id
    await supabase
      .from("wills")
      .update({ recipient_id: user.id })
      .eq("id", claim.will_id);

    // Mark claim as claimed
    await supabase
      .from("pending_claims")
      .update({ claimed: true })
      .eq("id", claim.id);
  }

  // Logged in user - show the revealed will
  if (user) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="font-['Bebas_Neue'] text-3xl text-[#A855F7] tracking-wide mb-2">
              IT&apos;S YOURS!
            </h1>
            <p className="text-[var(--text-secondary)]">
              Here&apos;s what {will.giver?.display_name || will.giver?.username || "someone"} left you.
            </p>
          </div>

          <div className="mb-8">
            <WillCard will={will as Will} showActions={false} />
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full text-center gradient-cta py-4 px-6 rounded-full font-bold text-lg hover:opacity-90 transition"
            >
              Go to Feed 💀
            </Link>
            <Link
              href="/will/new"
              className="block w-full text-center border border-[#A855F7] text-[#A855F7] py-4 px-6 rounded-full font-bold text-lg hover:bg-[#A855F7]/10 transition"
            >
              Will Something Back
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 py-4 text-center">
          <span className="font-['Bebas_Neue'] text-lg text-[#444] tracking-wide">
            IWILL 💀
          </span>
        </footer>
      </main>
    );
  }

  // Logged out user - show the mystery teaser
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Coffin emoji */}
        <div className="text-7xl mb-6 animate-bounce">⚰️</div>

        {/* Title */}
        <h1 className="font-['Bebas_Neue'] text-3xl md:text-4xl text-[#A855F7] tracking-wider mb-3">
          SOMEONE LEFT YOU SOMETHING
        </h1>
        <p className="text-[#888] text-lg mb-10">
          (hopefully not their problems)
        </p>

        {/* Mystery box */}
        <div className="w-full max-w-sm bg-[#242424] rounded-2xl p-6 border-2 border-dashed border-[#A855F7] relative mb-8">
          {/* Question mark badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#A855F7] rounded-full flex items-center justify-center text-white font-bold text-lg">
            ?
          </div>

          <div className="text-[#666] text-xs uppercase tracking-widest mb-2 mt-2">
            From
          </div>
          <div className="text-white font-semibold text-lg mb-6">
            @{will.giver?.username || "someone"}
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-5">
            <div className="text-[#666] text-xs uppercase tracking-widest mb-3">
              They willed you
            </div>
            <div className="font-['Bebas_Neue'] text-xl text-[#A855F7] flex items-center justify-center gap-3">
              <span className="blur-md text-white select-none">
                {will.item_description.toUpperCase()}
              </span>
              <span className="text-2xl">🔒</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href={`/auth/login?redirectTo=/claim/${token}`}
          className="w-full max-w-sm bg-[#A855F7] text-white py-4 rounded-xl font-bold uppercase tracking-wide shadow-lg shadow-[#A855F7]/40 hover:opacity-90 transition text-center block mb-4"
        >
          Sign Up to See What You Got 💀
        </Link>
        <p className="text-[#666] text-sm">
          Free. Takes 30 seconds. Regret optional.
        </p>
      </div>

      {/* Footer logo */}
      <div className="pb-10 text-center">
        <span className="font-['Bebas_Neue'] text-xl text-[#444] tracking-wide">
          IWILL 💀
        </span>
      </div>
    </main>
  );
}
