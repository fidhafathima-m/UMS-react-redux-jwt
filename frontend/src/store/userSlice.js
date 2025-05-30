import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import userService from "../services/userService";

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
    async(formData, {rejectWithValue}) => {
        try {
            const response = await userService.updateProfile(formData)
            return response
        } catch (error) {
            return rejectWithValue(error.response.data.message)
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
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchUsers.fulfilled, (state, action) => {
            state.users = action.payload,
            state.isLoading = false
        })
        .addCase(updateUserProfile.fulfilled, (state, action) => {
            state.currentUser = action.payload,
            state.isLoading = false
        })
    }
})

export const {setCurrentUser} = userSlice.actions
export default userSlice.reducer