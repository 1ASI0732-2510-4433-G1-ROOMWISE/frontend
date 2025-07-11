import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import Worker from '../model/worker.js';

/**
 * WorkerService manages all operations related to worker users.
 * It handles HTTP requests to the backend API for creating and retrieving workers,
 * and also provides robust token handling (validation, expiration, and claim extraction).
 *
 * Features:
 * - Automatically adds Bearer token to requests via Axios interceptor.
 * - Validates JWT expiration before sending requests.
 * - Handles worker creation and retrieval by hotel ID.
 * - Extracts useful information from JWT token: hotelId, userId, role, and token claims.
 *
 * Main Methods:
 * - createWorker(workerData): Registers a new worker via API.
 * - getWorkersByHotelId(hotelId): Fetches all workers for a specific hotel.
 * - getHotelIdFromToken(): Extracts the hotel ID from the JWT.
 * - getRoleFromToken(): Extracts the user role from the JWT.
 * - getUserIdFromToken(): Extracts the user ID from the JWT.
 * - getTokenDebugInfo(): Returns detailed debug info about the current token.
 */
export default class WorkerService {
    constructor() {
        this.baseUrl = 'https://localhost:7138';
        this.api = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: false
        });

        this.api.interceptors.request.use(async (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                if (this.isTokenExpired(token)) {
                    alert('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return Promise.reject('Token expirado');
                }
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => Promise.reject(error));
    }

    isTokenExpired(token) {
        try {
            const decoded = jwtDecode(token);
            return decoded.exp < Date.now() / 1000;
        } catch (error) {
            console.error('Error verificando expiración del token:', error);
            return true;
        }
    }

    async createWorker(workerData) {
        try {
            console.log('Creando worker con datos:', workerData);

            const response = await this.api.post('/api/v1/authentication/sign-up-worker', workerData);

            if ([200, 201].includes(response.status)) {
                return response.data || {};
            }

            throw new Error(`Estado inesperado: ${response.status}`);
        } catch (error) {
            console.error('Error al crear worker:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });

            if (error.response) {
                throw new Error(`Error al crear trabajador: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                throw new Error('Error al crear trabajador: No se recibió respuesta del servidor.');
            } else {
                throw new Error(`Error al crear trabajador: ${error.message}`);
            }
        }
    }

    async getWorkersByHotelId(hotelId) {
        try {
            if (!hotelId) {
                throw new Error('Se requiere un ID de hotel válido.');
            }

            console.log(`Obteniendo workers para hotel ID: ${hotelId}`);
            const response = await this.api.get(`/api/v1/user/get-all-workers?hotelId=${hotelId}`);

            if (response.status === 200) {
                const data = response.data || [];

                if (!Array.isArray(data)) {
                    console.warn('Se esperaba un array de workers, pero se recibió:', typeof data);
                    return [];
                }

                const workers = data.map(item => Worker.fromJson(item));
                const uniqueWorkers = [];
                const idSet = new Set();

                for (const worker of workers) {
                    if (!idSet.has(worker.id)) {
                        idSet.add(worker.id);
                        uniqueWorkers.push(worker);
                    }
                }

                return uniqueWorkers;
            }

            throw new Error(`Estado inesperado: ${response.status}`);
        } catch (error) {
            console.error('Error al cargar workers por hotel ID:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            if (error.response) {
                throw new Error(`Error al cargar trabajadores: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                throw new Error('Error al cargar trabajadores: No se recibió respuesta del servidor.');
            } else {
                throw new Error(`Error al cargar trabajadores: ${error.message}`);
            }
        }
    }

    // Enhanced token utility methods - similar to AdminService.js

    getHotelIdFromToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No se encontró token en localStorage');
                return null;
            }

            const decodedToken = jwtDecode(token);
            console.log('Token decodificado correctamente');

            const possibleHotelIdKeys = [
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality',
                'locality',
                'hotelId',
                'hotel_id',
                'hotel',
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality'.toLowerCase(),
                'HotelId',
                'HOTELID'
            ];

            let hotelId = null;

            // Try each possible key
            for (const key of possibleHotelIdKeys) {
                if (decodedToken[key] !== undefined && decodedToken[key] !== null) {
                    hotelId = decodedToken[key];
                    console.log(`ID de hotel encontrado usando claim: ${key} = ${hotelId}`);
                    break;
                }
            }

            // If still not found, look through ALL token claims
            if (hotelId === null) {
                console.log('Buscando en todos los claims un posible ID de hotel...');
                for (const [key, value] of Object.entries(decodedToken)) {
                    if (
                        (typeof key === 'string' &&
                            (key.toLowerCase().includes('hotel') ||
                                key.toLowerCase().includes('locality') ||
                                key.toLowerCase().includes('property'))) ||
                        (typeof value === 'number' && value > 0 && value < 10000)
                    ) {
                        hotelId = value;
                        console.log(`Posible ID de hotel encontrado en claim "${key}": ${hotelId}`);
                        break;
                    }
                }
            }

            // DEVELOPMENT FALLBACK
            if (hotelId === null && window.location.hostname === 'localhost') {
                console.warn('MODO DESARROLLO: Usando ID de hotel 1 por defecto');
                return 1;
            }

            if (hotelId === null) {
                console.error('ID de hotel no encontrado en ningún claim del token');
                return null;
            }

            // Convert to integer if it's a string
            if (typeof hotelId === 'string') {
                const parsedId = parseInt(hotelId);
                if (isNaN(parsedId)) {
                    console.error(`Error al analizar ID de hotel: "${hotelId}" no es un número válido`);
                    return null;
                }
                hotelId = parsedId;
            }

            console.log(`ID de hotel analizado correctamente: ${hotelId}`);
            return hotelId;
        } catch (error) {
            console.error('Error al obtener ID de hotel del token:', error);

            if (window.location.hostname === 'localhost') {
                console.warn('MODO DESARROLLO: Usando ID de hotel 1 después de error');
                return 1;
            }
            return null;
        }
    }

    getRoleFromToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No se encontró token en localStorage');
                return null;
            }

            const decodedToken = jwtDecode(token);

            const possibleRoleKeys = [
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
                'role',
                'roles',
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'.toLowerCase(),
                'userRole',
                'user_role',
                'Role'
            ];

            let role = null;

            // Try each possible key
            for (const key of possibleRoleKeys) {
                if (decodedToken[key] !== undefined) {
                    role = decodedToken[key];
                    console.log(`Rol encontrado usando claim: ${key} = ${role}`);
                    break;
                }
            }

            // If still not found, look through all claims
            if (role === null) {
                for (const [key, value] of Object.entries(decodedToken)) {
                    if (typeof key === 'string' && key.toLowerCase().includes('role')) {
                        role = value;
                        console.log(`Posible rol encontrado en claim "${key}": ${role}`);
                        break;
                    }
                }
            }

            if (!role) {
                console.error('Claim de rol no encontrado en el token');
            }

            return role;
        } catch (error) {
            console.error('Error al obtener rol del token:', error);
            return null;
        }
    }

    // Adding the missing getUserIdFromToken method
    getUserIdFromToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No se encontró token en localStorage');
                return null;
            }

            const decodedToken = jwtDecode(token);

            // Try different possible claim formats for user ID
            const possibleUserIdKeys = [
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid',
                'sid',
                'sub',
                'subject',
                'id',
                'userId',
                'user_id',
                'nameidentifier',
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'.toLowerCase(),
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'.toLowerCase()
            ];

            let userId = null;

            // Try each possible key
            for (const key of possibleUserIdKeys) {
                if (decodedToken[key] !== undefined) {
                    userId = decodedToken[key];
                    console.log(`ID de usuario encontrado usando claim: ${key} = ${userId}`);
                    break;
                }
            }

            // If still not found, look through all claims
            if (userId === null) {
                for (const [key, value] of Object.entries(decodedToken)) {
                    if (typeof key === 'string' &&
                        (key.toLowerCase().includes('sid') ||
                            key.toLowerCase().includes('nameidentifier') ||
                            key.toLowerCase().includes('userid') ||
                            key.toLowerCase().includes('sub'))) {
                        userId = value;
                        console.log(`Posible ID de usuario encontrado en claim "${key}": ${userId}`);
                        break;
                    }
                }
            }

            if (!userId) {
                console.error('Claim de ID de usuario no encontrado en el token');
            }

            return userId;
        } catch (error) {
            console.error('Error al obtener ID de usuario del token:', error);
            return null;
        }
    }

    // Method to get all token information for debugging
    getTokenDebugInfo() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { error: 'No se encontró token en localStorage' };
            }

            const decodedToken = jwtDecode(token);

            // Get expiration time (might be 'exp' or 'expiration')
            let expTime = null;
            if (decodedToken.exp) {
                expTime = decodedToken.exp * 1000; // Convert to milliseconds
            } else if (decodedToken.expiration) {
                expTime = decodedToken.expiration * 1000;
            }

            // Check token validity
            const isValid = expTime ? (expTime > Date.now()) : false;

            return {
                valid: isValid,
                expires: expTime ? new Date(expTime).toLocaleString() : 'Desconocido',
                allClaims: decodedToken,
                claimKeys: Object.keys(decodedToken),
                hotelId: this.getHotelIdFromToken(),
                role: this.getRoleFromToken(),
                userId: this.getUserIdFromToken()
            };
        } catch (error) {
            return {
                error: `Error al decodificar token: ${error.message}`,
                stack: error.stack
            };
        }
    }
}