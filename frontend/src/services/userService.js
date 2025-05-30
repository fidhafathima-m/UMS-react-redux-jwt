import api from "./api";

const userService = {
    getAllUsers: async () => {
        const response = await api.get('/users')
        return response.data
    },
    getUserById: async(id) => {
        const response = await api.get(`/users/${id}`)
        return response.data
    },
    updateProfile: async(formData) => {
        const response = await api.get('/users/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    },
    deleteUser: async(id) => {
        const response = await api.delete(`/users/${id}`)
        return response.data
    },
    createUser: async(userData) => {
        const response = await api.delete(`/users`, userData)
        return response.data
    },
    searchUsers: async(query) => {
        const response = await api.delete(`/users/search?q=${query}`)
        return response.data
    },
}
export default userService;