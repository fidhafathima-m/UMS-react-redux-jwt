import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import authService from '../services/authService'
import api from '../services/api';

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

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
     
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      localStorage.removeItem('token'); 
      return rejectWithValue(error.response?.data?.message || 'Invalid token');
    }
  }
);

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
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        setUser: (state, action) => {
    state.user = action.payload;
  },
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
        .addCase(fetchUserProfile.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchUserProfile.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
        })
        .addCase(fetchUserProfile.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        });
    }
})

export const {logout, clearError, updateUser} = authSlice.actions
export default authSlice.reducer