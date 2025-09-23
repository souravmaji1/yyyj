import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/src/store';
import {
  selectAssistant,
  selectMessages,
  selectSession,
  selectIsOpen,
  selectIsLoading,
  selectError,
  selectIsDirty,
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
} from '@/src/store/slices/assistantSlice';
import { aiChatAxiosClient } from '@/src/app/apis/aiChatAxiosClient';
import { AssistantMessage, AssistantContext } from '@/src/store/slices/assistantSlice';

export const useAssistant = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const assistant = useSelector(selectAssistant);
  const messages = useSelector(selectMessages);
  const session = useSelector(selectSession);
  const isOpen = useSelector(selectIsOpen);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isDirty = useSelector(selectIsDirty);

  // Auto-save to localStorage when state changes
  useEffect(() => {
    if (isDirty) {
      dispatch(saveToStorage());
    }
  }, [dispatch, isDirty, messages, session, isOpen]);

  // Load from localStorage on mount
  useEffect(() => {
    dispatch(loadFromStorage());
  }, [dispatch]);

  // Clear chat data when user is not authenticated
  useEffect(() => {
    // Check if user is authenticated by looking for auth token
    const checkAuth = () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];
      
      if (!token) {
        // No auth token found, clear chat data
        dispatch(clearChatData());
      }
    };

    // Check on mount
    checkAuth();

    // Listen for storage changes (when other tabs log out)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userAuthDetails' && !e.newValue) {
        // User logged out in another tab
        dispatch(clearChatData());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  // Actions
  const openAssistant = useCallback(() => {
    dispatch(openPanel());
    
    // Update context when opening
    const context: AssistantContext = {
      pathname: window.location.pathname,
      title: document.title,
      selection: window.getSelection()?.toString()?.slice(0, 500) || undefined,
      ua: navigator.userAgent,
    };
    dispatch(setContext(context));
    
    // Initialize session and load chat history
    dispatch(initializeSession());
    if (session?.sessionId) {
      loadChatHistory();
    }
  }, [dispatch, session?.sessionId]);

  const closeAssistant = useCallback(() => {
    dispatch(closePanel());
  }, [dispatch]);

  const toggleAssistant = useCallback(() => {
    dispatch(togglePanel());
    
    if (!isOpen) {
      // Update context when opening
      const context: AssistantContext = {
        pathname: window.location.pathname,
        title: document.title,
        selection: window.getSelection()?.toString()?.slice(0, 500) || undefined,
        ua: navigator.userAgent,
      };
      dispatch(setContext(context));
      
      // Initialize session when opening
      dispatch(initializeSession());
    }
  }, [dispatch, isOpen]);

  const startRecordingAudio = useCallback(() => {
    dispatch(startRecording());
  }, [dispatch]);

  const stopRecordingAudio = useCallback(() => {
    dispatch(stopRecording());
  }, [dispatch]);

  const addMessage = useCallback((message: AssistantMessage) => {
    dispatch(pushMessage(message));
  }, [dispatch]);

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const createSession = useCallback(() => {
    dispatch(createNewSession());
  }, [dispatch]);

  const initSession = useCallback(() => {
    dispatch(initializeSession());
  }, [dispatch]);

  const updateContext = useCallback((context: Partial<AssistantContext>) => {
    dispatch(setContext(context));
  }, [dispatch]);

  const setLoadingState = useCallback((loading: boolean) => {
    dispatch(setLoading(loading));
  }, [dispatch]);

  const setErrorState = useCallback((error: string | null) => {
    dispatch(setError(error));
  }, [dispatch]);

  const saveToLocalStorage = useCallback(() => {
    dispatch(saveToStorage());
  }, [dispatch]);

  const loadFromLocalStorage = useCallback(() => {
    dispatch(loadFromStorage());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetAssistant());
  }, [dispatch]);

  const clearChat = useCallback(() => {
    dispatch(clearChatData());
  }, [dispatch]);

  // API functions
  const sendMessage = useCallback(async (message: string) => {
    try {
      console.log('🚀 sendMessage called with:', message);
      
      const currentSession = session || { sessionId: Date.now().toString() };
      const sessionId = currentSession.sessionId;
      
      console.log('📝 Current session:', currentSession);
      console.log('🆔 Session ID:', sessionId);
      
      // Create session if it doesn't exist
      if (!session) {
        console.log('🆕 Creating new session...');
        dispatch(createNewSession());
      }

      console.log('🌐 Making API call to:', '/api/ai-chat/chat');
      console.log('📤 Request payload:', { message, session_id: sessionId });

      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await aiChatAxiosClient.post('/api/ai-chat/chat', {
        message,
        session_id: sessionId,
      });

      console.log('✅ API Response:', response.data);

      // Add assistant response to store
      if (response.data?.message) {
        const assistantMessage: AssistantMessage = {
          id: `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
        };
        dispatch(pushMessage(assistantMessage));
        console.log('✅ Assistant message added to store:', response.data.message);
      } else {
        console.warn('⚠️ No response data received from API');
        console.log('🔍 Response data structure:', response.data);
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      dispatch(setError('Failed to send message to AI assistant'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, session]);

  const loadChatHistory = useCallback(async () => {
    try {
      const currentSession = session;
      if (!currentSession?.sessionId) {
        console.log('No session ID available for loading chat history');
        return;
      }

      const response = await aiChatAxiosClient.get(`/api/ai-chat/chat/history/${currentSession.sessionId}`);
      
      if (response.data?.messages && Array.isArray(response.data.messages)) {
        // Convert API response to our message format
        const messages: AssistantMessage[] = response.data.messages.map((msg: any, index: number) => ({
          id: `msg_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          role: msg.role || 'assistant',
          content: msg.content || msg.message || '',
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));
        
        // Clear existing messages and set new ones
        dispatch(clearMessages());
        messages.forEach(msg => dispatch(pushMessage(msg)));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      dispatch(setError('Failed to load chat history'));
    }
  }, [dispatch, session]);

  return {
    // State
    ...assistant,
    messages,
    session,
    isOpen,
    isLoading,
    error,
    isDirty,
    
    // Actions
    openPanel: openAssistant,
    closePanel: closeAssistant,
    togglePanel: toggleAssistant,
    startRecording: startRecordingAudio,
    stopRecording: stopRecordingAudio,
    pushMessage: addMessage,
    clearMessages: clearAllMessages,
    createNewSession: createSession,
    initializeSession: initSession,
    setContext: updateContext,
    setLoading: setLoadingState,
    setError: setErrorState,
    saveToStorage: saveToLocalStorage,
    loadFromStorage: loadFromLocalStorage,
    resetAssistant: reset,
    
    // API functions
    sendMessage,
    loadChatHistory,
    
    // Chat management
    clearChat,
  };
};
