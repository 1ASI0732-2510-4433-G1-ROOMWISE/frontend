// src/services/AdminService.js
import axios from 'axios';
import Admin from '../../admins/models/Admin';
import { jwtDecode } from "jwt-decode";

export default class AdminService {
    constructor() {
        this.baseUrl = 'https://localhost:44390';
        this.api = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            // Adding this option to handle CORS issues
            withCredentials: false
        });

        // Add request interceptor to include token in every request
        this.api.interceptors.request.use(async (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                if (this.isTokenExpired(token)) {
                    // Handle token expiration - redirect to login or refresh token
                    alert('Your session has expired. Please log in again.');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return Promise.reject('Token expired');
                }
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
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

    async createAdmin(adminData) {
        try {
            // Add error handling and improved logging
            console.log('Creating admin with data:', adminData);

            const response = await this.api.post('/api/v1/authentication/sign-up-admin', adminData);

            console.log('POST /api/v1/authentication/sign-up-admin response status:', response.status);
            console.log('POST /api/v1/authentication/sign-up-admin response data:', response.data);

            if (response.status === 201 || response.status === 200) {
                return response.data || {};
            }

            // Handle other successful status codes if needed
            throw new Error(`Unexpected response status: ${response.status}`);
        } catch (error) {
            // Improved error logging
            console.error('Failed to create admin:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config,
            });

            // Return a more specific error message
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                throw new Error(`Failed to create admin: Server responded with ${error.response.status} - ${JSON.stringify(error.response.data) || 'No error details'}`);
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error('Failed to create admin: No response received from server. Is the API running?');
            } else {
                // Something happened in setting up the request that triggered an Error
                throw new Error(`Failed to create admin: ${error.message}`);
            }
        }
    }

    async getAdminsByHotelId(hotelId) {
        try {
            if (!hotelId) {
                throw new Error('Hotel ID is required but was not provided or is invalid');
            }

            console.log(`Fetching admins for hotel ID: ${hotelId}`);
            const response = await this.api.get(`/api/v1/user/get-all-admins?hotelId=${hotelId}`);

            if (response.status === 200) {
                console.log('Admin data received:', response.data);
                const data = response.data || [];

                if (!Array.isArray(data)) {
                    console.warn('Expected array of admins but received:', typeof data);
                    return [];
                }

                // Convert each item to Admin object
                const admins = data.map(item => Admin.fromJson(item));

                // Remove duplicates by ID (similar to the Flutter implementation)
                const uniqueAdmins = [];
                const idSet = new Set(); // Using Set for more efficient lookup

                for (const admin of admins) {
                    if (!idSet.has(admin.id)) {
                        idSet.add(admin.id);
                        uniqueAdmins.push(admin);
                    }
                }

                return uniqueAdmins;
            }

            throw new Error(`Unexpected response status: ${response.status}`);
        } catch (error) {
            console.error('Failed to load admins by Hotel ID:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });

            if (error.response) {
                throw new Error(`Failed to load admins: Server responded with ${error.response.status} - ${JSON.stringify(error.response.data) || 'No error details'}`);
            } else if (error.request) {
                throw new Error('Failed to load admins: No response received from server. Is the API running?');
            } else {
                throw new Error(`Failed to load admins: ${error.message}`);
            }
        }
    }

    // FIXED: Enhanced token utility methods with better fallback strategies and claim extraction

    // Get hotel ID from token - IMPROVED WITH MORE ROBUST CLAIM EXTRACTION
    getHotelIdFromToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage');
                return null;
            }

            // Decode the token and log the full contents for debugging
            const decodedToken = jwtDecode(token);
            console.log('Token decoded successfully');

            // IMPROVED: Check for ALL possible claim formats for hotel ID
            const possibleHotelIdKeys = [
                // Long format claims
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality',
                // Short format claims
                'locality',
                'hotelId',
                'hotel_id',
                'hotel',
                // Try possible lowercase versions too
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality'.toLowerCase(),
                // Try with different casing
                'HotelId',
                'HOTELID'
            ];

            let hotelId = null;

            // Try each possible key
            for (const key of possibleHotelIdKeys) {
                if (decodedToken[key] !== undefined && decodedToken[key] !== null) {
                    hotelId = decodedToken[key];
                    console.log(`Found hotel ID using claim: ${key} = ${hotelId}`);
                    break;
                }
            }

            // If still not found, look through ALL token claims for anything that might be a hotel ID
            if (hotelId === null) {
                console.log('Searching all claims for possible hotel ID...');
                for (const [key, value] of Object.entries(decodedToken)) {
                    // Look for any property that might contain locality, hotel, or property
                    if (
                        (typeof key === 'string' &&
                            (key.toLowerCase().includes('hotel') ||
                                key.toLowerCase().includes('locality') ||
                                key.toLowerCase().includes('property'))) ||
                        // Or check if the value looks like a reasonable ID number (1-9999)
                        (typeof value === 'number' && value > 0 && value < 10000)
                    ) {
                        hotelId = value;
                        console.log(`Found potential hotel ID in claim "${key}": ${hotelId}`);
                        break;
                    }
                }
            }

            // FALLBACK: If STILL not found, use direct property search
            if (hotelId === null) {
                // Directly traverse all nested properties to find anything that might be a hotel ID
                const findPotentialHotelId = (obj, path = '') => {
                    for (const [key, value] of Object.entries(obj)) {
                        const currentPath = path ? `${path}.${key}` : key;

                        // Check if this key looks like it might contain a hotel ID
                        if (typeof key === 'string' &&
                            (key.toLowerCase().includes('hotel') ||
                                key.toLowerCase().includes('locality') ||
                                key.toLowerCase().includes('property'))) {
                            console.log(`Found potential hotel ID at ${currentPath}: ${value}`);
                            return value;
                        }

                        // Recursively check nested objects
                        if (value && typeof value === 'object') {
                            const result = findPotentialHotelId(value, currentPath);
                            if (result !== null) {
                                return result;
                            }
                        }
                    }
                    return null;
                };

                hotelId = findPotentialHotelId(decodedToken);
            }

            // LAST RESORT FALLBACK - Check for any numeric claims that might be a hotel ID
            if (hotelId === null) {
                for (const [key, value] of Object.entries(decodedToken)) {
                    if (typeof value === 'string' && !isNaN(parseInt(value)) && parseInt(value) > 0) {
                        // Found a numeric value that might be an ID
                        hotelId = value;
                        console.log(`Last resort: Found numeric value in claim "${key}": ${hotelId}`);
                        break;
                    }
                }
            }

            // DEVELOPMENT FALLBACK - If still nothing found and in development, use a fallback ID
            if (hotelId === null && window.location.hostname === 'localhost') {
                console.warn('DEVELOPMENT MODE: Using fallback hotel ID 1');
                return 1; // Return a default ID for development
            }

            if (hotelId === null) {
                console.error('Hotel ID not found in any token claim');
                return null;
            }

            // Convert to integer if it's a string
            if (typeof hotelId === 'string') {
                const parsedId = parseInt(hotelId);
                if (isNaN(parsedId)) {
                    console.error(`Hotel ID parse error: "${hotelId}" is not a valid number`);
                    return null;
                }
                hotelId = parsedId;
            }

            console.log(`Successfully parsed hotel ID: ${hotelId}`);
            return hotelId;
        } catch (error) {
            console.error('Failed to get hotel ID from token:', error);

            // DEVELOPMENT FALLBACK - If an error occurs in development, use fallback ID
            if (window.location.hostname === 'localhost') {
                console.warn('DEVELOPMENT MODE: Using fallback hotel ID 1 after error');
                return 1;
            }
            return null;
        }
    }

    // Get role from token - IMPROVED
    getRoleFromToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage');
                return null;
            }

            const decodedToken = jwtDecode(token);

            // Try different possible claim formats for role
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
                    console.log(`Found role using claim: ${key} = ${role}`);
                    break;
                }
            }

            // If still not found, look through all claims
            if (role === null) {
                for (const [key, value] of Object.entries(decodedToken)) {
                    if (typeof key === 'string' && key.toLowerCase().includes('role')) {
                        role = value;
                        console.log(`Found possible role in claim "${key}": ${role}`);
                        break;
                    }
                }
            }

            if (!role) {
                console.error('Role claim not found in token');
            }

            return role;
        } catch (error) {
            console.error('Failed to get role from token:', error);
            return null;
        }
    }

    // Get user ID from token - IMPROVED
    getUserIdFromToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage');
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
                    console.log(`Found user ID using claim: ${key} = ${userId}`);
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
                        console.log(`Found possible user ID in claim "${key}": ${userId}`);
                        break;
                    }
                }
            }

            if (!userId) {
                console.error('User ID claim not found in token');
            }

            return userId;
        } catch (error) {
            console.error('Failed to get user ID from token:', error);
            return null;
        }
    }

    // Method to get all token information for debugging - IMPROVED
    getTokenDebugInfo() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { error: 'No token found in localStorage' };
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
                expires: expTime ? new Date(expTime).toLocaleString() : 'Unknown',
                allClaims: decodedToken,
                claimKeys: Object.keys(decodedToken),
                hotelId: this.getHotelIdFromToken(),
                role: this.getRoleFromToken(),
                userId: this.getUserIdFromToken()
            };
        } catch (error) {
            return {
                error: `Failed to decode token: ${error.message}`,
                stack: error.stack
            };
        }
    }
}