// src/services/ProviderService.js
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

export default class ProviderService {
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
                    alert('Your session has expired. Please log in again.');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return Promise.reject('Token expired');
                }
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => Promise.reject(error));
    }

    isTokenExpired(token) {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true;
        }
    }

    async createProvider(providerData) {
        try {
            // Asegurarse que los datos tienen el formato correcto
            const formattedData = this._formatProviderData(providerData);

            console.log('Sending provider data:', JSON.stringify(formattedData, null, 2));

            const response = await this.api.post('/api/provider/create-provider', formattedData);
            console.log('Create provider response:', response);

            // Mejor manejo de la respuesta para extraer el ID
            if (response.status === 201 || response.status === 200) {
                // Verificar diferentes patrones de respuesta comunes
                const responseData = response.data;

                // Verificamos si hay datos y si tienen un ID
                if (responseData) {
                    if (typeof responseData === 'object') {
                        console.log('Provider created with data:', responseData);
                        return responseData; // Devolvemos el objeto completo
                    } else if (typeof responseData === 'number' ||
                        (typeof responseData === 'string' && !isNaN(parseInt(responseData)))) {
                        // Si la respuesta es solo un ID (número o string numérico)
                        const id = typeof responseData === 'number' ? responseData : parseInt(responseData);
                        console.log('Provider created with ID:', id);
                        return { id };
                    }
                }

                // Si llegamos aquí, devolvemos la respuesta tal cual y dejamos que el
                // código cliente maneje la validación
                return responseData || {};
            }

            throw new Error(`Unexpected response status: ${response.status}`);
        } catch (error) {
            throw this._handleError(error, 'create provider');
        }
    }

    // Método para asegurar formato correcto del provider
    _formatProviderData(data) {
        // Asegurarnos que todos los campos tienen el formato esperado
        return {
            ...data,
            // Convertir phone a string si es número
            phone: data.phone ? data.phone.toString() : '',
            // Asegurarnos que el estado tiene el formato esperado
            state: data.state || 'active'
        };
    }

    // Actualización del método createSupply en ProviderService.js

    async createSupply(data) {
        try {
            console.log('Creating supply with data:', data);
            if (!data.providersId) {
                throw new Error('Provider ID is required for creating a supply');
            }

            // Asegurarnos de que resource está presente - campo requerido según la API
            if (!data.resource) {
                data.resource = 'Default Resource';
            }

            // Formatear datos para el backend
            const supplyData = {
                ...data,
                price: parseFloat(data.price || 0),
                stock: parseInt(data.stock || 0),
                // Convertir providersId a número si es posible
                providersId: typeof data.providersId === 'string' ?
                    parseInt(data.providersId) : data.providersId
            };

            console.log('Formatted supply data:', supplyData);
            const response = await this.api.post('/api/supply/create-supply', supplyData);
            console.log('Create supply response:', response);

            if (response.status === 201 || response.status === 200) {
                // Devolver el objeto completo para permitir análisis flexible
                return response.data || {};
            }
            throw new Error(`Unexpected response status: ${response.status}`);
        } catch (error) {
            throw this._handleError(error, 'create supply');
        }
    }

    async createPaymentOwner(data) {
        try {
            console.log('Creating payment owner with data:', data);

            // Formatear datos para el backend
            const paymentData = {
                ...data,
                finalAmount: parseFloat(data.finalAmount || 0)
            };

            console.log('Formatted payment owner data:', paymentData);
            const response = await this.api.post('/api/payment-owner/create-payment-owner', paymentData);
            console.log('Create payment owner response:', response);

            if (response.status === 201 || response.status === 200) {
                // Devolver el objeto completo para permitir análisis flexible
                return response.data || {};
            }
            throw new Error(`Unexpected response status: ${response.status}`);
        } catch (error) {
            throw this._handleError(error, 'create payment owner');
        }
    }

    async createSuppliesRequest(data) {
        try {
            console.log('Creating supplies request with data:', data);

            // Formatear datos para el backend
            const requestData = {
                ...data,
                count: parseInt(data.count || 1),
                amount: parseFloat(data.amount || 0)
            };

            console.log('Formatted supplies request data:', requestData);
            const response = await this.api.post('/api/supplies-request/create-supplies-request', requestData);
            console.log('Create supplies request response:', response);

            if (response.status === 201 || response.status === 200) {
                return response.data || {};
            }
            throw new Error(`Unexpected response status: ${response.status}`);
        } catch (error) {
            throw this._handleError(error, 'create supplies request');
        }
    }

    async getProvidersByHotelId(hotelId) {
        try {
            if (!hotelId) throw new Error('Hotel ID is required but was not provided or is invalid');
            const response = await this.api.get(`/api/provider/get-all/${hotelId}`);
            if (response.status === 200) {
                const data = response.data || [];
                if (!Array.isArray(data)) return [];
                const uniqueProviders = [];
                const idSet = new Set();
                for (const provider of data) {
                    if (!idSet.has(provider.id)) {
                        idSet.add(provider.id);
                        uniqueProviders.push(provider);
                    }
                }
                return uniqueProviders;
            }
            throw new Error(`Unexpected response status: ${response.status}`);
        } catch (error) {
            throw this._handleError(error, 'load providers');
        }
    }

    getHotelIdFromToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const decodedToken = jwtDecode(token);
            const possibleHotelIdKeys = [
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality',
                'locality', 'hotelId', 'hotel_id', 'hotel',
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality'.toLowerCase(),
                'HotelId', 'HOTELID'
            ];
            let hotelId = null;
            for (const key of possibleHotelIdKeys) {
                if (decodedToken[key] !== undefined && decodedToken[key] !== null) {
                    hotelId = decodedToken[key];
                    break;
                }
            }
            if (hotelId === null) {
                for (const [key, value] of Object.entries(decodedToken)) {
                    if (
                        (typeof key === 'string' &&
                            (key.toLowerCase().includes('hotel') ||
                                key.toLowerCase().includes('locality') ||
                                key.toLowerCase().includes('property'))) ||
                        (typeof value === 'number' && value > 0 && value < 10000)
                    ) {
                        hotelId = value;
                        break;
                    }
                }
            }
            if (hotelId === null && window.location.hostname === 'localhost') return 1;
            if (hotelId === null) return null;
            if (typeof hotelId === 'string') {
                const parsedId = parseInt(hotelId);
                if (isNaN(parsedId)) return null;
                hotelId = parsedId;
            }
            return hotelId;
        } catch (error) {
            if (window.location.hostname === 'localhost') return 1;
            return null;
        }
    }

    getRoleFromToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const decodedToken = jwtDecode(token);
            const possibleRoleKeys = [
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
                'role', 'roles',
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'.toLowerCase(),
                'userRole', 'user_role', 'Role'
            ];
            let role = null;
            for (const key of possibleRoleKeys) {
                if (decodedToken[key] !== undefined) {
                    role = decodedToken[key];
                    break;
                }
            }
            if (role === null) {
                for (const [key, value] of Object.entries(decodedToken)) {
                    if (typeof key === 'string' && key.toLowerCase().includes('role')) {
                        role = value;
                        break;
                    }
                }
            }
            return role;
        } catch (error) {
            return null;
        }
    }

    // Obtiene el ownerId desde el token
    getOwnerIdFromToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token no encontrado');
            const payload = jwtDecode(token);

            // Buscar en varias claves posibles
            const possibleOwnerIdKeys = [
                'ownerId',
                'owner_id',
                'OwnerId',
                'userId',
                'sub',
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
            ];

            let ownerId = null;
            for (const key of possibleOwnerIdKeys) {
                if (payload[key] !== undefined && payload[key] !== null) {
                    ownerId = payload[key];
                    break;
                }
            }

            // Si no encontramos nada, intentar encontrar algo que se parezca a un ID
            if (ownerId === null) {
                for (const [key, value] of Object.entries(payload)) {
                    if (typeof key === 'string' &&
                        (key.toLowerCase().includes('id') || key.toLowerCase().includes('owner'))) {
                        ownerId = value;
                        break;
                    }
                }
            }

            console.log('Owner ID encontrado en el token:', ownerId);

            // Si estamos en desarrollo y no encontramos nada, usar un ID por defecto
            if (ownerId === null && window.location.hostname === 'localhost') {
                return 1;
            }

            return ownerId;
        } catch (e) {
            console.error('Error al obtener ownerId del token:', e);
            if (window.location.hostname === 'localhost') return 1;
            return null;
        }
    }

    // Manejo de errores centralizado con información detallada
    _handleError(error, action) {
        console.error(`Error durante ${action}:`, error);

        let errorMessage = `Error al ${action}`;

        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);

            // Intentar extraer más información del error
            let detailMessage = '';

            if (typeof error.response.data === 'string') {
                detailMessage = error.response.data;
            } else if (error.response.data && typeof error.response.data === 'object') {
                if (error.response.data.message) {
                    detailMessage = error.response.data.message;
                } else if (error.response.data.errors) {
                    // Para errores de validación de .NET
                    if (Array.isArray(error.response.data.errors)) {
                        detailMessage = error.response.data.errors.join(', ');
                    } else {
                        const errMsgs = [];
                        for (const field in error.response.data.errors) {
                            if (Array.isArray(error.response.data.errors[field])) {
                                errMsgs.push(`${field}: ${error.response.data.errors[field].join(', ')}`);
                            }
                        }
                        detailMessage = errMsgs.join('; ');
                    }
                } else {
                    // Intentar mostrar todo el objeto de error
                    detailMessage = JSON.stringify(error.response.data);
                }
            }

            return new Error(`${errorMessage}: ${error.response.status} - ${detailMessage || 'Sin detalles'}`);
        } else if (error.request) {
            console.error('Error request:', error.request);
            return new Error(`${errorMessage}: No hay respuesta del servidor. Verifique su conexión.`);
        } else {
            return new Error(`${errorMessage}: ${error.message}`);
        }
    }
}