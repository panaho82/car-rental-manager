import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tab,
  Tabs,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import { useSupabase } from '../../hooks/useSupabase';
import { ClientForm } from './ClientForm';

interface Client {
  id: string;
  civility?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile_phone?: string;
  created_at: string;
}

interface Reservation {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  vehicle_name?: string;
  bungalow_name?: string;
}

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
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { fetchMany, deleteOne, fetchOne } = useSupabase();

  const loadClients = async () => {
    const data = await fetchMany<Client>('clients');
    setClients(data);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleDelete = async (client: Client) => {
    setSelectedClient(client);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedClient) {
      await deleteOne('clients', selectedClient.id);
      await loadClients();
      setIsDeleteConfirmOpen(false);
      setSelectedClient(null);
    }
  };

  const handleViewHistory = async (client: Client) => {
    // Charger les réservations du client
    const reservations = await fetchMany<Reservation>('reservations', {
      filters: { client_id: client.id },
      joins: [
        { table: 'vehicles', fields: ['brand', 'model'] },
        { table: 'bungalows', fields: ['name'] }
      ]
    });
    setReservations(reservations);
    setIsHistoryOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedClient(null);
    loadClients();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Liste des clients" />
          <Tab label="Nouveau client" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.last_name}</TableCell>
                  <TableCell>{client.first_name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.mobile_phone}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(client)} title="Modifier">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleViewHistory(client)} title="Historique">
                      <HistoryIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(client)} title="Supprimer">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ClientForm onSuccess={() => setTabValue(0)} />
      </TabPanel>

      {/* Dialog de modification */}
      <Dialog
        open={isFormOpen}
        onClose={handleFormClose}
        maxWidth="md"
        fullWidth
      >
        <ClientForm
          client={selectedClient}
          onSuccess={handleFormClose}
        />
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Confirmer la suppression
          </Typography>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce client ?
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setIsDeleteConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              variant="contained"
              color="error"
            >
              Supprimer
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Dialog d'historique */}
      <Dialog
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Historique des locations
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date début</TableCell>
                  <TableCell>Date fin</TableCell>
                  <TableCell>Véhicule/Bungalow</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      {new Date(reservation.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(reservation.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {reservation.vehicle_name || reservation.bungalow_name}
                    </TableCell>
                    <TableCell>{reservation.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsHistoryOpen(false)}>
              Fermer
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};
