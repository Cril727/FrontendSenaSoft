import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar el token en cada petición
apiClient.interceptors.request.use(config => {
    try {
        const authData = JSON.parse(localStorage.getItem('auth'));
        if (authData && authData.token) {
            config.headers.Authorization = `Bearer ${authData.token}`;
        }
    } catch (error) {
        console.error('Error reading token:', error);
    }
    return config;
});