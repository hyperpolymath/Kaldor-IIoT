import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  username: string
  email: string
  role: string
}

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token'),
  user: null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.isAuthenticated = true
      state.token = action.payload.token
      state.user = action.payload.user
      state.loading = false
      state.error = null
      localStorage.setItem('token', action.payload.token)
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.token = null
      state.user = null
      localStorage.removeItem('token')
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer
