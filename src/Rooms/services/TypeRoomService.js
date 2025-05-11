// services/TypeRoomService.js
import axios from 'axios';
import TypeRoom from '../models/TypeRoom.js';
import AuthService from '../../iam/service/auth_service.js'; // Importamos el AuthService existente

// Determinar la URL base según el entorno
const API_BASE_URL = 'https://localhost:44390/api';

// Crear una instancia personalizada de axios
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Importante para CORS
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
        // Registrar todos los errores para depuración
        console.error('API Request failed:', error);

        // Formatear el mensaje de error para ser más amigable
        if (error.code === 'ERR_NETWORK') {
            error.friendlyMessage = 'No se pudo conectar al servidor. Verifique su conexión a internet y que el servidor esté funcionando.';
        } else if (error.response) {
            if (error.response.status === 401) {
                error.friendlyMessage = 'Su sesión ha expirado o no tiene permisos para realizar esta acción. Por favor, inicie sesión nuevamente.';
                // Opcionalmente redireccionar al login si la sesión expiró
                // window.location.href = '/login';
            } else {
                error.friendlyMessage = `Error del servidor: ${error.response.status} - ${error.response.data?.message || 'Error desconocido'}`;
            }
        } else {
            error.friendlyMessage = 'Error desconocido al procesar la solicitud.';
        }

        // Re-lanzar el error para que pueda ser capturado por el componente
        throw error;
    }
);

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
     * @returns {Promise<boolean>} - Resultado de la operación
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
     * @param {TypeRoom} typeRoom - Objeto TypeRoom a actualizar
     * @returns {Promise<boolean>} - Resultado de la operación
     */
    async updateTypeRoom(typeRoom) {
        try {
            const data = typeRoom instanceof TypeRoom ? typeRoom.toJson() : typeRoom;
            const response = await axiosInstance.put(`/types-rooms/update-type-room/${typeRoom.id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar tipo de habitación con ID ${typeRoom.id}:`, error);
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