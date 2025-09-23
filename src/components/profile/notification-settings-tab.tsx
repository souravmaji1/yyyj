"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { fetchUserProfile, updateNotificationSettings } from "@/src/store/slices/userSlice";
import { Icons } from "@/src/core/icons";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ConfirmationDialog } from "@/src/components/ui/confirmation-dialog";
import { useNotificationUtils } from "@/src/core/utils/notificationUtils";
import { Spinner } from "../ui/spinner";
import { getFcmToken } from "@/src/core/utils/getFcmToken";
import { useAuth } from "@/src/app/apis/auth/UserAuth";

interface NotificationSettingsTabProps {
    user: any;
}

export function NotificationSettingsTab({ user }: NotificationSettingsTabProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { showSuccess, showError } = useNotificationUtils();
    const { loading, error } = useSelector((state: RootState) => state.user);
    const { updateFcmToken } = useAuth();

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingAction, setPendingAction] = useState<{
        type: 'email' | 'push';
        newValue: boolean;
    } | null>(null);
    const [browserPermission, setBrowserPermission] = useState<string>('default');

    // Check browser permission on component mount
    useEffect(() => {
        if ('Notification' in window) {
            setBrowserPermission(Notification.permission);
        }
    }, []);

    // Fetch user profile on component mount if not already loaded
    useEffect(() => {
        if (!user?.id) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, user?.id]);

    const handleNotificationToggle = (type: 'email' | 'push') => {
        const currentValue = type === 'email' ? user?.isEnableEmailNotification : user?.isEnablePushNotification;
        const newValue = !currentValue;

        // For push notifications, check browser permission first when enabling
        if (type === 'push' && newValue) {
            handlePushNotificationPermission();
        } else if (type === 'push' && !newValue) {
            // When disabling push notifications, show confirmation
            setPendingAction({ type, newValue });
            setShowConfirmation(true);
        } else {
            // For email notifications, proceed normally
            setPendingAction({ type, newValue });
            setShowConfirmation(true);
        }
    };

    const handlePushNotificationPermission = async () => {
        try {
            // Check if browser supports notifications
            if (!('Notification' in window)) {
                showError('Not Supported', 'Push notifications are not supported in this browser');
                return;
            }

            // Check current permission status
            let permission = Notification.permission;
            setBrowserPermission(permission);

            // If permission is not granted, request it
            if (permission === 'default') {
                permission = await Notification.requestPermission();
                setBrowserPermission(permission);
            }

            if (permission === 'granted') {
                try {
                    // Get FCM token
                    const fcmToken = await getFcmToken();
                    
                    if (fcmToken) {
                        // Enable push notifications
                        setPendingAction({ type: 'push', newValue: true });
                        setShowConfirmation(true);
                    } else {
                        showError('Token Error', 'Failed to get notification token. Please try again.');
                    }
                } catch (error) {
                    console.error('FCM token error:', error);
                    showError('Token Error', 'Failed to initialize push notifications. Please try again.');
                }
            } else if (permission === 'denied') {
                showError('Permission Denied', 'Push notification permission was denied. Please enable notifications in your browser settings to use this feature.');
            } else {
                showError('Permission Error', 'Push notification permission is required to enable this feature.');
            }
        } catch (error) {
            console.error('Permission request error:', error);
            showError('Permission Error', 'Failed to request notification permission. Please try again.');
        }
    };

    const handleManualPermissionRequest = async () => {
        try {
            if (!('Notification' in window)) {
                showError('Not Supported', 'Push notifications are not supported in this browser');
                return;
            }

            const permission = await Notification.requestPermission();
            setBrowserPermission(permission);

            if (permission === 'granted') {
                showSuccess('Permission Granted', 'Push notification permission has been granted!');
                // Automatically try to enable push notifications
                handlePushNotificationPermission();
            } else if (permission === 'denied') {
                showError('Permission Denied', 'Push notification permission was denied. Please enable notifications in your browser settings.');
            }
        } catch (error) {
            console.error('Manual permission request error:', error);
            showError('Permission Error', 'Failed to request notification permission. Please try again.');
        }
    };

    const getPermissionStatusText = () => {
        switch (browserPermission) {
            case 'granted':
                return 'Permission granted';
            case 'denied':
                return 'Permission denied';
            case 'default':
                return 'Permission not set';
            default:
                return 'Unknown status';
        }
    };

    const getPermissionStatusColor = () => {
        switch (browserPermission) {
            case 'granted':
                return 'text-green-400';
            case 'denied':
                return 'text-red-400';
            case 'default':
                return 'text-yellow-400';
            default:
                return 'text-gray-400';
        }
    };

    const handleConfirmToggle = async () => {
        if (!pendingAction) return;

        try {
            const updateData: any = {};

            if (pendingAction.type === 'email') {
                updateData.isEnableEmailNotification = pendingAction.newValue;
            } else if (pendingAction.type === 'push') {
                updateData.isEnablePushNotification = pendingAction.newValue;
                
                // If enabling push notifications, also update FCM token
                if (pendingAction.newValue) {
                    try {
                        await updateFcmToken();
                        console.log("FCM token updated when enabling push notifications");
                    } catch (fcmError) {
                        // Don't fail the notification settings update if FCM token update fails
                        showError('FCM Token Update Failed', 'Push notifications enabled failed');
                    }
                }
            }

            // Call the notification settings API
            await dispatch(updateNotificationSettings(updateData)).unwrap();

            showSuccess('Success', 'Notification settings updated successfully');

            // Refresh user data to get updated settings
            dispatch(fetchUserProfile());

        } catch (error: any) {
            showError('Update Failed', error?.message || 'An error occurred while updating notification settings');
        } finally {
            setShowConfirmation(false);
            setPendingAction(null);
        }
    };

    const getConfirmationMessage = () => {
        if (!pendingAction) return '';

        const { type, newValue } = pendingAction;
        const action = newValue ? 'enable' : 'disable';
        const notificationType = type === 'email' ? 'email notifications' : 'push notifications';

        return `Are you sure you want to ${action} ${notificationType}? This will ${action} all ${notificationType} for your account.`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center p-8">
                        <Spinner />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Icons.alertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-400 mb-4">Failed to load notification settings</p>
                    <Button
                        onClick={() => dispatch(fetchUserProfile())}
                        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Notification Settings</h2>
                    <p className="text-[#667085] mt-1">Manage your notification preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email Notifications */}
                <Card className="bg-[var(--color-surface)]/50 border-[#667085]/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <Icons.mail className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                            Email Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-gray-300 text-sm font-medium">Email Notifications</span>
                                <p className="text-gray-500 text-xs">Receive notifications via email</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleNotificationToggle('email')}
                                className={`mt-6 ${user?.isEnableEmailNotification
                                    ? 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 hover:text-white'
                                    : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:text-white'
                                    } transition-all duration-200`}
                                disabled={loading}
                            >
                                {user?.isEnableEmailNotification ? 'Enabled' : 'Disabled'}
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-end justify-between">
                                <span className="text-gray-300 text-sm">Order Updates</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-gray-300 text-sm">Security Alerts</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-gray-300 text-sm">Account Updates</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Push Notifications */}
                <Card className="bg-[var(--color-surface)]/50 border-[#667085]/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <Icons.bell className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                            Push Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-gray-300 text-sm font-medium">Push Notifications</span>
                                <p className="text-gray-500 text-xs">Receive notifications on your device</p>
                                <p className={`text-xs mt-1 ${getPermissionStatusColor()}`}>
                                    Browser permission: {getPermissionStatusText()}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleNotificationToggle('push')}
                                className={`mt-6 ${user?.isEnablePushNotification
                                    ? 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 hover:text-white'
                                    : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:text-white'
                                    } transition-all duration-200`}
                                disabled={loading || browserPermission === 'denied'}
                            >
                                {user?.isEnablePushNotification ? 'Enabled' : 'Disabled'}
                            </Button>
                        </div>

                        {browserPermission === 'denied' && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                                <p className="text-red-400 text-xs">
                                    <Icons.alertCircle className="inline w-3 h-3 mr-1" />
                                    Browser notifications are blocked. Please enable them in your browser settings to use push notifications.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleManualPermissionRequest}
                                    className="text-red-400 hover:text-red-300 mt-2"
                                >
                                    Request Permission
                                </Button>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-end justify-between">
                                <span className="text-gray-300 text-sm">Order Updates</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-gray-300 text-sm">Security Alerts</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-gray-300 text-sm">Account Updates</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={showConfirmation}
                onOpenChange={setShowConfirmation}
                title={pendingAction?.newValue ? 'Enable Notifications' : 'Disable Notifications'}
                description={getConfirmationMessage()}
                confirmText={pendingAction?.newValue ? 'Enable' : 'Disable'}
                cancelText="Cancel"
                onConfirm={handleConfirmToggle}
                isLoading={loading}
                variant={pendingAction?.newValue ? 'info' : 'warning'}
            />
        </div>
    );
} 