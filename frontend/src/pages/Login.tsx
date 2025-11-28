import React, { useState } from 'react'
import { Box, Paper, TextField, Button, Typography, Container } from '@mui/material'
import { useAppDispatch } from '../hooks/redux'
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice'
import { authAPI } from '../services/api'
import { toast } from 'react-toastify'

const Login: React.FC = () => {
  const dispatch = useAppDispatch()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    dispatch(loginStart())

    try {
      const response = await authAPI.login(username, password)
      const { token, user } = response.data.data

      dispatch(loginSuccess({ token, user }))
      toast.success('Login successful!')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed'
      dispatch(loginFailure(message))
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Kaldor IIoT
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
            Loom Monitoring System
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
            Default credentials: admin / admin123
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
