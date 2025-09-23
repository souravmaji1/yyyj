import { create } from 'zustand';
import { aiChatAxiosClient } from '@/src/app/apis/aiChatAxiosClient';

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
  
  // Actions
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  pushMessage: (message: AssistantMessage) => void;
  setContext: (context: Partial<AssistantContext>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // New API actions
  sendMessage: (message: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
  createNewSession: () => void;
  initializeSession: () => void;
}
export const useAssistantStore = create<AssistantState>((set, get) => ({
  // Initial state
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

  // Actions
  openPanel: () => {
    set({ error: null });
    
    try {
      const context: AssistantContext = {
        pathname: window.location.pathname,
        title: document.title,
        selection: window.getSelection()?.toString()?.slice(0, 500) || undefined,
        ua: navigator.userAgent,
      };
      
      set({ 
        open: true,
        context 
      });
      
      // Initialize session and load chat history
      get().initializeSession();
      const { session } = get();
      if (session?.sessionId) {
        get().loadChatHistory();
      }
    } catch (error) {
      console.error('Error opening assistant panel:', error);
      set({ 
        error: 'Failed to open assistant panel',
        open: false 
      });
    }
  },
  closePanel: () => set({ open: false, recording: false, error: null }),

  togglePanel: () => {
    const { open } = get();
    if (open) {
      set({ open: false, recording: false, error: null });
    } else {
      // Clear any previous errors
      set({ error: null });
      
      try {
        // Update context when opening
        const context: AssistantContext = {
          pathname: window.location.pathname,
          title: document.title,
          selection: window.getSelection()?.toString()?.slice(0, 500) || undefined,
          ua: navigator.userAgent,
        };
        
        set({ 
          open: true,
          context 
        });
        
        // Initialize session when opening
        get().initializeSession();
      } catch (error) {
        console.error('Error toggling assistant panel:', error);
        set({ 
          error: 'Failed to open assistant panel',
          open: false 
        });
      }
    }
  },

  startRecording: () => {
    // TODO: Implement Web Speech API integration
    set({ recording: true });
  },

  stopRecording: () => {
    set({ recording: false });
  },

  pushMessage: (message: AssistantMessage) => 
    set((state) => ({ 
      messages: [...state.messages, message] 
    })),

  setContext: (newContext: Partial<AssistantContext>) =>
    set((state) => ({
      context: { ...state.context, ...newContext }
    })),

  clearMessages: () => set({ messages: [] }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),

  sendMessage: async (message: string) => {
    try {
      console.log(' sendMessage called with:', message);
      
      const { session } = get();
      const sessionId = session?.sessionId || Date.now().toString();
      
      console.log(' Current session:', session);
      console.log(' Session ID:', sessionId);
      
      // Create session if it doesn't exist
      if (!session) {
        console.log(' Creating new session...');
        get().createNewSession();
      }

      console.log(' Making API call to:', '/api/ai-chat/chat');
      console.log(' Request payload:', { message, session_id: sessionId });

      const response = await aiChatAxiosClient.post('/api/ai-chat/chat', {
        message,
        session_id: sessionId,
      });

      console.log(' API Response:', response.data);

      // User message is already added by the UI component
      // No need to add it again here

      // Add assistant response to store
      if (response.data?.message) {
        const assistantMessage: AssistantMessage = {
          id: `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
        };
        get().pushMessage(assistantMessage);
        console.log(' Assistant message added to store:', response.data.message);
      } else {
        console.warn(' No response data received from API');
        console.log(' Response data structure:', response.data);
      }
    } catch (error) {
      console.error(' Error sending message:', error);
      get().setError('Failed to send message to AI assistant');
    }
  },

  loadChatHistory: async () => {
    try {
      const { session } = get();
      if (!session?.sessionId) {
        console.log('No session ID available for loading chat history');
        return;
      }

      const response = await aiChatAxiosClient.get(`/api/ai-chat/chat/history/${session.sessionId}`);
      
      if (response.data?.messages && Array.isArray(response.data.messages)) {
        // Convert API response to our message format
        const messages: AssistantMessage[] = response.data.messages.map((msg: any, index: number) => ({
          id: `msg_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          role: msg.role || 'assistant',
          content: msg.content || msg.message || '',
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));
        
        set({ messages });
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      get().setError('Failed to load chat history');
    }
  },
  
  createNewSession: () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set({ 
      session: { sessionId, isActive: true },
      messages: [] // Clear messages when creating new session
    });
  },

  initializeSession: () => {
    const { session } = get();
    if (!session) {
      get().createNewSession();
    }
  },
}));