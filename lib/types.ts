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

export type NotificationType = "will_received" | "will_accepted" | "will_declined" | "reaction";

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
