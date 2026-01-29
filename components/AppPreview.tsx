"use client";

import { MockupFeed, MockupClaim, MockupWillCards } from "./mockups";

export function AppPreview() {
  return (
    <div className="py-16 px-4">
      <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl text-center mb-4 tracking-wider uppercase">
        App Preview
      </h2>
      <p className="text-[var(--text-secondary)] text-center mb-12 max-w-lg mx-auto">
        See what awaits you inside. Spoiler: it&apos;s mostly other people&apos;s emotional baggage.
      </p>

      <div className="flex gap-8 justify-center overflow-x-auto pb-4 px-4 snap-x snap-mandatory md:snap-none">
        <div className="snap-center shrink-0">
          <div className="text-center mb-4">
            <span className="font-['Bebas_Neue'] text-sm text-[#A855F7] tracking-widest uppercase">
              The Feed
            </span>
          </div>
          <MockupFeed />
        </div>

        <div className="snap-center shrink-0">
          <div className="text-center mb-4">
            <span className="font-['Bebas_Neue'] text-sm text-[#A855F7] tracking-widest uppercase">
              Claim Page
            </span>
          </div>
          <MockupClaim />
        </div>

        <div className="snap-center shrink-0">
          <div className="text-center mb-4">
            <span className="font-['Bebas_Neue'] text-sm text-[#A855F7] tracking-widest uppercase">
              Will Details
            </span>
          </div>
          <MockupWillCards />
        </div>
      </div>
    </div>
  );
}
