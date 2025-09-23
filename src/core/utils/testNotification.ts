import authAxiosClient from '@/src/app/apis/auth/axios';

export const testNotificationFromFrontend = async () => {
    try {
        console.log('Testing notification from frontend...');
        
        // Call the same test notification endpoint that works in Swagger
        const response = await authAxiosClient.post('/user/test-notification', {
            templateId: 'profile_updated',
            customData: {
                actionUrl: '/profile',
                timestamp: new Date().toISOString(),
                source: 'frontend-test'
            }
        });

        console.log('Test notification response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to send test notification from frontend:', error);
        throw error;
    }
};

export const testDirectNotificationFromFrontend = async () => {
    try {
        console.log('Testing direct notification from frontend...');
        
        // Call the same test direct notification endpoint that works in Swagger
        const response = await authAxiosClient.post('/user/test-direct-notification', {
            title: 'Test Direct Notification from Frontend',
            message: 'This is a test notification sent from the frontend using the same endpoint as Swagger!',
            customData: {
                actionUrl: '/profile',
                timestamp: new Date().toISOString(),
                source: 'frontend-direct-test'
            }
        });

        console.log('Test direct notification response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to send test direct notification from frontend:', error);
        throw error;
    }
};

export const sendProfileUpdateNotification = async (profileData: any) => {
    try {
        console.log('Sending profile update notification...');
        
        // First update the profile
        const profileResponse = await authAxiosClient.put('/user/profile', profileData);
        console.log('Profile update response:', profileResponse.data);
        
        // Then send a test notification to verify it works
        const notificationResponse = await testNotificationFromFrontend();
        
        return {
            profileUpdate: profileResponse.data,
            notification: notificationResponse
        };
    } catch (error) {
        console.error('Failed to send profile update notification:', error);
        throw error;
    }
}; 