export const SHARE_DESCRIPTIONS = [
  "Someone's planning their exit and you're in the Will. Open if you dare.",
  "You've been named in a Will. Curious? You should be.",
  "Dead serious about who gets what. See what's been willed on Iwill.",
  "Your name came up in someone's Will. Don't worry… or maybe do.",
  "Wills, drama, and questionable inheritance decisions. Welcome to Iwill.",
  "Someone thought of you in their final wishes. That's either sweet or savage.",
  "The only app where getting left something means someone planned their exit strategy.",
  "You've been willed something. Tap to find out if it's the good china or the drama.",
  "Last wishes, first laughs. See who's getting what on Iwill.",
  "Everyone's fighting over who gets what. Pick a side.",
] as const;

export function getRandomDescriptionIndex(): number {
  return Math.floor(Math.random() * SHARE_DESCRIPTIONS.length);
}

export function getShareDescription(index?: number | null): string {
  if (index === undefined || index === null || index < 0 || index >= SHARE_DESCRIPTIONS.length) {
    return SHARE_DESCRIPTIONS[getRandomDescriptionIndex()];
  }
  return SHARE_DESCRIPTIONS[index];
}

export function getRandomShareDescription(): string {
  return SHARE_DESCRIPTIONS[getRandomDescriptionIndex()];
}
