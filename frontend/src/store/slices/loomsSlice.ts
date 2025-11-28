import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Loom {
  id: string
  name: string
  description: string
  location: string
  model: string
  status: string
  configuration: any
}

interface LoomsState {
  looms: Loom[]
  selectedLoom: Loom | null
  loading: boolean
  error: string | null
}

const initialState: LoomsState = {
  looms: [],
  selectedLoom: null,
  loading: false,
  error: null,
}

const loomsSlice = createSlice({
  name: 'looms',
  initialState,
  reducers: {
    setLooms: (state, action: PayloadAction<Loom[]>) => {
      state.looms = action.payload
      state.loading = false
    },
    setSelectedLoom: (state, action: PayloadAction<Loom>) => {
      state.selectedLoom = action.payload
    },
    updateLoomStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const loom = state.looms.find(l => l.id === action.payload.id)
      if (loom) {
        loom.status = action.payload.status
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const { setLooms, setSelectedLoom, updateLoomStatus, setLoading, setError } = loomsSlice.actions
export default loomsSlice.reducer
