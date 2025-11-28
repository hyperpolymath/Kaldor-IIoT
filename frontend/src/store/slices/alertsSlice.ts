import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Alert {
  id: number
  loom_id: string
  device_id: string
  alert_type: string
  severity: string
  value: number
  message: string
  acknowledged: boolean
  created_at: string
}

interface AlertsState {
  alerts: Alert[]
  unacknowledgedCount: number
  loading: boolean
}

const initialState: AlertsState = {
  alerts: [],
  unacknowledgedCount: 0,
  loading: false,
}

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setAlerts: (state, action: PayloadAction<Alert[]>) => {
      state.alerts = action.payload
      state.unacknowledgedCount = action.payload.filter(a => !a.acknowledged).length
      state.loading = false
    },
    addAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload)
      if (!action.payload.acknowledged) {
        state.unacknowledgedCount++
      }
    },
    acknowledgeAlert: (state, action: PayloadAction<number>) => {
      const alert = state.alerts.find(a => a.id === action.payload)
      if (alert && !alert.acknowledged) {
        alert.acknowledged = true
        state.unacknowledgedCount--
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setAlerts, addAlert, acknowledgeAlert, setLoading } = alertsSlice.actions
export default alertsSlice.reducer
