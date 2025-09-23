import { 
  Game, 
  Tournament, 
  PredictionMarket, 
  ArenaItem, 
  ArenaFeedParams, 
  ArenaFeedResponse,
  LeaderboardEntry,
  FriendActivity,
  WalletData,
  TransactionResult
} from '@/src/types/arena';

// Mock data
const mockGames: Game[] = [
  {
    id: 'game_1',
    title: 'Cyber Champions',
    subtitle: 'Battle Arena Showdown',
    artUrl: '/images/game1.png',
    status: 'live',
    reward: 'Pool: 500k XUT'
  },
  {
    id: 'game_2',
    title: 'Space Warriors',
    subtitle: 'Galactic Combat',
    artUrl: '/images/game2.png',
    status: 'upcoming',
    reward: 'Prize: 250k XUT'
  },
  {
    id: 'game_3',
    title: 'Digital Legends',
    subtitle: 'RPG Adventure',
    artUrl: '/images/game3.png',
    status: 'live',
    reward: 'Pool: 750k XUT'
  },
  {
    id: 'game_4',
    title: 'Neon Racers',
    subtitle: 'High-Speed Racing',
    artUrl: '/images/game4.png',
    status: 'upcoming',
    reward: 'Prize: 300k XUT'
  }
];

const mockTournaments: Tournament[] = [
  {
    id: 'tournament_1',
    title: 'Esports World Cup 2025',
    subtitle: 'Global Championship',
    artUrl: '/images/image1.png',
    status: 'upcoming',
    prizePool: 1000000,
    startsAt: '2025-03-15T10:00:00Z'
  },
  {
    id: 'tournament_2',
    title: 'MLBB Mid-Season Cup 2025',
    subtitle: 'Regional Qualifiers',
    artUrl: '/images/MLBB.png',
    status: 'live',
    prizePool: 500000,
    startsAt: '2025-02-01T14:00:00Z'
  },
  {
    id: 'tournament_3',
    title: 'PUBG Mobile World Cup 2025',
    subtitle: 'Battle Royale Championship',
    artUrl: '/images/pubg.png',
    status: 'upcoming',
    prizePool: 750000,
    startsAt: '2025-04-20T16:00:00Z'
  },
  {
    id: 'tournament_4',
    title: 'Valorant Masters Toronto 2025',
    subtitle: 'International Stage',
    artUrl: '/images/Toronto.png',
    status: 'live',
    prizePool: 600000,
    startsAt: '2025-01-28T12:00:00Z'
  }
];

const mockPredictions: PredictionMarket[] = [
  {
    id: 'prediction_1',
    question: 'Will Bitcoin reach $100k by end of 2025?',
    category: 'Crypto',
    status: 'live',
    pool: 250000,
    odds: { yes: 0.65, no: 0.35 },
    closesAt: '2025-12-31T23:59:59Z',
    artUrl: '/images/crypto.png'
  },
  {
    id: 'prediction_2',
    question: 'Who will win the 2025 League World Championship?',
    category: 'Sports',
    status: 'live',
    pool: 180000,
    odds: { yes: 0.42, no: 0.58 },
    closesAt: '2025-10-15T20:00:00Z',
    artUrl: '/images/esports.png'
  },
  {
    id: 'prediction_3',
    question: 'Will AI achieve AGI milestone in 2025?',
    category: 'Tech',
    status: 'upcoming',
    pool: 320000,
    odds: { yes: 0.28, no: 0.72 },
    closesAt: '2025-06-30T12:00:00Z',
    artUrl: '/images/ai.png'
  },
  {
    id: 'prediction_4',
    question: 'Next US Presidential Election Winner?',
    category: 'Politics',
    status: 'upcoming',
    pool: 450000,
    odds: { yes: 0.51, no: 0.49 },
    closesAt: '2028-11-07T23:59:59Z',
    artUrl: '/images/politics.png'
  }
];

const mockLeaderboard: LeaderboardEntry[] = [
  { user: 'CryptoKing', avatar: '/avatars/user1.png', winnings: 125000 },
  { user: 'GameMaster99', avatar: '/avatars/user2.png', winnings: 98000 },
  { user: 'PredictorPro', avatar: '/avatars/user3.png', winnings: 87500 },
  { user: 'BetWizard', avatar: '/avatars/user4.png', winnings: 76200 },
  { user: 'LuckyStrike', avatar: '/avatars/user5.png', winnings: 65800 },
];

