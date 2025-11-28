import { io, Socket } from 'socket.io-client'
import { AppDispatch } from '../store'
import { addAlert } from '../store/slices/alertsSlice'
import { updateRealTimeData } from '../store/slices/measurementsSlice'
import { updateLoomStatus } from '../store/slices/loomsSlice'
import { toast } from 'react-toastify'

let socket: Socket | null = null

export const connectWebSocket = (token: string, dispatch: AppDispatch) => {
  socket = io('http://localhost:3000', {
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    console.log('WebSocket connected')
    socket?.emit('authenticate', token)
  })

  socket.on('authenticated', (data) => {
    if (data.success) {
      console.log('WebSocket authenticated')
    } else {
      console.error('WebSocket authentication failed')
      socket?.disconnect()
    }
  })

  socket.on('measurement:update', (data) => {
    dispatch(updateRealTimeData({
      loomId: data.loom_id,
      data: {
        time: new Date().toISOString(),
        loom_id: data.loom_id,
        ...data.measurements,
      },
    }))
  })

  socket.on('alert:new', (data) => {
    dispatch(addAlert(data))
    toast.warning(`New alert: ${data.alert_type}`, {
      position: 'top-right',
      autoClose: 5000,
    })
  })

  socket.on('status:change', (data) => {
    dispatch(updateLoomStatus({
      id: data.loom_id,
      status: data.status,
    }))
  })

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected')
  })

  socket.on('error', (error) => {
    console.error('WebSocket error:', error)
  })

  return socket
}

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const subscribeTo Loom = (loomId: string) => {
  socket?.emit('subscribe:loom', loomId)
}

export const unsubscribeFromLoom = (loomId: string) => {
  socket?.emit('unsubscribe:loom', loomId)
}

export default socket
