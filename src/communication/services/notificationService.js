import axios from 'axios';

export default class NotificationService {
    constructor() {
        this.baseUrl = 'https://localhost:7138';
        this.api = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: false
        });

        // Add request interceptor to include token in every request
        this.api.interceptors.request.use(async (config) => {
            const token = localStorage.getItem('token');
            console.log('Token exists:', !!token);

            if (token) {
                config.headers.Authorization = `Bearer ${token.trim()}`;
                console.log('Authorization header:', config.headers.Authorization);
            } else {
                console.warn('No token found in localStorage');
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
    }

    // Get all notification types
    async getNotificationTypes() {
        try {
            console.log('Fetching notification types...');
            const response = await this.api.get('/api/types-notifications');
            console.log('Notification types response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notification types:', error);
            throw error;
        }
    }

    // Create notification
    async createNotification(notification) {
        try {
            console.log('Creating notification:', notification);

            if (!localStorage.getItem('token')) {
                console.error('Authentication token missing. User may not be logged in.');
                return Promise.reject(new Error('Authentication token missing'));
            }

            const response = await this.api.post('/api/notifications', notification.toJson());
            console.log('Notification creation response:', response);

            if (response.status === 201 || response.status === 200) {
                return response.data;
            }

            return false;
        } catch (error) {
            console.error('Failed to create notification:',
                error.response?.status,
                error.response?.data?.message || error.response?.data,
                error.message
            );

            if (error.response?.status === 401) {
                console.warn('Authentication failed. Token may be expired or invalid.');
            }

            return Promise.reject(error);
        }
    }

    // Get all notifications (FIXED - using correct endpoint)
    async getAllNotifications(hotelId) {
        try {
            console.log('Fetching all notifications for hotel:', hotelId);
            const response = await this.api.get(`/api/notifications/get-all-notifications?hotelId=${hotelId}`);
            console.log('All notifications response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            throw error;
        }
    }

    // Mark notification as read
    async markAsRead(notificationId) {
        try {
            const response = await this.api.patch(`/api/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            throw error;
        }
    }

    // Delete notification
    async deleteNotification(notificationId) {
        try {
            const response = await this.api.delete(`/api/notifications/${notificationId}`);
            return response.status === 200 || response.status === 204;
        } catch (error) {
            console.error('Failed to delete notification:', error);
            throw error;
        }
    }
}