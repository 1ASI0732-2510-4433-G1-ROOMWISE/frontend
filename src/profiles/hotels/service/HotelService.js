import { Hotel } from '../models/Hotel.js';

export class HotelService {
    constructor() {
        // URL base del API con protocolo HTTPS
        this.baseUrl = 'https://localhost:7138/api/hotel';
    }

    async fetchHotels() {
        try {
            const token = this.getCleanToken(); // Usar el método mejorado para obtener el token
            console.log('Token limpio obtenido:', token ? 'Presente' : 'No encontrado');

            if (!token) {
                throw new Error('No se encontró token de autenticación o el token no es válido');
            }

            // Verificar que el servidor esté disponible
            console.log('Intentando conectar a:', this.baseUrl);

            const response = await fetch(`${this.baseUrl}/all`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            console.log('Estado de la respuesta:', response.status);

            if (response.status === 401) {
                console.error('Error 401: Token no válido o expirado');
                localStorage.removeItem('token'); // Limpiar token inválido
                throw new Error('Su sesión ha expirado o no es válida. Por favor inicie sesión nuevamente.');
            }

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Error en respuesta:', errorData);
                throw new Error(`Error HTTP ${response.status}: ${errorData}`);
            }

            const jsonList = await response.json();
            console.log('Hoteles recibidos:', jsonList);
            return jsonList.map(json => Hotel.fromJson(json));
        } catch (e) {
            console.error('Error completo en fetchHotels:', e);

            // Propagar errores de autenticación
            if (e.message.includes('sesión ha expirado') ||
                e.message.includes('Token no válido')) {
                throw e;
            }

            // Mensaje específico para errores de CORS
            if (e.message.includes('has been blocked by CORS policy') ||
                e.message.includes('Failed to fetch')) {
                throw new Error(`Error de CORS: El navegador bloqueó la solicitud por políticas de seguridad. 
                Verifica que el backend tenga habilitado CORS para el origen ${window.location.origin}`);
            }
            // Mensaje específico para errores de certificado SSL
            else if (e.message.includes('SSL') || e.message.includes('certificate') ||
                e.message.includes('secure context')) {
                throw new Error(`Error de certificado SSL: Es posible que necesites aceptar el certificado visitando directamente ${this.baseUrl} en tu navegador o configurar tu aplicación para aceptar certificados autofirmados.`);
            } else {
                throw new Error(`No se pudieron obtener los hoteles: ${e.message}`);
            }
        }
    }

    async fetchHotelByOwner() {
        try {
            const token = this.getCleanToken();
            console.log('Obteniendo hotel por propietario. Token:', token ? 'Presente' : 'No encontrado');

            if (!token) {
                throw new Error('No se encontró token de autenticación o el token no es válido');
            }

            // Decodificar token para obtener el ID del propietario
            const ownerId = this.getOwnerIdFromToken(token);
            console.log('ID del propietario extraído del token:', ownerId);

            if (!ownerId) {
                throw new Error('No se pudo extraer el ID del propietario del token');
            }

            try {
                console.log('Intentando obtener todos los hoteles y filtrar por propietario ID:', ownerId);
                const allHotels = await this.fetchHotels();

                if (!Array.isArray(allHotels)) {
                    console.error('Respuesta inesperada de fetchHotels, no es un array:', allHotels);
                    throw new Error('Formato de respuesta inesperado al obtener hoteles');
                }

                console.log('Hoteles obtenidos:', allHotels);

                // Buscar el hotel que coincide con el ID del propietario
                const ownerHotel = allHotels.find(h => h.ownerId == ownerId);

                if (ownerHotel) {
                    console.log('Hotel encontrado por ID de propietario:', ownerHotel);
                    return ownerHotel;
                } else {
                    console.error('No se encontró hotel para el propietario ID:', ownerId);
                    throw new Error('No se encontró hotel para este propietario');
                }
            } catch (e) {
                console.error('Error al intentar obtener y filtrar hoteles:', e);
                throw e;
            }
        } catch (e) {
            console.error('Error general en fetchHotelByOwner:', e);
            throw e;
        }
    }

    // Método auxiliar para extraer el ownerId del token JWT
    getOwnerIdFromToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"];
        } catch (e) {
            console.error('Error decodificando token:', e);
            return null;
        }
    }

    // Método mejorado para obtener un token limpio y válido
    getCleanToken() {
        const token = localStorage.getItem('token');

        if (!token) {
            return null;
        }

        // Verificar si el token tiene formato correcto
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('El token no tiene el formato JWT válido (debe tener 3 partes separadas por puntos)');
            localStorage.removeItem('token'); // Limpiar token inválido
            return null;
        }

        // Verificar si el token no ha expirado
        try {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const exp = payload.exp;

            if (exp && exp < Math.floor(Date.now() / 1000)) {
                console.error('El token ha expirado');
                localStorage.removeItem('token'); // Limpiar token expirado
                return null;
            }

            return token;
        } catch (e) {
            console.error('Error al validar token:', e);
            localStorage.removeItem('token'); // Limpiar token inválido
            return null;
        }
    }

    async testConnection() {
        try {
            console.log('Probando conexión a:', this.baseUrl);
            const token = this.getCleanToken();

            if (!token) {
                return {
                    success: false,
                    message: 'No hay un token de autenticación válido disponible',
                    needsAuth: true
                };
            }

            // Intentar una solicitud simple
            const response = await fetch(`${this.baseUrl}/all`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });

            console.log('Respuesta del servidor:', response.status, response.statusText);

            if (response.status === 401) {
                localStorage.removeItem('token'); // Limpiar token inválido
                return {
                    success: false,
                    message: 'El servidor responde, pero el token de autenticación no es válido o ha expirado',
                    status: response.status,
                    needsAuth: true
                };
            }

            return {
                success: response.ok,
                message: response.ok ? 'Conexión exitosa' : `Error HTTP ${response.status}: ${response.statusText}`,
                status: response.status
            };
        } catch (e) {
            console.error('Error de conexión:', e);

            // Detectar errores comunes
            let message = e.message;
            if (e.message.includes('CORS')) {
                message = `Error de CORS: El servidor no permite solicitudes desde ${window.location.origin}. 
                           El backend debe configurar los encabezados CORS correctamente.`;
            } else if (e.message.includes('SSL') || e.message.includes('certificate')) {
                message = 'Error de certificado SSL. Para desarrollo local, visite ' +
                    this.baseUrl + ' en su navegador y acepte el certificado autofirmado.';
            } else if (e.message.includes('Failed to fetch')) {
                message = 'No se pudo conectar al servidor. Verifique que el backend esté en ejecución en ' +
                    this.baseUrl;
            }

            return {
                success: false,
                message: message,
                error: e
            };
        }
    }
}