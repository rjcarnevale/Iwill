import { PhoneFrame } from "./PhoneFrame";

export function MockupClaim() {
  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Coffin emoji */}
        <div className="text-6xl mb-5 animate-bounce">⚰️</div>

        {/* Title */}
        <div className="font-['Bebas_Neue'] text-2xl text-[#A855F7] tracking-wider mb-2">
          SOMEONE LEFT YOU SOMETHING
        </div>
        <div className="text-[#888] text-sm mb-8">
          (hopefully not their problems)
        </div>

        {/* Mystery box */}
        <div className="w-full bg-[#242424] rounded-2xl p-5 border-2 border-dashed border-[#A855F7] relative mb-6">
          {/* Question mark badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-[#A855F7] rounded-full flex items-center justify-center text-white font-bold">
            ?
          </div>

          <div className="text-[#666] text-[10px] uppercase tracking-wider mb-1">
            From
          </div>
          <div className="text-white font-semibold mb-4">@janedoe</div>

          <div className="bg-[#1a1a1a] rounded-xl p-4">
            <div className="text-[#666] text-[10px] uppercase tracking-wider mb-2">
              They willed you
            </div>
            <div className="font-['Bebas_Neue'] text-lg text-[#A855F7] flex items-center justify-center gap-2">
              <span className="blur-sm text-white select-none">HAUNTED DOLL</span>
              <span>🔒</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-[#A855F7] text-white py-4 rounded-xl font-bold uppercase tracking-wide shadow-lg shadow-[#A855F7]/40 mb-3">
          Sign Up to See What You Got 💀
        </button>
        <div className="text-[#666] text-xs">
          Free. Takes 30 seconds. Regret optional.
        </div>
      </div>

      {/* Footer logo */}
      <div className="pb-8 text-center">
        <span className="font-['Bebas_Neue'] text-lg text-[#444] tracking-wide">
          IWILL 💀
        </span>
      </div>
    </PhoneFrame>
  );
}
