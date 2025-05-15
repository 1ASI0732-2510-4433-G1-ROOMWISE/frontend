import axios from 'axios';
import {jwtDecode} from "jwt-decode";

const API_URL = 'https://localhost:44390/api/v1/authentication';

// Configuración especial para desarrollo local con HTTPS
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Necesario para desarrollo local con certificado auto-firmado

});

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

            // Convert string role to number
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