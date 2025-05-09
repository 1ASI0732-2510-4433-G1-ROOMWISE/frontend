// src/services/AdminService.js
import axios from 'axios';
import Admin from '../models/Admin';
import { getAccessToken, isTokenExpired } from '../../../iam/service/auth_service.js';

const BASE_URL = 'https://sweetmanager-api.ryzeon.me';

export default class AdminService {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: BASE_URL,
        });
    }

    async _getHeaders() {
        const token = await getAccessToken();
        if (!token || isTokenExpired(token)) {
            throw new Error('Token is missing or expired. Please log in again.');
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    }

    async createAdmin(adminData) {
        try {
            const headers = await this._getHeaders();
            const response = await this.axiosInstance.post(
                '/api/v1/authentication/sign-up-admin',
                adminData,
                { headers }
            );

            console.log('POST /api/v1/authentication/sign-up-admin response status:', response.status);
            console.log('POST /api/v1/authentication/sign-up-admin response body:', response.data);

            if (response.status === 201 || response.status === 200) {
                return response.data;
            }
            throw new Error(`Failed to create admin: ${response.status} - ${response.data}`);
        } catch (error) {
            console.error('Error creating admin:', error);
            throw error;
        }
    }

    async getAdminsByHotelId(hotelId) {
        try {
            const headers = await this._getHeaders();
            const response = await this.axiosInstance.get(
                `/api/v1/user/get-all-admins?hotelId=${hotelId}`,
                { headers }
            );

            if (response.status === 200) {
                const data = response.data;
                const admins = data.map(element => Admin.fromJson(element));

                const newList = [];
                const ids = [];
                let validation = false;

                for (let i = 0; i < admins.length; i++) {
                    if (i + 1 < admins.length && admins[i].id !== admins[i + 1].id) {
                        ids.push(admins[i].id);
                        newList.push(admins[i]);
                    }
                    if (i + 1 === admins.length) {
                        for (let j = 0; j < ids.length; j++) {
                            if (admins[i].id === ids[j]) {
                                validation = true;
                            }
                        }
                    }
                }

                if (!validation) {
                    newList.push(admins[admins.length - 1]);
                }

                return newList;
            }
            throw new Error(`Failed to load admins by Hotel ID: ${response.status} - ${response.data}`);
        } catch (error) {
            console.error('Error fetching admins:', error);
            throw error;
        }
    }
}