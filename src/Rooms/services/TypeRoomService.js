import axios from 'axios';
import TypeRoom from '../models/TypeRoom.js';
import AuthService from '../../iam/service/auth_service.js';

const API_BASE_URL = 'https://localhost:7138/api';

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

/**
 * TypeRoomService is a utility module for managing "type of room" entities
 * through a RESTful API. It uses a pre-configured Axios instance with interceptors
 * for authentication and error handling.
 * 
 * Main functionalities include:
 * - Fetching all room types
 * - Fetching a specific room type by ID
 * - Creating, updating, and deleting room types
 * 
 * Authentication is handled via Bearer token (retrieved from AuthService),
 * which is automatically attached to every request.
 * 
 * All responses are parsed and returned as instances of the `TypeRoom` model,
 * when applicable.
 */

const TypeRoomService = {
    /**
     * Obtiene todos los tipos de habitaciones
     * @returns {Promise<Array<TypeRoom>>} - Lista de objetos TypeRoom
     */
    async getAllTypeRooms() {
        try {
            const response = await axiosInstance.get('/types-rooms/get-all-type-rooms');
            return response.data.map(item => TypeRoom.fromJson(item));
        } catch (error) {
            console.error('Error al obtener tipos de habitaciones:', error);
            throw error;
        }
    },

    /**
     * Obtiene un tipo de habitación por su ID
     * @param {number} id - El ID del tipo de habitación
     * @returns {Promise<TypeRoom>} - Objeto TypeRoom
     */
    async getTypeRoomById(id) {
        try {
            const response = await axiosInstance.get(`/types-rooms/get-type-room-by-id/${id}`);
            return TypeRoom.fromJson(response.data);
        } catch (error) {
            console.error(`Error al obtener tipo de habitación con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crea un nuevo tipo de habitación
     * @param {TypeRoom} typeRoom - Objeto TypeRoom a crear
     * @returns {Promise<Object>} - Tipo de habitación creado
     */
    async createTypeRoom(typeRoom) {
        try {
            // Convertir el objeto TypeRoom a JSON si es una instancia de la clase
            const data = typeRoom instanceof TypeRoom ? typeRoom.toJson() : typeRoom;

            const response = await axiosInstance.post('/types-rooms/create-type-room', data);
            return response.data;
        } catch (error) {
            console.error('Error al crear tipo de habitación:', error);
            throw error;
        }
    },

    /**
     * Actualiza un tipo de habitación existente
     * @param {number} id - ID del tipo de habitación
     * @param {TypeRoom} typeRoom - Objeto TypeRoom a actualizar
     * @returns {Promise<Object>} - Tipo de habitación actualizado
     */
    async updateTypeRoom(id, typeRoom) {
        try {
            const data = typeRoom instanceof TypeRoom ? typeRoom.toJson() : typeRoom;
            const response = await axiosInstance.put(`/types-rooms/update-type-room/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar tipo de habitación con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Elimina un tipo de habitación por su ID
     * @param {number} id - El ID del tipo de habitación a eliminar
     * @returns {Promise<boolean>} - Resultado de la operación
     */
    async deleteTypeRoom(id) {
        try {
            const response = await axiosInstance.delete(`/types-rooms/delete-type-room/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar tipo de habitación con ID ${id}:`, error);
            throw error;
        }
    }
};

export default TypeRoomService;