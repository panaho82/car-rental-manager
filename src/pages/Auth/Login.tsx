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
  Tabs,
  Tab,
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccessMessage('');
  };

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!companyName.trim()) {
        setError("Le nom de la société est requis.");
        setLoading(false);
        return;
    }

    try {
      // 1. Créer l'utilisateur Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
            data: {
                full_name: fullName,
            }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création du compte");

      // 2. Créer la société (Tenant)
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([
          { 
            name: companyName,
            email: regEmail, 
          }
        ])
        .select()
        .single();

      if (companyError) {
          console.error("Erreur création société:", companyError);
          throw new Error("Erreur lors de la création de la société. " + companyError.message);
      }

      // 3. Lier l'utilisateur à la société et le mettre admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
            company_id: companyData.id,
            role: 'admin',
            full_name: fullName
        })
        .eq('id', authData.user.id);

      if (profileError) {
          throw new Error("Erreur lors de la configuration du profil.");
      }

      setSuccessMessage("Compte et société créés avec succès ! Vous allez être redirigé...");
      
      setTimeout(() => {
          navigate('/');
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
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
        alignItems: 'flex-start', // Changé de center à flex-start pour permettre le scroll
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        overflowY: 'auto', // Autorise le scroll vertical global
        pt: 4,
        pb: 4
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
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <img 
              src={logo} 
              alt="Raiatea Rent Car Logo" 
              style={{ 
                width: '200px', // Réduit un peu la taille du logo
                height: 'auto',
                marginBottom: '0.5rem',
                maxWidth: '100%'
              }} 
            />
          </Box>
          
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 4 }, // Padding responsif
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
            <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="auth tabs" variant="fullWidth">
                <Tab label="Connexion" />
                <Tab label="Créer ma société" />
              </Tabs>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                {successMessage}
              </Alert>
            )}

            <TabPanel value={tabValue} index={0}>
                <Typography 
                  component="h2" 
                  variant="h5" 
                  gutterBottom
                  align="center"
                  sx={{
                    fontWeight: 500,
                    color: theme => theme.palette.text.primary
                  }}
                >
                  Espace Gérant
                </Typography>

                <Box 
                  component="form" 
                  onSubmit={handleLogin} 
                  sx={{ 
                    mt: 1, 
                    width: '100%',
                  }}
                >
                  <StyledTextField
                    margin="dense" // Réduit l'espacement
                    required
                    fullWidth
                    id="email"
                    label="Adresse email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <StyledTextField
                    margin="dense"
                    required
                    fullWidth
                    name="password"
                    label="Mot de passe"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      borderRadius: '8px',
                    }}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Typography 
                  component="h2" 
                  variant="h6" 
                  gutterBottom
                  align="center"
                  sx={{ mb: 2 }}
                >
                  Lancez votre activité
                </Typography>
                
                <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
                    <StyledTextField
                        margin="dense" // Réduit l'espacement
                        required
                        fullWidth
                        label="Nom de votre société"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Moorea Cars"
                        size="small" // Réduit la hauteur des champs
                    />
                    <StyledTextField
                        margin="dense"
                        required
                        fullWidth
                        label="Votre Nom Complet"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        size="small"
                    />
                    <StyledTextField
                        margin="dense"
                        required
                        fullWidth
                        label="Email professionnel"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        size="small"
                    />
                    <StyledTextField
                        margin="dense"
                        required
                        fullWidth
                        label="Mot de passe"
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        helperText="Min. 6 caractères"
                        size="small"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="secondary"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: '8px', fontWeight: 'bold' }}
                    >
                        {loading ? 'Création...' : 'Créer mon compte société'}
                    </Button>
                </Box>
            </TabPanel>

          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
