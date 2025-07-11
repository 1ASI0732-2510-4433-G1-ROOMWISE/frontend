import axios from 'axios';
import {jwtDecode} from "jwt-decode";

const API_URL = 'https://localhost:7138/api/v1/authentication';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * AuthService handles all authentication-related operations in the application:
 * 
 * - User login and token management (storage, decoding, expiration handling)
 * - Silent re-authentication and token refreshing
 * - Role-based sign-up (Owner, Admin, Worker)
 * - Decoding and extracting user-related information from JWT
 * - Axios interceptor configuration to attach bearer tokens to requests
 * 
 * The service uses `localStorage` to persist JWT tokens and `jwt-decode` for
 * decoding and validating token claims.
 * 
 * All API calls are made using a configured Axios instance with a base URL.
 */
class AuthService {
    static axiosInstance = axiosInstance;

    async login(email, password, roleId) {
        try {
            const response = await axiosInstance.post('/sign-in', {
                email,
                password,
                rolesId: roleId
            });

            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Nuevo método para refrescar el token después de crear un hotel
    async refreshToken() {
        try {
            const currentToken = this.getToken();
            if (!currentToken) {
                throw new Error('No hay token disponible para refrescar');
            }

            const response = await axiosInstance.post('/refresh-token', {}, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            if (response.status === 200 && response.data.token) {
                localStorage.setItem('token', response.data.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al refrescar token:', error);
            throw error;
        }
    }

    // Método alternativo: Re-autenticar silenciosamente
    async silentReauth() {
        try {
            const currentToken = this.getToken();
            if (!currentToken) {
                throw new Error('No hay token disponible');
            }

            const decoded = this.getDecodedToken();
            if (!decoded) {
                throw new Error('Token inválido');
            }

            // Obtener información del usuario desde el token actual
            const userEmail = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
            const userRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            // Convertir rol a ID
            let roleId;
            if (userRole === 'ROLE_OWNER') roleId = 1;
            else if (userRole === 'ROLE_ADMIN') roleId = 2;
            else if (userRole === 'ROLE_WORKER') roleId = 3;
            else throw new Error('Rol no válido');

            // Realizar re-autenticación silenciosa
            const response = await axiosInstance.post('/refresh-user-token', {
                email: userEmail,
                rolesId: roleId
            }, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            if (response.status === 200 && response.data.token) {
                localStorage.setItem('token', response.data.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error en re-autenticación silenciosa:', error);
            throw error;
        }
    }

    async signupOwner(id, username, name, surname, email, phone, password) {
        try {
            const response = await axiosInstance.post('/sign-up-owner', {
                id,
                username,
                name,
                surname,
                email,
                phone,
                state: 'ACTIVE',
                password
            });
            return response.status === 200;
        } catch (error) {
            console.error('Signup owner error:', error);
            throw error;
        }
    }

    async signupAdmin(dni, username, name, surname, email, phone, password) {
        try {
            const response = await axiosInstance.post('/sign-up-admin', {
                id: dni,
                username,
                name,
                surname,
                email,
                phone,
                state: 'ACTIVE',
                password
            });
            return response.status === 200;
        } catch (error) {
            console.error('Signup admin error:', error);
            throw error;
        }
    }

    async signupWorker(dni, username, name, surname, email, phone, password) {
        try {
            const response = await axiosInstance.post('/sign-up-worker', {
                id: dni,
                username,
                name,
                surname,
                email,
                phone,
                state: 'ACTIVE',
                password
            });
            return response.status === 200;
        } catch (error) {
            console.error('Signup worker error:', error);
            throw error;
        }
    }

    getDecodedToken() {
        const token = this.getToken();
        if (!token) return null;

        try {
            return jwtDecode(token);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    logout() {
        localStorage.removeItem('token');
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    getToken() {
        return localStorage.getItem('token');
    }

    static configureInterceptors() {
        this.axiosInstance.interceptors.request.use(config => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    getCurrentUserRole() {
        const token = this.getToken();
        if (!token) {
            console.error('No token found.');
            return null;
        }

        try {
            const decoded = jwtDecode(token);
            console.log('Decoded token:', decoded);
            const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            if (!role) {
                console.error('Role not found in token.');
                return null;
            }
            console.log('User role from token:', role);

            if (role === 'ROLE_OWNER') {
                return 1;
            } else if (role === 'ROLE_ADMIN') {
                return 2;
            } else if (role === 'ROLE_WORKER') {
                return 3;
            } else {
                console.error('Unknown role:', role);
                return null;
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }
}

const storage = {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
};

export const getAccessToken = async () => {
    return storage.getItem('token');
};

export const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.exp < Date.now() / 1000;
    } catch (error) {
        return true;
    }
};

export const getHotelId = async () => {
    const token = await getAccessToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        const hotelId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality'];
        return hotelId ? parseInt(hotelId) : null;
    } catch (error) {
        console.error('Error decoding hotel ID:', error);
        return null;
    }
};

export const getIdentity = async () => {
    const token = await getAccessToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
    } catch (error) {
        console.error('Error decoding identity:', error);
        return null;
    }
};

export default new AuthService();