import { PhoneFrame } from "./PhoneFrame";

export function MockupWillCards() {
  return (
    <PhoneFrame>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-[#2a2a2a]">
        <span className="text-[#888] text-sm">← Back</span>
        <div className="font-['Bebas_Neue'] text-xl text-[#A855F7] tracking-wide">
          WILL DETAILS
        </div>
        <span className="text-[#888] text-sm opacity-0">Back</span>
      </div>

      {/* Will card */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="bg-[#242424] rounded-2xl p-4 border border-[#2a2a2a]">
          {/* User header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A855F7] to-[#6B21A8] flex items-center justify-center text-white font-bold">
              JD
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold">@janedoe</div>
              <div className="text-[#666] text-xs">2 hours ago</div>
            </div>
            <div className="px-3 py-1 rounded-xl text-[10px] font-bold text-white uppercase bg-[#22C55E]">
              Accepted
            </div>
          </div>

          {/* Content */}
          <div className="mb-4 pb-4 border-b border-[#2a2a2a]">
            <div className="font-['Bebas_Neue'] text-2xl text-white mb-2 leading-tight">
              MY HAUNTED VICTORIAN DOLL
            </div>
            <div className="text-[#888] text-sm mb-3 leading-relaxed">
              She&apos;s been in the family for 3 generations. Her eyes follow you. Good luck. 👁️
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#666] text-sm">willed to</span>
              <span className="text-[#A855F7] font-semibold">@bestfrenemy</span>
            </div>
          </div>

          {/* Reactions */}
          <div className="flex gap-2 flex-wrap">
            {[
              { emoji: "💀", count: "124", active: true },
              { emoji: "😂", count: "89" },
              { emoji: "🔥", count: "34" },
              { emoji: "👀", count: "56" },
              { emoji: "💰", count: "12" },
            ].map((r, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm cursor-pointer transition ${
                  r.active
                    ? "bg-[#A855F7]/15 border border-[#A855F7]"
                    : "bg-[#242424] border border-transparent hover:bg-[#2a2a2a]"
                }`}
              >
                <span className="text-base">{r.emoji}</span>
                <span className={r.active ? "text-[#A855F7] font-medium" : "text-[#999]"}>
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini cards below */}
        <div className="mt-4 space-y-2">
          <div className="text-[#A855F7] font-['Bebas_Neue'] text-sm tracking-wider mb-2">
            MORE FROM @JANEDOE
          </div>
          {[
            { item: "MY SPOTIFY PLAYLIST", to: "@musiclover" },
            { item: "STUDENT LOANS ($47K)", to: "@myex" },
          ].map((will, i) => (
            <div key={i} className="bg-[#242424] rounded-xl p-3">
              <div className="font-['Bebas_Neue'] text-white text-sm mb-1">
                {will.item}
              </div>
              <div className="text-[#888] text-xs">
                to <span className="text-[#A855F7]">{will.to}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav bar */}
      <div className="h-16 bg-[#1a1a1a] border-t border-[#2a2a2a] flex justify-around items-center pb-2">
        <div className="flex flex-col items-center gap-1 text-[#A855F7]">
          <span className="text-lg">🏠</span>
          <span className="text-[8px]">Feed</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-[#666]">
          <span className="text-lg">🔍</span>
          <span className="text-[8px]">Search</span>
        </div>
        <div className="w-11 h-11 bg-[#A855F7] rounded-full flex items-center justify-center text-white text-2xl -mt-4 shadow-lg shadow-[#A855F7]/40">
          +
        </div>
        <div className="flex flex-col items-center gap-1 text-[#666]">
          <span className="text-lg">📬</span>
          <span className="text-[8px]">Inbox</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-[#666]">
          <span className="text-lg">👤</span>
          <span className="text-[8px]">Profile</span>
        </div>
      </div>
    </PhoneFrame>
  );
}
