import React, { useEffect } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, Chip } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { setAlerts, acknowledgeAlert as acknowledgeAlertAction } from '../store/slices/alertsSlice'
import { alertsAPI } from '../services/api'
import { toast } from 'react-toastify'

const Alerts: React.FC = () => {
  const dispatch = useAppDispatch()
  const { alerts } = useAppSelector((state) => state.alerts)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      const response = await alertsAPI.getAll()
      dispatch(setAlerts(response.data.data))
    } catch (error) {
      console.error('Failed to load alerts:', error)
    }
  }

  const handleAcknowledge = async (alertId: number) => {
    try {
      await alertsAPI.acknowledge(alertId)
      dispatch(acknowledgeAlertAction(alertId))
      toast.success('Alert acknowledged')
    } catch (error) {
      toast.error('Failed to acknowledge alert')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error'
      case 'warning': return 'warning'
      case 'info': return 'info'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Alerts
      </Typography>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Loom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{new Date(alert.created_at).toLocaleString()}</TableCell>
                <TableCell>{alert.loom_id}</TableCell>
                <TableCell>{alert.alert_type}</TableCell>
                <TableCell>
                  <Chip label={alert.severity} color={getSeverityColor(alert.severity)} size="small" />
                </TableCell>
                <TableCell>{alert.value}</TableCell>
                <TableCell>
                  {alert.acknowledged ? (
                    <Chip label="Acknowledged" color="success" size="small" />
                  ) : (
                    <Chip label="New" color="error" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  {!alert.acknowledged && (
                    <Button size="small" variant="contained" onClick={() => handleAcknowledge(alert.id)}>
                      Acknowledge
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}

export default Alerts
