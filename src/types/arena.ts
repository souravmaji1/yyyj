// New Arena types as specified in the problem statement
export type EventType = "prediction" | "game" | "tournament";
export type EventStatus = "live" | "upcoming" | "ended";

// Filter types
export type ArenaFilter = "all" | "games" | "tournaments" | "predictions";
export type Secondary = "trending" | "endingSoon" | "new" | "highStakes" | "free";

export type Product = {
  id: string;
  title: string;
  priceXUT: number;
  image: string; // static placeholder path
  href?: string; // optional deep link
  badge?: string; // e.g., "Limited"
};

export type LeaderboardRow = {
  rank: number;
  handle: string; // display name
  pointsXUT: number; // show formatted with thousands and suffix XUT
  trophies?: number; // optional: 🏆 count
};

export type ArenaEvent = {
  id: string;
  title: string;
  type: EventType;
  status: EventStatus; // live/upcoming/ended
  entryFeeXUT: number;
  rewardsXUT: number;
  endsIn: string; // human friendly, e.g., "1h 23m"
  players: number;
  ctaLabel: string; // e.g., "Join Now" or "View"
  tags?: string[]; // search/filter chips
  thumbnail?: string; // image path
  // Detail modal content
  description?: string;
  eventStoreTitle: string; // "Event Store"
  products: Product[]; // can be empty
  leaderboardTitle?: string; // "Event Leaderboard"
  leaderboard?: LeaderboardRow[]; // optional
  // External game properties
  externalGameUrl?: string; // URL for external games
  requiresOAuth?: boolean; // Whether the game requires OAuth token
};

// Additional types for ArenaModal
export type ArenaItem = ArenaEvent;

export type Game = {
  id: string;
  title: string;
  subtitle: string;
  artUrl?: string;
  status: string;
  reward?: string;
};

export type Tournament = {
  id: string;
  title: string;
  subtitle: string;
  artUrl?: string;
  status: string;
  prizePool: number;
  startsAt: string;
};

export type PredictionMarket = {
  id: string;
  question: string;
  status: string;
  category: string;
  artUrl?: string;
  odds: {
    yes: number;
    no: number;
  };
  pool: number;
  closesAt: string;
};

// Friend activity type
export type FriendActivity = {
  user: string;
  avatar: string;
  activity: string;
};

// Leaderboard entry type
export type LeaderboardEntry = {
  user: string;
  avatar: string;
  winnings: number;
};

// API types
export type ArenaFeedParams = {
  primary: string;
  secondary: string[];
  search?: string;
  cursor?: string;
};

export type ArenaFeedResponse = {
  items: ArenaItem[];
  nextCursor?: string;
};

// Wallet and transaction types
export type WalletData = {
  balance: number;
};

export type TransactionResult = {
  txId: string;
  newBalance: number;
};

// Bet draft type
export type BetDraft = {
  marketId?: string;
  side?: 'yes' | 'no';
  amount?: number;
};