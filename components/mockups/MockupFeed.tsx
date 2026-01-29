import { PhoneFrame } from "./PhoneFrame";

function MockupWillCard({
  initials,
  username,
  time,
  status,
  statusColor,
  item,
  recipient,
  reactions,
}: {
  initials: string;
  username: string;
  time: string;
  status: string;
  statusColor: string;
  item: string;
  recipient: string;
  reactions: { emoji: string; count: string; active?: boolean }[];
}) {
  return (
    <div className="bg-[#242424] rounded-2xl p-4 mb-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A855F7] to-[#6B21A8] flex items-center justify-center text-white font-bold text-sm">
          {initials}
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">{username}</div>
          <div className="text-[#666] text-xs">{time}</div>
        </div>
        <div
          className="px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase"
          style={{ backgroundColor: statusColor }}
        >
          {status}
        </div>
      </div>
      <div className="mb-3">
        <div className="font-['Bebas_Neue'] text-lg text-white mb-1">{item}</div>
        <div className="text-[#A855F7] text-xs">
          <span className="text-[#888]">willed to</span> {recipient}
        </div>
      </div>
      <div className="flex gap-2 pt-3 border-t border-[#333]">
        {reactions.map((r, i) => (
          <div
            key={i}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs ${
              r.active
                ? "bg-[#A855F7]/20 border border-[#A855F7]"
                : "bg-[#333]"
            }`}
          >
            <span>{r.emoji}</span>
            <span className={r.active ? "text-[#A855F7]" : "text-[#999]"}>
              {r.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MockupFeed() {
  return (
    <PhoneFrame>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-[#2a2a2a]">
        <div className="font-['Bebas_Neue'] text-xl text-[#A855F7] tracking-wide">
          IWILL 💀
        </div>
        <div className="flex gap-3">
          <div className="w-5 h-5 bg-[#333] rounded-full" />
          <div className="w-5 h-5 bg-[#333] rounded-full" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2a2a]">
        <div className="flex-1 py-3 text-center text-[#A855F7] text-xs font-semibold border-b-2 border-[#A855F7]">
          All
        </div>
        <div className="flex-1 py-3 text-center text-[#666] text-xs font-semibold">
          Following
        </div>
        <div className="flex-1 py-3 text-center text-[#666] text-xs font-semibold">
          My Wills
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-hidden p-3">
        <MockupWillCard
          initials="JD"
          username="@janedoe"
          time="2 hours ago"
          status="Accepted"
          statusColor="#A855F7"
          item="MY HAUNTED VICTORIAN DOLL"
          recipient="@bestfrenemy"
          reactions={[
            { emoji: "💀", count: "24", active: true },
            { emoji: "😂", count: "18" },
            { emoji: "🔥", count: "7" },
          ]}
        />
        <MockupWillCard
          initials="MK"
          username="@mikewills"
          time="5 hours ago"
          status="Pending"
          statusColor="#F59E0B"
          item="$47,000 IN STUDENT LOANS"
          recipient="@myex"
          reactions={[
            { emoji: "💀", count: "142" },
            { emoji: "😂", count: "89", active: true },
            { emoji: "👀", count: "34" },
          ]}
        />
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
