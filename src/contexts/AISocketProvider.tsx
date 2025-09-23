"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { updateJobStatus } from '@/src/store/slices/tryonSlice';
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';

interface AISocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  reconnect: () => void;
}

const AISocketContext = createContext<AISocketContextType | undefined>(undefined);

interface AISocketProviderProps {
  children: ReactNode;
}

export function AISocketProvider({ children }: AISocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.profile);
  const { showSuccess, showError } = useNotificationUtils();

  // Convert HTTP URL to WebSocket URL for Socket.IO
  const AI_BASE_URL = process.env.NEXT_PUBLIC_API_AI_BASE_URL;
  const AI_SOCKET_URL = AI_BASE_URL?.replace('https://', 'wss://').replace('http://', 'ws://').replace('/api/ai', '');
  
  console.log('🔧 AI Socket URL conversion:', {
    original: AI_BASE_URL,
    converted: AI_SOCKET_URL
  });

  const connectToAISocket = () => {
    if (!user || !AI_SOCKET_URL) {
      console.log('❌ No user or AI_SOCKET_URL, skipping AI socket connection', {
        hasUser: !!user,
        userId: user?.id,
        idpUsername: user?.idpUsername,
        aiSocketUrl: AI_SOCKET_URL
      });
      return;
    }

    if (socketRef.current) {
      console.log('🔌 AI Socket already exists, skipping connection');
      return;
    }

    // Use idpUsername for socket connection (matches backend authentication)
    const socketUserId = user.idpUsername || user.id;
  

    const newSocket = io(AI_SOCKET_URL, {
      path: "/api/ai/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 10000,
      query: {
        clientId: socketUserId,
      },
      forceNew: false,
    });

    newSocket.on("connect", () => {
      console.log("✅ AI Socket connected");
      console.log("🔌 Socket ID:", newSocket.id);
      setIsConnected(true);
      // Use the newSocket directly instead of the captured socket
      console.log("🏠 Joining user room for user:", socketUserId);
      newSocket.emit("join_user_room", {
        userId: socketUserId,
      });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ AI Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("notification", (data) => {
      handleAINotification(data);
    });

    newSocket.on("joined_room", (data) => {
      console.log("🏠 Joined AI notification room:", data);
    });

    newSocket.on("error", (error) => {
      console.error("❌ AI Socket error:", error);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ AI Socket connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 AI Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ AI Socket reconnection error:", error);
      setIsConnected(false);
    });

    setSocket(newSocket);
    socketRef.current = newSocket;
  };


  const handleAINotification = (notification: any) => {
    const { type, message, data, jobId } = notification;
    
    if (type === 'note_created' && data?.noteType === 'tryon') {
      // Handle try-on completion notification
      showSuccess("Virtual Try-On Complete!", message);
      
      // Update job status in Redux
      dispatch(updateJobStatus({
        jobId: jobId,
        status: 'completed',
        artifacts: data?.artifactUrls || []
      }));
      
      if (data?.artifactUrls) {
        console.log("Try-on artifacts available:", data.artifactUrls);
      }
      
    } else if (type === 'note_failed' && data?.noteType === 'tryon') {
      // Handle try-on failure notification
      showError("Virtual Try-On Failed", message);
      
      // Update job status in Redux
      dispatch(updateJobStatus({
        jobId: jobId,
        status: 'failed'
      }));
      
    } else {
      // Handle other AI notifications
      showSuccess("AI Notification", message);
    }
  };

  const reconnect = () => {
    console.log("🔄 Manual AI socket reconnection...");
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
    setTimeout(() => {
      connectToAISocket();
    }, 1000);
  };

  // Connect when user is available
  useEffect(() => {
    console.log('🔄 AISocketProvider useEffect triggered', {
      hasUser: !!user,
      userId: user?.id,
      aiSocketUrl: AI_SOCKET_URL,
      socketExists: !!socketRef.current
    });
    
    if (user && AI_SOCKET_URL) {
      connectToAISocket();
    }

    return () => {
      if (socketRef.current) {
        console.log('🔌 Cleaning up AI socket');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const value = {
    socket,
    isConnected,
    reconnect,
  };

  return (
    <AISocketContext.Provider value={value}>
      {children}
    </AISocketContext.Provider>
  );
}

export function useAISocket() {
  const context = useContext(AISocketContext);
  if (context === undefined) {
    throw new Error('useAISocket must be used within an AISocketProvider');
  }
  return context;
}
