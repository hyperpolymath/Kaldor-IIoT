import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import { connectWebSocket, disconnectWebSocket } from './services/websocket'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LoomDetail from './pages/LoomDetail'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && token) {
      connectWebSocket(token, dispatch)

      return () => {
        disconnectWebSocket()
      }
    }
  }, [isAuthenticated, token, dispatch])

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/loom/:id" element={<LoomDetail />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
