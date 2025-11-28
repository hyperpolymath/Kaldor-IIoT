import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import loomsReducer from './slices/loomsSlice'
import alertsReducer from './slices/alertsSlice'
import measurementsReducer from './slices/measurementsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    looms: loomsReducer,
    alerts: alertsReducer,
    measurements: measurementsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
