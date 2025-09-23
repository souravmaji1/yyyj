/**
 * Hardware Service
 * Handles API calls for hardware system information and management
 */

import { storeKioskMacToLocalStorage } from '@/src/core/utils';
import axios from 'axios';

// Hardware API configuration
const HARDWARE_API_BASE_URL = process.env.NEXT_PUBLIC_HARDWARE_API_BASE_URL || 'http://edge.intelli-verse-x.ai';

// Create axios instance for hardware API calls
export const hardwareAxiosClient = axios.create({
    baseURL: HARDWARE_API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
    },
});

// Add request interceptor for logging
hardwareAxiosClient.interceptors.request.use(
    (config) => {
        console.log('Hardware API Request:', config.method?.toUpperCase(), config.url);
        console.log('Request data:', config.data);
        return config;
    },
    (error) => {
        console.error('Hardware API Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for logging
hardwareAxiosClient.interceptors.response.use(
    (response) => {
        console.log('Hardware API Response:', response.status, response.data);
        return response;
    },
    (error) => {
        console.error('Hardware API Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

// Types for hardware system info
export interface HardwareSystemInfoRequest {
    password: string;
}

export interface HardwareSystemInfoResponse {
    success: boolean;
    data?: {
        systemInfo: any;
        timestamp: string;
        status: string;
    };
    error?: string;
}

// Types for health check
export interface HealthCheckResponse {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
}

export interface HealthCheckServiceResponse {
    success: boolean;
    data?: HealthCheckResponse;
    error?: string;
}

/**
 * Get hardware system information
 * @param password - Admin password for authentication
 * @returns Promise with system information
 */
export const getHardwareSystemInfo = async (
    password: string = "admin@1234"
): Promise<HardwareSystemInfoResponse> => {
    try {
        console.log('Fetching hardware system info...');

        const response = await hardwareAxiosClient.post('api/hardware/system/info', {
            password
        });

        await storeKioskMacToLocalStorage(response?.data?.machineId);
        localStorage.setItem('machine_id', response?.data?.machineId);
        return {
            success: true,
            data: {
                systemInfo: response.data,
                timestamp: new Date().toISOString(),
                status: 'success'
            }
        };
    } catch (error) {
        console.error('Error fetching hardware system info:', error);

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch system information'
        };
    }
};

/**
 * Get hardware system health status
 * @returns Promise with health check information
 */
export const getHardwareHealth = async (): Promise<HealthCheckServiceResponse> => {
    try {
        console.log('Fetching hardware health status...');

        const response = await hardwareAxiosClient.get('/health');

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error fetching hardware health status:', error);

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch health status'
        };
    }
};

export default {
    getHardwareSystemInfo,
    getHardwareHealth,
};
