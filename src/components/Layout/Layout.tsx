import { Box, CssBaseline, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { Menu as MenuIcon, Dashboard, CalendarMonth, BookOnline, People, DirectionsCar, House, Logout } from '@mui/icons-material';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.svg';

const drawerWidth = 240;
const drawerCollapsedWidth = 65;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Calendrier', icon: <CalendarMonth />, path: '/calendar' },
  { text: 'Réservations', icon: <BookOnline />, path: '/reservations' },
  { text: 'Clients', icon: <People />, path: '/clients' },
  { text: 'Véhicules', icon: <DirectionsCar />, path: '/vehicles' },
  { text: 'Bungalows', icon: <House />, path: '/bungalows' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const drawer = (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        overflow: 'hidden',
        transition: 'width 0.2s ease-in-out',
        width: isExpanded ? drawerWidth : drawerCollapsedWidth,
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        py: 2,
        minHeight: '64px',
        overflow: 'hidden'
      }}>
        <img 
          src={logo} 
          alt="Raiatea Rent Car Logo" 
          style={{ 
            width: isExpanded ? '150px' : '40px',
            transition: 'width 0.2s ease-in-out',
            objectFit: 'contain'
          }} 
        />
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => navigate(item.path)}
            sx={{
              justifyContent: isExpanded ? 'flex-start' : 'center',
              px: isExpanded ? 2 : 1
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: isExpanded ? 40 : 'auto',
              mr: isExpanded ? 2 : 'auto',
              justifyContent: 'center'
            }}>
              {item.icon}
            </ListItemIcon>
            {isExpanded && <ListItemText primary={item.text} />}
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          sx={{ mt: 'auto', mb: 2, width: '100%', justifyContent: isExpanded ? 'flex-start' : 'center', color: 'inherit' }}
          startIcon={<Logout />}
          onClick={handleSignOut}
        >
          {isExpanded && 'Déconnexion'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ 
          width: { sm: `calc(100% - ${isExpanded ? drawerWidth : drawerCollapsedWidth}px)` }, 
          ml: { sm: isExpanded ? `${drawerWidth}px` : `${drawerCollapsedWidth}px` },
          bgcolor: 'primary.main',
          transition: 'width 0.2s ease-in-out, margin-left 0.2s ease-in-out'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Raiatea Rent Car
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { sm: isExpanded ? drawerWidth : drawerCollapsedWidth },
          flexShrink: { sm: 0 },
          transition: 'width 0.2s ease-in-out'
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box',
              width: isExpanded ? drawerWidth : drawerCollapsedWidth,
              transition: 'width 0.2s ease-in-out',
              overflowX: 'hidden'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${isExpanded ? drawerWidth : drawerCollapsedWidth}px)` },
          transition: 'width 0.2s ease-in-out',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar />
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
