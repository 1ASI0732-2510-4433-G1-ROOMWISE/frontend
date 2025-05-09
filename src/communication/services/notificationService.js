import axios from 'axios';
import Notification from '@/models/Notification';
import AuthService from './authService';

const API_BASE_URL = 'https://localhost:44390/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false
    })
});

export default {
    async _getHeaders() {
        const token = AuthService.getToken();
        if (!token) throw new Error('Token is missing. Please log in.');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    },

    async createNotification(notification) {
        const headers = await this._getHeaders();
        const response = await axiosInstance.post('/notifications', notification.toJson(), { headers });
        return response.status === 200;
    },

    async createAlert(notification) {
        return this.createNotification(notification);
    },

    async getNotificationById(id) {
        const headers = await this._getHeaders();
        const response = await axiosInstance.get(`/notifications/get-notification-by-id/${id}`, { headers });
        return Notification.fromJson(response.data);
    },

    async getAllNotifications(hotelId) {
        const headers = await this._getHeaders();
        const response = await axiosInstance.get(`/notifications/get-all-notifications?hotelId=${hotelId}`, { headers });
        return response.data.map(json => Notification.fromJson(json));
    },

    async getMessages(hotelId) {
        const notifications = await this.getAllNotifications(hotelId);
        return notifications.filter(n => n.typesNotificationsId === 1);
    },

    async getAlertNotifications(hotelId) {
        const notifications = await this.getAllNotifications(hotelId);
        return notifications.filter(n => n.typesNotificationsId === 2);
    }
};