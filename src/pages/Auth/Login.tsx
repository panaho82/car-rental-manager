import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CssBaseline,
  styled,
} from '@mui/material';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/logo.svg';

// Style personnalisé pour les champs de texte
const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: '#ffffff !important',
    '&.Mui-focused': {
      backgroundColor: '#ffffff !important',
    },
    '&:hover': {
      backgroundColor: '#ffffff !important',
    },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#FFD700',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
    },
  },
});

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        navigate('/');
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <CssBaseline />
      <Container 
        maxWidth="xs"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <img 
              src={logo} 
              alt="Raiatea Rent Car Logo" 
              style={{ 
                width: '250px',
                height: 'auto',
                marginBottom: '1rem',
                maxWidth: '100%'
              }} 
            />
          </Box>
          
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              maxWidth: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'white',
              borderRadius: 2,
              mx: 'auto',
            }}
          >
            <Typography 
              component="h2" 
              variant="h5" 
              gutterBottom
              sx={{
                fontWeight: 500,
                color: theme => theme.palette.text.primary
              }}
            >
              Connexion
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box 
              component="form" 
              onSubmit={handleLogin} 
              sx={{ 
                mt: 1, 
                width: '100%',
              }}
            >
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Adresse email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <StyledTextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: '8px',
                }}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
