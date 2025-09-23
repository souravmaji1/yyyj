'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/store';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { useRouter, usePathname } from 'next/navigation';
import { clearCart } from '@/src/store/slices/cartSlice';
import { clearPayment } from '@/src/store/slices/paymentSlice';
import { setOrderId, setOrderItems } from '@/src/store/slices/orderSlice';
import { useNotificationUtils } from '@/src/core/utils/notificationUtils';

interface PaymentSocketContextType {
    socket: Socket | null;
    joinPaymentRoom: (userId: string, paymentId: string) => void;
}

const PaymentSocketContext = createContext<PaymentSocketContextType | undefined>(undefined);

export const usePaymentSocket = () => {
    const context = useContext(PaymentSocketContext);
    if (!context) {
        throw new Error('usePaymentSocket must be used within a PaymentSocketProvider');
    }
    return context;
};

interface PaymentSocketProviderProps {
    children: ReactNode;
}

export const PaymentSocketProvider = ({ children }: PaymentSocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const userId = useSelector((state: RootState) => state.user.profile?.id);
    const router = useRouter();
    const pathname = usePathname();
    const { showSuccess, showError, showInfo } = useNotificationUtils();


    useEffect(() => {
        if (!userId) return;

        const socketUrl = process.env.NEXT_PUBLIC_API_PAYMENT_BASE_URL;

        const newSocket = io(socketUrl, {
            path: '/socket.io',
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            query: {
                clientId: userId
            },
            secure: true,
            rejectUnauthorized: false,
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Payment socket connected successfully with ID:', newSocket.id);
        });

        newSocket.io.on("error", (error) => {
            console.error('Payment socket error:', error);
            showError('Connection Error', 'Payment connection error. Please try again.')
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Payment socket disconnected. Reason:', reason);
            if (reason === 'io server disconnect') {
                newSocket.connect();
            }
        });

        // Listen for payment status updates
        newSocket.on('paymentStatusUpdate', (data: {
            session_id: string;
            status: string;
            userId: string;
            paymentId: string;
            forpayment: string
        }) => {

            if (data.userId === userId) {
                try {
                    let status = 'pending';
                    if (data.status === 'paid' || data.status === 'succeeded') {

                        showSuccess('Payment Success', 'Payment Success!')
                        status = 'completed';
                        if (data.forpayment === 'buyProduct') {
                            dispatch(clearCart());
                            dispatch(clearPayment());
                            dispatch(setOrderId(null));
                            dispatch(setOrderItems(null));
                        }
                    } else if (data.status === 'cancelled' || data.status === 'failes') {
                        showError('Payment Failed', 'Payment failed. Please try again.');
                        status = 'failed';
                    } else {
                        if (data.forpayment === 'buyProduct') {
                            dispatch(clearCart());
                            dispatch(clearPayment());
                            dispatch(setOrderId(null));
                            dispatch(setOrderItems(null));
                        }
                        showInfo('Payment Processing', 'Payment is being processed...');
                    }

                    if (pathname === '/tokens' || pathname === '/checkout') {
                        router.push(`/payment-success?paymentId=${data.paymentId}&status=${status}&orderType=${data.forpayment}`);
                    }

                } catch (error) {
                    showError('Payment Error', 'Error processing payment status. Please contact support.');
                }
            }
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                console.log('Cleaning up payment socket connection...');
                newSocket.disconnect();
            }
        };
    }, [userId, router, dispatch, pathname]);

    const joinPaymentRoom = (userId: string, paymentId: string) => {
        if (!socket) return;

        const roomName = `payment_${userId}_${paymentId}`;
        socket.emit('joinPaymentRoom', {
            userId,
            roomName,
            paymentId
        }, (response: any) => {
            console.log('Join payment room response:', response);
        });

        socket.on('roomJoined', (data) => {
            console.log('Successfully joined payment room:', data);
            socket.emit('getRooms', (rooms: string[]) => {
                console.log('Current payment rooms:', rooms);
            });
        });
    };

    return (
        <PaymentSocketContext.Provider value={{ socket, joinPaymentRoom }}>
            {children}
        </PaymentSocketContext.Provider>
    );
}; 