const mockFriends: FriendActivity[] = [
  { user: 'Alice_Gaming', avatar: '/avatars/friend1.png', activity: 'Playing Cyber Champions' },
  { user: 'Bob_Trader', avatar: '/avatars/friend2.png', activity: 'Betting on Bitcoin prediction' },
  { user: 'Charlie_Pro', avatar: '/avatars/friend3.png', activity: 'Joined Valorant tournament' },
  { user: 'Diana_Lucky', avatar: '/avatars/friend4.png', activity: 'Won 5000 XUT!' },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchFeatured(): Promise<ArenaItem[]> {
  await delay(800);
  
  // Return a mix of featured items
  return [
    mockTournaments[0] as any, // Featured tournament
    mockGames[0] as any,       // Featured game
    mockPredictions[0] as any, // Featured prediction
    mockGames[2] as any,       // Another featured game
  ];
}

export async function fetchArenaFeed(params: ArenaFeedParams): Promise<ArenaFeedResponse> {
  await delay(600);
  
  let items: ArenaItem[] = [];
  
  // Filter by primary category
  switch (params.primary) {
    case 'games':
      items = [...mockGames] as any;
      break;
    case 'tournaments':
      items = [...mockTournaments] as any;
      break;
    case 'predictions':
      items = [...mockPredictions] as any;
      break;
    default:
      items = [...mockGames, ...mockTournaments, ...mockPredictions] as any;
  }
  
  // Apply secondary filters
  if (params.secondary.includes('live')) {
    items = items.filter(item => item.status === 'live');
  }
  if (params.secondary.includes('endingSoon')) {
    // Mock logic for ending soon
    items = items.filter(item => 
      'closesAt' in item || 'startsAt' in item
    );
  }
  if (params.secondary.includes('trending')) {
    // Mock trending logic - return first few items
    items = items.slice(0, Math.ceil(items.length / 2));
  }
  
  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    items = items.filter(item => {
      if ('question' in item) {
        // PredictionMarket
        return (item as any).question.toLowerCase().includes(searchLower) ||
               (item as any).category.toLowerCase().includes(searchLower);
      } else {
        // Game or Tournament
        return (item as any).title.toLowerCase().includes(searchLower) ||
               (item as any).subtitle.toLowerCase().includes(searchLower);
      }
    });
  }
  
  // Simulate pagination
  const pageSize = 12;
  const startIndex = params.cursor ? parseInt(params.cursor) : 0;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    nextCursor: endIndex < items.length ? endIndex.toString() : undefined
  };
}

export async function placeBet(marketId: string, side: 'yes' | 'no', amount: number): Promise<TransactionResult> {
  await delay(1200);
  
  // Simulate success/failure
  if (Math.random() > 0.05) { // 95% success rate
    // Get current balance dynamically (this would come from actual user balance in real app)
    const currentBalance = Math.floor(Math.random() * 5000) + 100; // Random balance between 100-5100
    return {
      txId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      newBalance: Math.max(0, currentBalance - amount) // Mock balance update
    };
  } else {
    throw new Error('Transaction failed. Please try again.');
  }
}

export async function joinTournament(id: string): Promise<TransactionResult> {
  await delay(1000);
  
  const entryFee = 100; // Mock entry fee
  const currentBalance = Math.floor(Math.random() * 5000) + 100; // Random balance between 100-5100
  return {
    txId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    newBalance: Math.max(0, currentBalance - entryFee)
  };
}

export async function startGame(id: string): Promise<{ sessionId: string }> {
  await delay(800);
  
  return {
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

export async function fetchWallet(): Promise<WalletData> {
  await delay(400);
  
  return {
    balance: Math.floor(Math.random() * 3000) + 100 // Mock balance variation between 100-3100
  };
}

export async function addTokens(amount: number): Promise<{ newBalance: number }> {
  await delay(1500);
  
  const currentBalance = Math.floor(Math.random() * 3000) + 100; // Random current balance
  return {
    newBalance: currentBalance + amount // Mock balance increase
  };
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  await delay(600);
  
  return [...mockLeaderboard];
}

export async function fetchFriendsNow(): Promise<FriendActivity[]> {
  await delay(500);
  
  return [...mockFriends];
}