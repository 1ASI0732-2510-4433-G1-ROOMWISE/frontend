// AuthManager.js - Un gestor centralizado para el manejo de la autenticación
import { jwtDecode } from 'jwt-decode';

export class AuthManager {
    static isLoggedIn() {
        return !!this.getValidToken();
    }

    static getValidToken() {
        const token = localStorage.getItem('token');

        if (!token) {
            return null;
        }

        try {
            // Verificar formato básico del token (3 partes separadas por puntos)
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.warn('Token con formato inválido');
                this.logout();
                return null;
            }

            // Decodificar y verificar expiración
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decodedToken.exp && decodedToken.exp < currentTime) {
                console.warn('Token expirado');
                this.logout();
                return null;
            }

            return token;
        } catch (e) {
            console.error('Error al validar token:', e);
            this.logout();
            return null;
        }
    }

    static getUserRole() {
        const token = this.getValidToken();
        if (!token) return null;

        try {
            const decodedToken = jwtDecode(token);
            return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        } catch (e) {
            console.error('Error al obtener rol de usuario:', e);
            return null;
        }
    }

    static getUserId() {
        const token = this.getValidToken();
        if (!token) return null;

        try {
            const decodedToken = jwtDecode(token);
            return decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];
        } catch (e) {
            console.error('Error al obtener ID de usuario:', e);
            return null;
        }
    }

    static getDecodedToken() {
        const token = this.getValidToken();
        if (!token) return null;

        try {
            return jwtDecode(token);
        } catch (e) {
            console.error('Error al decodificar token:', e);
            return null;
        }
    }

    static logout() {
        localStorage.removeItem('token');
        // Si tienes otras informaciones de sesión, límpialas aquí
    }

    static setToken(token) {
        // Validar el token antes de guardarlo
        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decodedToken.exp && decodedToken.exp < currentTime) {
                console.error('Intento de guardar un token ya expirado');
                return false;
            }

            localStorage.setItem('token', token);
            return true;
        } catch (e) {
            console.error('Error al guardar token:', e);
            return false;
        }
    }

    // Determina si el usuario debe ser redirigido a la página de login
    static shouldRedirectToLogin() {
        return !this.isLoggedIn();
    }

    // Verifica si el usuario tiene un rol específico
    static hasRole(role) {
        const userRole = this.getUserRole();
        return userRole === role;
    }
}