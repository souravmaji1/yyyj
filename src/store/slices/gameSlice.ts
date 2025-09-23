import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { getClientCookie } from '@/src/core/config/localStorage';

// Define a generic state type to avoid circular dependencies
type AppState = {
  games: {
    games: any[];
    loading: boolean;
    error: string | null;
    selectedGame: any | null;
    filters: {
      status: string;
      search: string;
      category: string;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
};

// Game Management interface that extends the base Game type
export interface GameManagement {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: string[];
  developer: string;
  gameType: string;
  revenueSource: string;
  nftLinked: boolean;
  status: 'live' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt: string;
  artUrl: string;
  description?: string;
  steps?: Array<{
    id: number;
    title: string;
    content: string;
  }>;
  supportsMobile?: boolean;
  isMultiplayer?: boolean;
  hasInGamePurchases?: boolean;
  orientation?: 'portrait' | 'landscape' | 'both';
  gameCategories?: string[];
  gameControls?: string;
  sdkIntegrated?: boolean;
  hasTournament?: boolean;
  hasLeaderboard?: boolean;
  entryFee?: string;
  firstPrize?: string;
  runnerUpPrize?: string;
  thirdPrize?: string;
  revenueSources?: {
    ads: boolean;
    subscriptions: boolean;
  };
  adsPublisherId?: string;
  adsNetworkIntegration?: string;
  adsFrequency?: string;
  adsPlacementTypes?: string;
  subscriptionTiers?: Array<{
    id: number;
    price: string;
    tierName: string;
    features: {
      noAds: boolean;
      extraLevels: boolean;
      specialNfts: boolean;
    };
    customFeature: string;
    duration: string;
  }>;
}

// Comprehensive form data interface matching API payload requirements
export interface GameFormData {
  // Basic Information
  gameTitle: string;
  gameDescription: string;
  logoFile: File | null;
  coverPhotoFiles: File[];
  
  // Game Files & Configuration
  zipFile: File | null;
  initializationCode: string;
  serverPath: string;
  gameType: string;
  
  // Game Steps
  steps: Array<{
    id: number;
    title: string;
    content: string;
  }>;
  
  // Platform Support
  supportsMobile: boolean;
  isMultiplayer: boolean;
  hasInGamePurchases: boolean;
  orientation: 'portrait' | 'landscape' | 'both';
  gameCategories: string[];
  
  // Game Controls & Instructions
  gameControls: string;
  
  // SDK & Competition
  sdkIntegrated: boolean;
  hasTournament: boolean;
  hasLeaderboard: boolean;
  
  // Tournament Prizes
  entryFee: string;
  firstPrize: string;
  runnerUpPrize: string;
  thirdPrize: string;
  
  // Revenue Configuration
  revenueSources: {
    ads: boolean;
    subscriptions: boolean;
  };
  adsPublisherId: string;
  adsNetworkIntegration: string;
  adsFrequency: string;
  adsPlacementTypes: string;
  subscriptionTiers: Array<{
    id: number;
    price: string;
    tierName: string;
    features: {
      noAds: boolean;
      extraLevels: boolean;
      specialNfts: boolean;
    };
    customFeature: string;
    duration: string;
  }>;
  
  // Form Status
  status: 'active' | 'inactive';
  termsAccepted: boolean;
}

export interface UpdateGameStatusPayload {
  gameId: string;
  status: 'live' | 'pending' | 'rejected';
  rejectionNote?: string;
}

interface GameState {
  games: GameManagement[];
  loading: boolean;
  error: string | null;
  selectedGame: GameManagement | null;
  filters: {
    status: string;
    search: string;
    category: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const initialState: GameState = {
  games: [],
  loading: false,
  error: null,
  selectedGame: null,
  filters: {
    status: '',
    search: '',
    category: '',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

// Mock data removed - now using real API calls

// Async thunk for fetching games
export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (_, { rejectWithValue }) => {
    try {
      const token = getClientCookie('accessToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_GAME_BASE_URL}/userGgame/info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to fetch games');
      }
      
      return response.data.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch games'
      );
    }
  }
);

// Async thunk for fetching a single game by ID
export const fetchGameById = createAsyncThunk(
  'games/fetchGameById',
  async (gameId: string, { rejectWithValue }) => {
    try {
      const token = getClientCookie('accessToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_GAME_BASE_URL}/game/info/${gameId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to fetch game');
      }
      
      return response.data.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch game'
      );
    }
  }
);

// Async thunk for updating game status
export const updateGameStatus = createAsyncThunk(
  'games/updateStatus',
  async (payload: UpdateGameStatusPayload, { rejectWithValue }) => {
    try {
      const token = getClientCookie('accessToken');
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_GAME_BASE_URL}/game/info/${payload.gameId}/status`,
        payload,
        { 
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to update game status');
      }
      
      return response.data.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update game status'
      );
    }
  }
);

// Async thunk for creating a new game
export const createGame = createAsyncThunk(
  'games/createGame',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const token = getClientCookie('accessToken');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_GAME_BASE_URL}/game/info`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to create game');
      }
      
      return response.data.data || response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create game'
      );
    }
  }
);

