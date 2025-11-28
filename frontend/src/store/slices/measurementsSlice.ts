import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Measurement {
  time: string
  loom_id: string
  bbw_avg: number
  bbw_min: number
  bbw_max: number
  bbw_stddev: number
  temperature: number
  vibration: number
  quality: number
}

interface MeasurementsState {
  measurements: Record<string, Measurement[]>
  realTimeData: Record<string, Measurement>
  loading: boolean
}

const initialState: MeasurementsState = {
  measurements: {},
  realTimeData: {},
  loading: false,
}

const measurementsSlice = createSlice({
  name: 'measurements',
  initialState,
  reducers: {
    setMeasurements: (state, action: PayloadAction<{ loomId: string; data: Measurement[] }>) => {
      state.measurements[action.payload.loomId] = action.payload.data
      state.loading = false
    },
    updateRealTimeData: (state, action: PayloadAction<{ loomId: string; data: Measurement }>) => {
      state.realTimeData[action.payload.loomId] = action.payload.data

      // Also add to measurements history (keep last 100 points)
      if (!state.measurements[action.payload.loomId]) {
        state.measurements[action.payload.loomId] = []
      }
      state.measurements[action.payload.loomId].unshift(action.payload.data)
      if (state.measurements[action.payload.loomId].length > 100) {
        state.measurements[action.payload.loomId].pop()
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setMeasurements, updateRealTimeData, setLoading } = measurementsSlice.actions
export default measurementsSlice.reducer
