import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import authService from '../services/authService'

export const loginUser = createAsyncThunk(
    'auth/login',
    async(credentials, {rejectWithValue}) => {
        try {
            const response = await authService.login(credentials)
            localStorage.setItem('token', response.token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
)

export const registerUser = createAsyncThunk(
    'auth/register',
    async(userData, {rejectWithValue}) => {
        try {
            const response = await authService.register(userData)
            localStorage.setItem('token', response.token);
            return response;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('token'),
        isLoading: false,
        error: null,
        isAuthenticated: !!localStorage.getItem('token')
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token')
            state.user = null
            state.token = null
            state.isAuthenticated = false
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload
        })
        .addCase(registerUser.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload
        })
    }
})
export const {logout, clearError} = authSlice.actions
export default authSlice.reducer