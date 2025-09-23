"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/app/apis/auth/UserAuth";
import { io, Socket } from "socket.io-client";
// import { QRCodeSVG } from "qrcode.react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/core/icons";
import authAxiosClient from "@/src/app/apis/auth/axios";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { isKioskInterface } from "@/src/core/utils";


function isMobile() {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function QRLogin() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const { handleAuthSuccess } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSessionId = searchParams?.get('sessionId');
  const { showError } = useNotificationUtils();

  // If on mobile and sessionId is present, redirect to mobile login page
  useEffect(() => {
    if (isMobile() && urlSessionId) {
      // Preserve machine_id parameter if present in the URL
      const currentUrl = new URL(window.location.href);
      const machineId = currentUrl.searchParams.get('machine_id');
      
      let redirectUrl = `/auth/qr-mobile-login?sessionId=${urlSessionId}`;
      if (machineId) {
        redirectUrl += `&machine_id=${encodeURIComponent(machineId)}`;
        console.log('📱 Mobile redirect preserving machine_id:', machineId);
      }
      
      console.log('📱 Redirecting mobile user to:', redirectUrl);
      router.replace(redirectUrl);
    }
  }, [urlSessionId, router]);

  // Only run QR code logic if not on mobile with sessionId
  useEffect(() => {
    if (isMobile() && urlSessionId) return;
    // Initialize QR session
    const initQrSession = async () => {
      try {
        const { data } = await authAxiosClient.post('/auth/qr/initiate', { isMachine: isKioskInterface() ? true : false });
        console.log("data", data)
        if (data.status) {
          setSessionId(data.data.sessionId);
          // Create a shorter URL for the QR code
          // const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;
          // const qrUrl = `${baseUrl}/auth/qr-login?sessionId=${data.data.sessionId}`;
          setQrCode(data.data.qrCode);
        } else {
          setError('Failed to initialize QR session');
          showError('QR Session Error', 'Failed to initialize QR session');
        }
      } catch (err) {
        setError('Failed to initialize QR session');
        showError('QR Session Error', 'Failed to initialize QR session');
      }
    };

    initQrSession();
  }, [urlSessionId]);

  useEffect(() => {
    if ((isMobile() && urlSessionId) || !sessionId) return;

    // WebSocket connection URL
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    console.log('Initializing socket connection to:', wsUrl);

    // Initialize socket connection
    const socketInstance = io(wsUrl, {
      path: '/api/user/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
      forceNew: true,
      withCredentials: true,
      query: {
        sessionId: sessionId
      },
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    });

    // Add connection state logging
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      console.log('Connection state:', socketInstance.connected);
      console.log('Transport:', socketInstance.io.engine.transport.name);
      setSocketConnected(false);
      setError(`Connection error: ${error.message}. Please check your internet connection and try again.`);
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
      console.log('Transport:', socketInstance.io.engine.transport.name);
      setSocketConnected(true);
      setError(null);
      socketInstance.emit('joinQrSession', sessionId);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      console.log('Connection state:', socketInstance.connected);
      setSocketConnected(false);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        socketInstance.connect();
      }
    });

    // Add error event handlerQR 
    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      console.log('Connection state:', socketInstance.connected);
      setError('WebSocket error occurred. Please try again.');
    });

    // Add reconnection event handlers
    socketInstance.io.on('reconnect_attempt', (attempt) => {
      console.log('Reconnection attempt:', attempt);
    });

    socketInstance.io.on('reconnect', (attempt) => {
      console.log('Reconnected after', attempt, 'attempts');
    });

    socketInstance.io.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socketInstance.io.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      setError('Failed to establish connection. Please try again.');
    });

    socketInstance.on('qr:verified', async (data) => {
      console.log('QR verified event received:', data);
      console.log('session idddd', sessionId);
      try {
        // Add a delay before calling /complete
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        // Use correct Axios POST syntax
        const response = await authAxiosClient.post('/auth/qr/complete', { sessionId });
        const result = response.data;
        console.log('QR completion response:', result);

        if (result.status) {
          const success = await handleAuthSuccess(result.data, true);
          if (success) {
            router.push('/');
          } else {
            showError('Login Failed', 'Failed to finalize login');
          }
        } else {
          setError('Failed to complete login');
          showError('Login Failed', 'Failed to complete login');
        }
      } catch (err) {
        console.error('QR completion error:', err);
        setError('Failed to complete login');
        showError('Login Failed', 'Failed to complete login');
      }
    });

    socketInstance.on('qr:expired', () => {
      console.log('QR code expired');
      setError('QR code has expired. Please try again.');
      showError('QR Expired', 'QR code has expired. Please try again.');
    });

    setSocket(socketInstance);

    return () => {
      console.log('Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [sessionId, router, urlSessionId]);

  const handleRefresh = async () => {
    setError(null);
    try {
      const { data } = await authAxiosClient.post('/auth/qr/initiate', { isMachine: isKioskInterface() ? true : false });
      if (data.status) {
        setSessionId(data.data.sessionId);
        setQrCode(data.data.qrCode);
      } else {
        setError('Failed to refresh QR code');
        showError('Refresh Failed', 'Failed to refresh QR code');
      }
    } catch (err) {
      setError('Failed to refresh QR code');
      showError('Refresh Failed', 'Failed to refresh QR code');
    }
  };

  // Only render QR code UI if not on mobile with sessionId
  if (isMobile() && urlSessionId) {
    return null;
  }

  return (
    <div className="h-[95%]">
      <div className="w-full max-w-2xl space-y-6 p-4 sm:p-8 bg-white rounded-2xl shadow-lg mx-auto ">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Scan QR Code to Login
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Scan this QR code with your mobile device to log in
          </p>
          {!socketConnected && (
            <p className="mt-2 text-sm text-yellow-600">
              Waiting for connection... {error && <span className="text-red-500">({error})</span>}
            </p>
          )}
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex gap-2 items-center justify-center">
            {error}
            <Button
              variant="outline"
              size="sm"
              className="mt-0"
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </div>
        ) : null}

        <div className="flex justify-center p-6 bg-white rounded-xl shadow-inner">
          {qrCode ? (
            <img
              src={qrCode}
              alt="QR Code"
              style={{ width: 240, height: 240, borderRadius: 16, background: 'var(--color-panel)' }}
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="w-full h-12 bg-[var(--color-secondary)] hover:bg-[var(--color-primary)] text-white hover:text-white rounded-xl font-semibold"

          >
            <Icons.refresh className="mr-2 h-4 w-4" />
            Refresh QR Code
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/auth?mode=login')}
            className="w-full h-12 border-2 rounded-xl font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Back to Log In
          </Button>
        </div>
      </div>
    </div>
  );
} 