// RoomService.js
const API_BASE_URL = 'https://localhost:7138/api'; // Ajusta según tu configuración

class RoomService {
    // Método para obtener el token de autenticación
    static getAuthToken() {
        return localStorage.getItem('token') ||
            localStorage.getItem('authToken') ||
            sessionStorage.getItem('authToken') ||
            sessionStorage.getItem('token');
    }

    // Método para crear headers con autenticación
    static getAuthHeaders() {
        const token = this.getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            'accept': '*/*'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    // Obtener todas las habitaciones de un hotel
    static async getAllRooms(hotelId) {
        try {
            const url = `${API_BASE_URL}/rooms/get-all-rooms?hotelId=${hotelId}`;

            console.log('Llamando a:', url);
            console.log('Headers:', this.getAuthHeaders());

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Token de autenticación inválido o expirado');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rooms = await response.json();
            console.log('Habitaciones recibidas:', rooms);

            // Mapear roomState a status para compatibilidad con el frontend
            const mappedRooms = rooms.map(room => ({
                ...room,
                status: this.mapRoomState(room.roomState)
            }));

            return mappedRooms;
        } catch (error) {
            console.error('Error en getAllRooms:', error);
            throw {
                friendlyMessage: error.message || 'Error al obtener las habitaciones',
                originalError: error
            };
        }
    }

    // Mapear roomState de la API a status para el frontend
    static mapRoomState(roomState) {
        const stateMap = {
            'LIBRE': 'Disponible',
            'OCUPADA': 'Ocupada',
            'MANTENIMIENTO': 'Mantenimiento',
            'LIMPIEZA': 'Limpieza'
        };

        return stateMap[roomState] || 'Disponible';
    }

    // Crear una nueva habitación
    static async createRoom(roomData) {
        try {
            const url = `${API_BASE_URL}/rooms/create-room`;

            const response = await fetch(url, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(roomData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Token de autenticación inválido o expirado');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Error desconocido'}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error en createRoom:', error);
            throw {
                friendlyMessage: error.message || 'Error al crear la habitación',
                originalError: error
            };
        }
    }

    // Obtener detalles de una habitación específica
    static async getRoomById(roomId) {
        try {
            const url = `${API_BASE_URL}/rooms/${roomId}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Token de autenticación inválido o expirado');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const room = await response.json();
            return room;
        } catch (error) {
            console.error('Error en getRoomById:', error);
            throw {
                friendlyMessage: error.message || 'Error al obtener los detalles de la habitación',
                originalError: error
            };
        }
    }

    // Actualizar una habitación
    static async updateRoom(roomId, roomData) {
        try {
            const url = `${API_BASE_URL}/rooms/${roomId}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(roomData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Token de autenticación inválido o expirado');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Error desconocido'}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error en updateRoom:', error);
            throw {
                friendlyMessage: error.message || 'Error al actualizar la habitación',
                originalError: error
            };
        }
    }

    // Eliminar una habitación
    static async deleteRoom(roomId) {
        try {
            const url = `${API_BASE_URL}/rooms/${roomId}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Token de autenticación inválido o expirado');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error en deleteRoom:', error);
            throw {
                friendlyMessage: error.message || 'Error al eliminar la habitación',
                originalError: error
            };
        }
    }
}

export default RoomService;