// Async thunk for deleting a game
export const deleteGame = createAsyncThunk(
  'games/deleteGame',
  async (gameId: string, { rejectWithValue }) => {
    try {
      const token = getClientCookie('accessToken');
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_GAME_BASE_URL}/game/info/${gameId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to delete game');
      }
      
      return gameId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete game'
      );
    }
  }
);

const gameSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setSelectedGame: (state, action: PayloadAction<GameManagement | null>) => {
      state.selectedGame = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<GameState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        search: '',
        category: '',
      };
    },
    setPagination: (state, action: PayloadAction<Partial<GameState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch games
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        
        // Validate and sanitize game data to ensure required properties exist
        const validatedGames = Array.isArray(action.payload) ? action.payload.map(game => ({
          id: game.id || '',
          title: game.title || game.gameTitle || '',
          developer: game.developer || 'Unknown Developer',
          category: Array.isArray(game.category) ? game.category : 
                   Array.isArray(game.gameCategories) ? game.gameCategories : [],
          status: game.status || 'pending',
          ...game // Keep all other properties
        })) : [];
        
        state.games = validatedGames;
        state.pagination.totalItems = validatedGames.length;
        state.pagination.totalPages = Math.ceil(validatedGames.length / state.pagination.itemsPerPage);
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single game by ID
      .addCase(fetchGameById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.loading = false;
        
        // Validate and sanitize single game data
        const validatedGame = {
          id: action.payload.id || '',
          title: action.payload.title || action.payload.gameTitle || '',
          developer: action.payload.developer || 'Unknown Developer',
          category: Array.isArray(action.payload.category) ? action.payload.category : 
                   Array.isArray(action.payload.gameCategories) ? action.payload.gameCategories : [],
          status: action.payload.status || 'pending',
          ...action.payload // Keep all other properties
        };
        
        state.selectedGame = validatedGame;
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update game status
      .addCase(updateGameStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateGameStatus.fulfilled, (state, action) => {
        const index = state.games.findIndex(game => game.id === action.payload.id);
        if (index !== -1) {
          // Validate and sanitize updated game data
          const validatedGame = {
            id: action.payload.id || '',
            title: action.payload.title || action.payload.gameTitle || '',
            developer: action.payload.developer || 'Unknown Developer',
            category: Array.isArray(action.payload.category) ? action.payload.category : 
                     Array.isArray(action.payload.gameCategories) ? action.payload.gameCategories : [],
            status: action.payload.status || 'pending',
            ...action.payload // Keep all other properties
          };
          
          state.games[index] = validatedGame;
        }
      })
      .addCase(updateGameStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Create game
      .addCase(createGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGame.fulfilled, (state, action) => {
        state.loading = false;
        
        // Validate and sanitize new game data
        const validatedGame = {
          id: action.payload.id || '',
          title: action.payload.title || action.payload.gameTitle || '',
          developer: action.payload.developer || 'Unknown Developer',
          category: Array.isArray(action.payload.category) ? action.payload.category : 
                   Array.isArray(action.payload.gameCategories) ? action.payload.gameCategories : [],
          status: action.payload.status || 'pending',
          ...action.payload // Keep all other properties
        };
        
        state.games.unshift(validatedGame);
        state.pagination.totalItems += 1;
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
      })
      .addCase(createGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete game
      .addCase(deleteGame.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteGame.fulfilled, (state, action) => {
        state.games = state.games.filter(game => game.id !== action.payload);
        state.pagination.totalItems -= 1;
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
      })
      .addCase(deleteGame.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setSelectedGame,
  setFilters,
  clearFilters,
  setPagination,
  clearError,
} = gameSlice.actions;

// Export selectors
export const selectGames = (state: AppState) => state.games.games;
export const selectGamesLoading = (state: AppState) => state.games.loading;
export const selectGamesError = (state: AppState) => state.games.error;
export const selectSelectedGame = (state: AppState) => state.games.selectedGame;
export const selectSelectedGameLoading = (state: AppState) => state.games.loading;
export const selectGamesFilters = (state: AppState) => state.games.filters;
export const selectGamesPagination = (state: AppState) => state.games.pagination;

// Export filtered games selector
export const selectFilteredGames = (state: AppState) => {
  // Safety check for state structure
  if (!state?.games?.games || !Array.isArray(state.games.games)) {
    return [];
  }
  
  const { games, filters } = state.games;
  
  // Safety check for filters
  if (!filters) {
    return games;
  }
  
  return games.filter((game: any) => {
    // Safety check for game object
    if (!game || typeof game !== 'object') {
      return false;
    }
    
    // Search filter - add null checks
    const searchTerm = filters.search?.toLowerCase() || '';
    const gameTitle = game.title?.toLowerCase() || '';
    const gameDeveloper = game.developer?.toLowerCase() || '';
    const gameCategories = Array.isArray(game.category) ? game.category : [];
    
    const matchesSearch = 
      gameTitle.includes(searchTerm) ||
      gameDeveloper.includes(searchTerm) ||
      gameCategories.some((cat: any) => cat?.toLowerCase()?.includes(searchTerm));
    
    // Status filter
    const matchesStatus = !filters.status || game.status === filters.status;
    
    // Category filter - add null checks
    const matchesCategory = !filters.category || gameCategories.some((cat: any) => 
      cat?.toLowerCase() === filters.category?.toLowerCase()
    );
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
};

export default gameSlice.reducer;
