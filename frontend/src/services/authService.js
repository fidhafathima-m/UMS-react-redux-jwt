import api from './api'

const authService = {
    login: async(credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data
    },
    register: async(userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data
    },
    getCurrentUser: async() => {
        try {
            const response = await api.get('/auth/me');
            return response.data.user;
        } catch (error) {
            localStorage.removeItem('token');
            throw error;
        }
    }
}
export default authService;