import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  TextField,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useSupabase } from '../../hooks/useSupabase';
import { ClientForm } from '../../components/Clients/ClientForm';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_phone: string;
  country: string;
  address: string;
  postal_code: string;
  comments: string;
}

interface Reservation {
  id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  vehicle_id: string | null;
  bungalow_id: string | null;
  vehicle?: {
    brand: string;
    model: string;
    license_plate: string;
  };
  bungalow?: {
    name: string;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index } = props;
  return (
    <Box hidden={value !== index} sx={{ pt: 2 }}>
      {value === index && children}
    </Box>
  );
};

export const ClientsPage = () => {
  const { supabase } = useSupabase();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientHistory, setClientHistory] = useState<Reservation[]>([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const loadClientHistory = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          vehicle:vehicles(brand, model, license_plate),
          bungalow:bungalows(name)
        `)
        .eq('client_id', clientId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setClientHistory(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  const handleDelete = async (client: Client) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', client.id);

        if (error) throw error;
        await loadClients();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const filteredClients = clients.filter(client => {
    const searchStr = searchTerm.toLowerCase();
    return (
      client.last_name?.toLowerCase().includes(searchStr) ||
      client.first_name?.toLowerCase().includes(searchStr) ||
      client.email?.toLowerCase().includes(searchStr) ||
      client.mobile_phone?.includes(searchStr)
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XPF';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Clients</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedClient(null);
            setOpenForm(true);
          }}
        >
          Nouveau Client
        </Button>
      </Box>

      {/* Barre de recherche */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Rechercher un client..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
      />

      {/* Liste des clients */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Pays</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.last_name}</TableCell>
                  <TableCell>{client.first_name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.mobile_phone}</TableCell>
                  <TableCell>{client.country}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Historique">
                      <IconButton
                        onClick={() => {
                          setSelectedClient(client);
                          loadClientHistory(client.id);
                          setOpenHistory(true);
                        }}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton
                        onClick={() => {
                          setSelectedClient(client);
                          setOpenForm(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        onClick={() => handleDelete(client)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog du formulaire client */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <ClientForm
            client={selectedClient || undefined}
            onSuccess={() => {
              setOpenForm(false);
              loadClients();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de l'historique client */}
      <Dialog
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Historique - {selectedClient?.first_name} {selectedClient?.last_name}
          </Typography>
          
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Réservations" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Montant</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Aucune réservation trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientHistory.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          {formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}
                        </TableCell>
                        <TableCell>
                          {reservation.vehicle && (
                            <div>
                              Véhicule: {reservation.vehicle.brand} {reservation.vehicle.model} ({reservation.vehicle.license_plate})
                            </div>
                          )}
                          {reservation.bungalow && (
                            <div>
                              Bungalow: {reservation.bungalow.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{reservation.status}</TableCell>
                        <TableCell align="right">
                          {formatAmount(reservation.total_amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
