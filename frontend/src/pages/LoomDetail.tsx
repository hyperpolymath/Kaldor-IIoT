import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAppSelector } from '../hooks/redux'
import { subscribeTo, unsubscribeFromLoom } from '../services/websocket'
import { measurementsAPI } from '../services/api'

const LoomDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [historicalData, setHistoricalData] = useState([])
  const realTimeData = useAppSelector((state) => state.measurements.realTimeData[id || ''])

  useEffect(() => {
    if (id) {
      subscribeTo(id)
      loadHistoricalData()
    }

    return () => {
      if (id) unsubscribeFromLoom(id)
    }
  }, [id])

  const loadHistoricalData = async () => {
    try {
      const response = await measurementsAPI.get(id!)
      setHistoricalData(response.data.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Loom {id}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">BBW (Current)</Typography>
              <Typography variant="h4">{realTimeData?.bbw_avg?.toFixed(2) || '--'} mm</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">Temperature</Typography>
              <Typography variant="h4">{realTimeData?.temperature?.toFixed(1) || '--'} °C</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">Vibration</Typography>
              <Typography variant="h4">{realTimeData?.vibration?.toFixed(2) || '--'} g</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">Quality</Typography>
              <Typography variant="h4">{realTimeData?.quality || '--'}%</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>BBW Trend (Last 24 Hours)</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bbw_avg" stroke="#8884d8" name="Average BBW" />
                <Line type="monotone" dataKey="bbw_min" stroke="#82ca9d" name="Min BBW" />
                <Line type="monotone" dataKey="bbw_max" stroke="#ffc658" name="Max BBW" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default LoomDetail
