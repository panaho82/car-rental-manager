import { Box, Button, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../../hooks/useSupabase';
import { Link, useLocation } from 'react-router-dom';
import { Description as DocumentIcon } from '@mui/icons-material';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { signOut } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Calendrier', icon: <MenuIcon />, path: '/calendar' },
    { text: 'Réservations', icon: <MenuIcon />, path: '/reservations' },
    { text: 'Documents', icon: <DocumentIcon />, path: '/documents' },
    { text: 'Clients', icon: <MenuIcon />, path: '/clients' },
    { text: 'Véhicules', icon: <MenuIcon />, path: '/vehicles' },
    { text: 'Bungalows', icon: <MenuIcon />, path: '/bungalows' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Raiatea Location
          </Typography>
          {menuItems.map((item) => (
            <Link key={item.text} to={item.path} style={{ color: 'white', textDecoration: 'none' }}>
              <Button
                variant="text"
                color="inherit"
                startIcon={item.icon}
                sx={{ mr: 2 }}
              >
                {item.text}
              </Button>
            </Link>
          ))}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
      
      {/* Bouton de déconnexion en bas à gauche */}
      <Box sx={{ 
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 1000
      }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<LogoutIcon />}
          onClick={() => {
            signOut();
            navigate('/login');
          }}
        >
          Déconnexion
        </Button>
      </Box>
    </Box>
  );
};
