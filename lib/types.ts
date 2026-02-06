export type WillStatus = "pending" | "accepted" | "declined";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  executor_email: string | null;
  created_at: string;
}

export interface Will {
  id: string;
  giver_id: string;
  recipient_id: string | null;
  recipient_email: string | null;
  item_description: string;
  emoji: string | null;
  image_url: string | null;
  tag: string | null;
  is_public: boolean;
  status: WillStatus;
  created_at: string;
  // Joined fields
  giver?: Profile;
  recipient?: Profile;
  reactions?: Reaction[];
  reaction_counts?: ReactionCount[];
}

export interface Reaction {
  id: string;
  will_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: Profile;
}

export interface ReactionCount {
  emoji: string;
  count: number;
}

export interface PendingClaim {
  id: string;
  will_id: string;
  email: string;
  claim_token: string;
  claimed: boolean;
  created_at: string;
}

export const REACTION_EMOJIS = ["💀", "😂", "🔥", "👀", "💰"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export type NotificationType = "will_received" | "will_accepted" | "will_declined" | "reaction" | "funeral_invite";

export type FuneralType = "burial" | "cremation" | "celebration_of_life" | "viking_funeral" | "surprise_me" | "other";
export type CasketPreference = "open" | "closed" | "no_casket";
export type GuestStatus = "invited" | "disinvited";

export interface FuneralPreferences {
  id: string;
  user_id: string;
  funeral_type: FuneralType | null;
  music_playlist: string | null;
  spotify_playlist_url: string | null;
  dress_code: string | null;
  venue_preference: string | null;
  casket_preference: CasketPreference | null;
  vibe_description: string | null;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface FuneralGuest {
  id: string;
  user_id: string;
  guest_user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  status: GuestStatus;
  invite_token: string;
  created_at: string;
  // Joined fields
  guest_user?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string;
  will_id: string | null;
  emoji: string | null;
  read: boolean;
  created_at: string;
  // Joined fields
  actor?: Profile;
  will?: Will;
}
