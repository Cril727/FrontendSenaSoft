import axios from 'axios';

const token = JSON.parse(localStorage.getItem('auth'))  || '';

export const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        "x-token": token.token
    }
});