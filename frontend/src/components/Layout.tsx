import React from 'react'
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Badge } from '@mui/material'
import { Menu as MenuIcon, Dashboard, ViewList, Warning, Analytics, Settings, ExitToApp } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { logout } from '../store/slices/authSlice'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { unacknowledgedCount } = useAppSelector((state) => state.alerts)

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Looms', icon: <ViewList />, path: '/looms' },
    { text: 'Alerts', icon: <Badge badgeContent={unacknowledgedCount} color="error"><Warning /></Badge>, path: '/alerts' },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ]

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Kaldor IIoT
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, mt: 8 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} onClick={() => { navigate(item.path); setDrawerOpen(false); }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  )
}

export default Layout
