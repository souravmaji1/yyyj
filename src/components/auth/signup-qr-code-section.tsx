import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import authAxiosClient from "@/src/app/apis/auth/axios";
import { io, Socket } from "socket.io-client";
import { Button } from "@/src/components/ui/button";
import { Icons } from "@/src/core/icons";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { useDispatch } from "react-redux";
import { closeQrModal } from "@/src/store/slices/qrModalSlice";

export default function SignupQrCodeSection() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [refreshingQR, setRefreshingQR] = useState(false);
  const { showError, showSuccess } = useNotificationUtils();
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;
    const initQrSession = async () => {
      try {
        const { data } = await authAxiosClient.post('/auth/qr/kiosk-itiitate', { type: 'kioskSignup' });
        if (data.status) {
          setSessionId(data.data.sessionId);
          setQrCode(data.data.qrCode);
        } else {
          setQrError('Failed to initialize QR session');
        }
      } catch (err) {
        setQrError('Failed to initialize QR session');
      }
    };
    initQrSession();
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    console.log('🔌 Connecting to WebSocket:', wsUrl);
    console.log('📋 Session ID:', sessionId);

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
      query: { sessionId },
      extraHeaders: { 'Access-Control-Allow-Origin': '*' }
    });

    socketInstance.on('connect', () => {
      console.log('✅ Desktop connected to WebSocket');
      setSocketConnected(true);
      setQrError(null);
      socketInstance.emit('joinQrSession', sessionId);
      console.log('📡 Desktop joined QR session:', sessionId);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Desktop disconnected from WebSocket');
      setSocketConnected(false);
    });

    socketInstance.on('qr:verified', async () => {
      console.log('🔍 QR verified event received');
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const response = await authAxiosClient.post('/auth/qr/complete', { sessionId });
        const result = response.data;
        if (result.status) {
          console.log("qr code verrified")
          dispatch(closeQrModal());
          window && window.location.reload();
          showSuccess('Signup Complete!', 'Mobile signup successful as kiosk owner');
          // Optionally handle success (e.g., show a message or redirect)
        } else {
          setQrError('Failed to complete signup');
          showError('Signup Failed', 'Failed to complete signup');
        }
      } catch (err) {
        setQrError('Failed to complete signup');
        showError('Signup Failed', 'Failed to complete signup');
      }
    });

    socketInstance.on('qr:expired', () => {
      console.log('⏰ QR expired event received');
      setQrError('QR code has expired. Please try again.');
      showError('QR Expired', 'QR code has expired. Please try again.');
    });

    // 🎯 LISTEN FOR KIOSK SIGNUP SUCCESS
    socketInstance.on('kiosk:signup:completed', (data) => {
      console.log('🎉 Desktop received kiosk signup completion:', data);

      // Close the QR modal using Redux
      dispatch(closeQrModal());

      // Show success notification
      showSuccess('Signup Complete!', data.message || 'Mobile signup successful as kiosk owner');
      window && window.location.reload();

      // Disconnect socket as signup is complete
      setTimeout(() => socketInstance.disconnect(), 500);
    });

    setSocket(socketInstance);
    return () => {
      console.log('🧹 Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [sessionId]);

  const handleRefreshQR = async () => {
    setQrError(null);
    setRefreshingQR(true);
    try {
      const { data } = await authAxiosClient.post('/auth/qr/kiosk-itiitate', { type: 'kioskSignup' });
      if (data.status) {
        setSessionId(data.data.sessionId);
        setQrCode(data.data.qrCode);
      } else {
        setQrError('Failed to refresh QR code');
      }
    } catch (err) {
      setQrError('Failed to refresh QR code');
    } finally {
      setRefreshingQR(false);
    }
  };

  return (
    <div className="space-y-4 pt-8">
      <div className="text-start">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Scan to Sign Up</h2>
        <p className="text-gray-600 text-sm">Use your mobile device to scan this QR code and sign up on your phone.</p>
      </div>
      <div className="flex justify-center">
        {refreshingQR ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
            <p className="text-gray-500 text-sm">Refreshing QR code...</p>
          </div>
        ) : qrError && !qrCode ? (
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-2xl max-w-xs">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 text-sm font-medium mb-4">{qrError}</p>
            <Button
              onClick={handleRefreshQR}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
              disabled={refreshingQR}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : qrCode ? (
          <div className="relative">
            <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
              <img src={qrCode || "/placeholder.svg"} alt="QR Code for Signup" className="w-48 h-48 rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
            <p className="text-gray-500 text-sm">Generating QR code...</p>
          </div>
        )}
      </div>
      <Button
        onClick={handleRefreshQR}
        variant="outline"
        className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-blue-300 bg-blue-50 text-gray-700 text-blue-700 transition-all duration-200"
        disabled={refreshingQR}
      >
        {refreshingQR ? (
          <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4 mr-2" />
        )}
        {refreshingQR ? "Refreshing..." : "Refresh QR Code"}
      </Button>
    </div>
  );
} 