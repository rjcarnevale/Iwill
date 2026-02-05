import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

interface FuneralInvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function FuneralInvitePage({ params }: FuneralInvitePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  // Find the invite
  const { data: invite } = await supabase
    .from("funeral_guests")
    .select(`
      *,
      host:profiles!funeral_guests_user_id_fkey(*)
    `)
    .eq("invite_token", token)
    .single();

  if (!invite) {
    notFound();
  }

  // Get funeral preferences for the host
  const { data: preferences } = await supabase
    .from("funeral_preferences")
    .select("*")
    .eq("user_id", invite.user_id)
    .single();

  // Check if current user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  const host = invite.host;
  const hostName = host?.display_name || host?.username || "Someone";
  const isDisinvited = invite.status === "disinvited";

  const FUNERAL_TYPE_LABELS: Record<string, string> = {
    burial: "Traditional Burial",
    cremation: "Cremation",
    celebration_of_life: "Celebration of Life",
    viking_funeral: "Viking Funeral",
    surprise_me: "Surprise (TBD)",
    other: "Something Unique",
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-12">
        {isDisinvited ? (
          <>
            <div className="text-7xl mb-6">🚫</div>
            <h1 className="font-['Bebas_Neue'] text-3xl md:text-4xl text-red-500 tracking-wider mb-3">
              YOU&apos;VE BEEN DISINVITED
            </h1>
            <p className="text-[#888] text-lg mb-10">
              {hostName} has removed you from their funeral guest list. Ouch.
            </p>
            <p className="text-[#666] text-sm">
              Whatever you did, maybe apologize?
            </p>
          </>
        ) : (
          <>
            <div className="text-7xl mb-6">⚰️</div>
            <h1 className="font-['Bebas_Neue'] text-3xl md:text-4xl text-[#A855F7] tracking-wider mb-3">
              YOU&apos;RE INVITED
            </h1>
            <p className="text-[#888] text-lg mb-8">
              to {hostName}&apos;s funeral (eventually)
            </p>

            {/* Host card */}
            <div className="w-full max-w-sm bg-[#242424] rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                {host?.avatar_url ? (
                  <Image
                    src={host.avatar_url}
                    alt={hostName}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-15 h-15 gradient-avatar rounded-full flex items-center justify-center text-3xl p-4">
                    👻
                  </div>
                )}
                <div className="text-left">
                  <div className="font-bold text-lg">{hostName}</div>
                  <div className="text-[#666] text-sm">@{host?.username}</div>
                </div>
              </div>

              <p className="text-[#888] text-sm mb-4">
                {hostName} wants you there when they shuffle off this mortal coil. No pressure.
              </p>

              {preferences && (
                <div className="bg-[#1a1a1a] rounded-xl p-4 text-left space-y-2">
                  {preferences.funeral_type && (
                    <div className="flex justify-between">
                      <span className="text-[#666] text-sm">Type:</span>
                      <span className="text-white text-sm">{FUNERAL_TYPE_LABELS[preferences.funeral_type] || preferences.funeral_type}</span>
                    </div>
                  )}
                  {preferences.dress_code && (
                    <div className="flex justify-between">
                      <span className="text-[#666] text-sm">Dress Code:</span>
                      <span className="text-white text-sm">{preferences.dress_code}</span>
                    </div>
                  )}
                  {preferences.vibe_description && (
                    <div className="flex justify-between">
                      <span className="text-[#666] text-sm">Vibe:</span>
                      <span className="text-white text-sm">&quot;{preferences.vibe_description}&quot;</span>
                    </div>
                  )}
                  {preferences.venue_preference && (
                    <div className="flex justify-between">
                      <span className="text-[#666] text-sm">Venue:</span>
                      <span className="text-white text-sm">{preferences.venue_preference}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {user ? (
              <Link
                href="/"
                className="w-full max-w-sm bg-[#A855F7] text-white py-4 rounded-xl font-bold uppercase tracking-wide shadow-lg shadow-[#A855F7]/40 hover:opacity-90 transition text-center block mb-4"
              >
                Go to Feed
              </Link>
            ) : (
              <>
                <Link
                  href={`/auth/login?redirectTo=/funeral-invite/${token}`}
                  className="w-full max-w-sm bg-[#A855F7] text-white py-4 rounded-xl font-bold uppercase tracking-wide shadow-lg shadow-[#A855F7]/40 hover:opacity-90 transition text-center block mb-4"
                >
                  Sign Up to RSVP
                </Link>
                <p className="text-[#666] text-sm">
                  Join Iwill to plan your own send-off and see who&apos;s willing you stuff.
                </p>
              </>
            )}
          </>
        )}
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
