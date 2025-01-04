import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles';
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Auth/Login'
import { VehiclesPage } from './pages/Vehicles/VehiclesPage'
import CalendarPage from './pages/Calendar'
import { ReservationsPage } from './pages/Reservations/ReservationsPage'
import { ClientsPage } from './pages/Clients/ClientsPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Box, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import fr from 'date-fns/locale/fr';
import BungalowsPage from './pages/Bungalows/BungalowsPage'
import DocumentsPage from './pages/Documents/DocumentsPage'
import { theme } from './theme/theme';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Chargement...
    </Box>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
        <AuthProvider>
          <BrowserRouter>
            <CssBaseline />
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="vehicles" element={<VehiclesPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="reservations" element={<ReservationsPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="bungalows" element={<BungalowsPage />} />
                <Route path="documents" element={<DocumentsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
