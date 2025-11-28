import React, { useEffect } from 'react'
import { Grid, Paper, Typography, Box, Card, CardContent, Chip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { setLooms, setLoading } from '../store/slices/loomsSlice'
import { loomsAPI, analyticsAPI } from '../services/api'
import { WarningAmber, CheckCircle, Error } from '@mui/icons-material'

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { looms, loading } = useAppSelector((state) => state.looms)
  const { unacknowledgedCount } = useAppSelector((state) => state.alerts)

  useEffect(() => {
    loadLooms()
  }, [])

  const loadLooms = async () => {
    dispatch(setLoading(true))
    try {
      const response = await loomsAPI.getAll()
      dispatch(setLooms(response.data.data))
    } catch (error) {
      console.error('Failed to load looms:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle color="success" />
      case 'warning':
        return <WarningAmber color="warning" />
      case 'error':
        return <Error color="error" />
      default:
        return <Error color="disabled" />
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              Total Looms
            </Typography>
            <Typography variant="h4">{looms.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              Active Looms
            </Typography>
            <Typography variant="h4" color="success.main">
              {looms.filter(l => l.status === 'active').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              Alerts
            </Typography>
            <Typography variant="h4" color="warning.main">
              {unacknowledgedCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              System Health
            </Typography>
            <Typography variant="h4" color="success.main">
              98%
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        Looms
      </Typography>

      <Grid container spacing={2}>
        {looms.map((loom) => (
          <Grid item xs={12} sm={6} md={4} key={loom.id}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
              onClick={() => navigate(`/loom/${loom.id}`)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">{loom.name}</Typography>
                  {getStatusIcon(loom.status)}
                </Box>
                <Typography color="textSecondary" variant="body2" gutterBottom>
                  {loom.location}
                </Typography>
                <Typography variant="body2">{loom.model}</Typography>
                <Box mt={1}>
                  <Chip
                    label={loom.status}
                    color={loom.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Dashboard
