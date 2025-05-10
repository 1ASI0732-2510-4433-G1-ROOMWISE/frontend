import axios from 'axios';

export default class NotificationService {
    constructor() {
        this.baseUrl = 'https://localhost:44390';
        this.api = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            // Important: Set withCredentials to false for CORS
            withCredentials: false
        });

        // Add request interceptor to include token in every request
        this.api.interceptors.request.use(async (config) => {
            // Get token from localStorage
            const token = localStorage.getItem('token');

            // Debug: Check if token exists and log its value (for debugging only)
            console.log('Token exists:', !!token);
            if (token) {
                // Make sure token is properly formatted with Bearer prefix
                // and check that there aren't extra spaces or characters
                config.headers.Authorization = `Bearer ${token.trim()}`;

                // Debug: Log the Authorization header (for debugging only)
                console.log('Authorization header:', config.headers.Authorization);
            } else {
                console.warn('No token found in localStorage');
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
    }

    async createNotification(notification) {
        try {
            console.log('Creating notification:', notification);

            // Check if user is authenticated before making the request
            if (!localStorage.getItem('token')) {
                console.error('Authentication token missing. User may not be logged in.');
                return Promise.reject(new Error('Authentication token missing'));
            }

            // Fixing the endpoint URL to match the API documentation
            const response = await this.api.post('/api/notifications', notification.toJson());

            console.log('Notification creation response:', response);

            if (response.status === 201 || response.status === 200) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to create notification:',
                error.response?.status,
                error.response?.data?.message || error.response?.data,
                error.message
            );

            // If unauthorized, could try to refresh token or redirect to login
            if (error.response?.status === 401) {
                console.warn('Authentication failed. Token may be expired or invalid.');
                // You might want to redirect to login or refresh token here
                // window.location.href = '/login';
            }

            // Return the actual error to better handle it in the calling code
            return Promise.reject(error);
        }
    }
}