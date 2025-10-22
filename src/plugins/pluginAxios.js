import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para agregar el token a cada petición
apiClient.interceptors.request.use(
    (config) => {
        // Obtener el token del localStorage en cada petición
        const authData = JSON.parse(localStorage.getItem('auth') || '{}');
        const token = authData.token;
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Si el token es inválido o expiró (401), limpiar la autenticación
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth');
            // Redirigir al login si es necesario
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);