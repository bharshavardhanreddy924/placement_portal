import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
});

api.interceptors.request.use(config => {
    const role = localStorage.getItem('role') || 'student';
    config.headers['X-User'] = role;
    return config;
});

export default api;