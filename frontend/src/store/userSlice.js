import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import userService from "../services/userService";
import { updateUser } from "./authSlice"; 

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, {rejectWithValue}) => {
        try {
            const response = await userService.getAllUsers()
            return response
        } catch (error) {
            return rejectWithValue(error.response.data.message)
        }
    }
)

export const updateUserProfile = createAsyncThunk(
    'users/updateProfile',
    async(formData, {rejectWithValue, dispatch}) => {
        try {
            const response = await userService.updateProfile(formData)
            
            dispatch(updateUser(response));
            
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Update failed')
        }
    }
)

const userSlice = createSlice({
    name: 'users',
    initialState: {
        users: [],
        currentUser: null,
        isLoading: false,
        error: null
    },
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
         .addCase(fetchUsers.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchUsers.fulfilled, (state, action) => {
            state.users = action.payload;
            state.isLoading = false;
        })
        .addCase(fetchUsers.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        .addCase(updateUserProfile.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(updateUserProfile.fulfilled, (state, action) => {
            state.currentUser = action.payload;
            state.isLoading = false;
        })
        .addCase(updateUserProfile.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });
    }
})

export const {setCurrentUser, clearError} = userSlice.actions
export default userSlice.reducer