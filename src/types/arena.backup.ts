export type Status = 'live' | 'upcoming' | 'closed';
export type ArenaFilter = 'all' | 'games' | 'tournaments' | 'predictions';
export type Secondary = 'trending' | 'endingSoon' | 'new' | 'highStakes' | 'free';

export interface Game {
  id: string;
  title: string;
  subtitle: string;
  artUrl: string;
  status: Status;
  reward?: string; // e.g., "Pool: 500k XUT"
}

export interface Tournament {
  id: string;
  title: string;
  subtitle: string;
  artUrl: string;
  status: Status;
  prizePool: number; // XUT
  startsAt: string; // ISO
}

export interface PredictionMarket {
  id: string;
  question: string;
  category: 'Crypto' | 'Sports' | 'Politics' | 'Culture' | 'Tech';
  status: Status;
  pool: number; // XUT
  odds: { yes: number; no: number }; // 0..1 normalized
  closesAt: string;
  artUrl?: string;
}

export type ArenaItem = Game | Tournament | PredictionMarket;

export interface ArenaFeedParams {
  primary: ArenaFilter;
  secondary: string[];
  search?: string;
  cursor?: string;
}

export interface ArenaFeedResponse {
  items: ArenaItem[];
  nextCursor?: string;
}

export interface BetDraft {
  marketId?: string;
  side?: 'yes' | 'no';
  amount?: number;
}

export interface LeaderboardEntry {
  user: string;
  avatar: string;
  winnings: number;
}

export interface FriendActivity {
  user: string;
  avatar: string;
  activity: string;
}

export interface WalletData {
  balance: number;
}

export interface TransactionResult {
  txId: string;
  newBalance?: number;
}