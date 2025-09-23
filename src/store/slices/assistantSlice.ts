import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getLocalData, setLocalData } from '@/src/core/config/localStorage';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface ChatSession {
  sessionId: string;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

export interface AssistantContext {
  pathname: string;
  title?: string;
  selection?: string;
  meta?: Record<string, string>;
  ua?: string;
}

export interface AssistantState {
  // Panel state
  open: boolean;
  recording: boolean;
  ttsEnabled: boolean;
  loading: boolean;
  error: string | null;
  
  // Messages and conversation
  messages: AssistantMessage[];
  
  // Session management
  session: ChatSession | null;
  
  // Context for feedback
  context: AssistantContext;
  
  // Persistence
  lastSaved: Date | null;
  isDirty: boolean;
}

const initialState: AssistantState = {
  open: false,
  recording: false,
  ttsEnabled: true,
  loading: false,
  error: null,
  messages: [],
  session: null,
  context: {
    pathname: '/',
  },
  lastSaved: null,
  isDirty: false,
};

// Load initial state from localStorage
const loadAssistantFromStorage = (): Partial<AssistantState> => {
  try {
    const stored = getLocalData<Partial<AssistantState>>('assistantState');
    if (stored) {
      // Convert timestamp strings back to Date objects
      const messages = stored.messages?.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })) || [];
      
      const session = stored.session ? {
        ...stored.session,
        createdAt: new Date(stored.session.createdAt),
        lastActivity: new Date(stored.session.lastActivity)
      } : null;
      
      return {
        ...stored,
        messages,
        session,
        lastSaved: stored.lastSaved ? new Date(stored.lastSaved) : null,
      };
    }
  } catch (error) {
    console.error('Error loading assistant state from localStorage:', error);
  }
  return {};
};

// Save to localStorage
const saveAssistantToStorage = (state: AssistantState) => {
  try {
    const stateToSave = {
      ...state,
      lastSaved: new Date(),
      isDirty: false,
    };
    setLocalData('assistantState', stateToSave);
  } catch (error) {
    console.error('Error saving assistant state to localStorage:', error);
  }
};

const assistantSlice = createSlice({
  name: 'assistant',
  initialState: {
    ...initialState,
    ...loadAssistantFromStorage(),
  },
  reducers: {
    // Panel actions
    openPanel: (state) => {
      state.open = true;
      state.error = null;
      state.isDirty = true;
    },
    
    closePanel: (state) => {
      state.open = false;
      state.recording = false;
      state.error = null;
    },
    
    togglePanel: (state) => {
      state.open = !state.open;
      if (state.open) {
        state.error = null;
      } else {
        state.recording = false;
        state.error = null;
      }
      state.isDirty = true;
    },
    
    // Recording actions
    startRecording: (state) => {
      state.recording = true;
    },
    
    stopRecording: (state) => {
      state.recording = false;
    },
    
    // Message actions
    pushMessage: (state, action: PayloadAction<AssistantMessage>) => {
      state.messages.push(action.payload);
      state.isDirty = true;
      
      // Update session last activity
      if (state.session) {
        state.session.lastActivity = new Date();
      }
    },
    
    clearMessages: (state) => {
      state.messages = [];
      state.isDirty = true;
    },
    
    // Session actions
    createNewSession: (state) => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      state.session = {
        sessionId,
        isActive: true,
        createdAt: now,
        lastActivity: now,
      };
      state.messages = [];
      state.isDirty = true;
    },
    
    initializeSession: (state) => {
      if (!state.session) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date();
        state.session = {
          sessionId,
          isActive: true,
          createdAt: now,
          lastActivity: now,
        };
        state.isDirty = true;
      }
    },
    
    // Context actions
    setContext: (state, action: PayloadAction<Partial<AssistantContext>>) => {
      state.context = { ...state.context, ...action.payload };
      state.isDirty = true;
    },
    
    // Loading and error actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Persistence actions
    saveToStorage: (state) => {
      saveAssistantToStorage(state);
    },
    
    loadFromStorage: (state) => {
      const stored = loadAssistantFromStorage();
      if (stored) {
        Object.assign(state, stored);
      }
    },
    
    // Reset actions
    resetAssistant: (state) => {
      Object.assign(state, initialState);
    },
    
    // Clear chat data (for logout)
    clearChatData: (state) => {
      state.messages = [];
      state.session = null;
      state.isDirty = true;
      // Clear from localStorage as well
      try {
        localStorage.removeItem('assistantState');
      } catch (error) {
        console.error('Error clearing assistant state from localStorage:', error);
      }
    },
  },
});

export const {
  openPanel,
  closePanel,
  togglePanel,
  startRecording,
  stopRecording,
  pushMessage,
  clearMessages,
  createNewSession,
  initializeSession,
  setContext,
  setLoading,
  setError,
  saveToStorage,
  loadFromStorage,
  resetAssistant,
  clearChatData,
} = assistantSlice.actions;

// Selectors
export const selectAssistant = (state: { assistant: AssistantState }) => state.assistant;
export const selectMessages = (state: { assistant: AssistantState }) => state.assistant.messages;
export const selectSession = (state: { assistant: AssistantState }) => state.assistant.session;
export const selectIsOpen = (state: { assistant: AssistantState }) => state.assistant.open;
export const selectIsLoading = (state: { assistant: AssistantState }) => state.assistant.loading;
export const selectError = (state: { assistant: AssistantState }) => state.assistant.error;
export const selectIsDirty = (state: { assistant: AssistantState }) => state.assistant.isDirty;

export default assistantSlice.reducer;
