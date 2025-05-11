import axios from 'axios';
import AuthService from '../../iam/service/auth_service.js';
import { RoomModel } from '../models/Room.js';

const API_BASE_URL = 'https://localhost:44390/api';

// Crear una instancia personalizada de axios
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false
});

// Interceptor para añadir token de autenticación
axiosInstance.interceptors.request.use(config => {
    const token = AuthService.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejo de errores
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        console.error('API Request failed:', error);

        if (error.code === 'ERR_NETWORK') {
            error.friendlyMessage = 'No se pudo conectar al servidor. Verifique su conexión a internet y que el servidor esté funcionando.';
        } else if (error.response) {
            if (error.response.status === 401) {
                error.friendlyMessage = 'Su sesión ha expirado o no tiene permisos para realizar esta acción. Por favor, inicie sesión nuevamente.';
            } else {
                error.friendlyMessage = `Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`;
            }
        } else {
            error.friendlyMessage = 'Error desconocido al procesar la solicitud.';
        }

        throw error;
    }
);

export default {
    /**
     * Obtener todas las habitaciones, opcionalmente filtradas por hotelId
     * @param {number} hotelId
     * @returns {Promise}
     */
    getAllRooms(hotelId) {
        const params = hotelId ? { hotelId } : {};
        return axiosInstance.get('/rooms/get-all-rooms', { params })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching rooms:', error);
                throw error;
            });
    },

    /**
     * Crear una nueva habitación
     * @param {Object} roomData
     * @returns {Promise}
     */
    createRoom(roomData) {
        return axiosInstance.post('/rooms/create-room', roomData)
            .then(response => response.data)
            .catch(error => {
                console.error('Error creating room:', error);
                throw error;
            });
    },

    /**
     * Obtener tipos de habitación disponibles
     * @returns {Promise}
     */
    getRoomTypes() {
        return axiosInstance.get('/rooms/room-types')
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching room types:', error);
                throw error;
            });
    },

    /**
     * Obtener hoteles disponibles
     * @returns {Promise}
     */
    getHotels() {
        const token = AuthService.getToken();
        console.log('Using token for hotels request:', token ? 'Token exists' : 'No token found');

        return axiosInstance.get('/hotels')
            .then(response => {
                console.log('Hotels API request successful');
                return response.data;
            })
            .catch(error => {
                console.error('Error fetching hotels:', error);
                console.error('Response status:', error.response?.status);
                console.error('Response data:', error.response?.data);
                throw error;
            });
    }
};