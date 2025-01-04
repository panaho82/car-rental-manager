import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Receipt as ReceiptIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useSupabase } from '../../hooks/useSupabase';
import { ReservationForm } from '../../components/Reservations/ReservationForm';
import { DocumentForm } from '../../components/Documents/DocumentForm';
import { formatCurrency } from '../../lib/formatUtils';

interface Reservation {
  id: string;
  client_id: string;
  vehicle_id: string | null;
  bungalow_id: string | null;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  client?: {
    first_name: string;
    last_name: string;
    email: string;
    address: string;
    postal_code: string;
    country: string;
  };
  vehicle?: {
    brand: string;
    model: string;
    license_plate: string;
  };
  bungalow?: {
    name: string;
  };
}

export const ReservationsPage = () => {
  const { supabase } = useSupabase();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDocument, setOpenDocument] = useState(false);
  const [documentType, setDocumentType] = useState<'quote' | 'invoice'>('quote');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          client:clients(first_name, last_name, email, address, postal_code, country),
          vehicle:vehicles(brand, model, license_plate),
          bungalow:bungalows(name)
        `)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setError('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reservation: Reservation) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('reservations')
          .delete()
          .eq('id', reservation.id);

        if (error) throw error;
        await loadReservations();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, reservation: Reservation) => {
    setAnchorEl(event.currentTarget);
    setSelectedReservation(reservation);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCreateDocument = (type: 'quote' | 'invoice') => {
    setDocumentType(type);
    setOpenDocument(true);
    handleCloseMenu();
  };

  const filteredReservations = reservations.filter(reservation => {
    const searchStr = searchTerm.toLowerCase();
    return (
      reservation.client?.last_name?.toLowerCase().includes(searchStr) ||
      reservation.client?.first_name?.toLowerCase().includes(searchStr) ||
      reservation.vehicle?.license_plate?.toLowerCase().includes(searchStr) ||
      reservation.bungalow?.name?.toLowerCase().includes(searchStr)
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Réservations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedReservation(null);
            setOpenForm(true);
          }}
        >
          Nouvelle Réservation
        </Button>
      </Box>

      {/* Barre de recherche */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Rechercher une réservation..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
      />

      {/* Liste des réservations */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Montant</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucune réservation trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    {reservation.client?.last_name} {reservation.client?.first_name}
                  </TableCell>
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
                    {formatCurrency(reservation.total_amount)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Modifier">
                      <IconButton
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setOpenForm(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Documents">
                      <IconButton onClick={(e) => handleOpenMenu(e, reservation)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        onClick={() => handleDelete(reservation)}
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

      {/* Menu des documents */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleCreateDocument('quote')}>
          <DescriptionIcon sx={{ mr: 1 }} />
          Créer un devis
        </MenuItem>
        <MenuItem onClick={() => handleCreateDocument('invoice')}>
          <ReceiptIcon sx={{ mr: 1 }} />
          Créer une facture
        </MenuItem>
      </Menu>

      {/* Dialog du formulaire de réservation */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <ReservationForm
            initialData={selectedReservation || undefined}
            onSuccess={() => {
              setOpenForm(false);
              loadReservations();
            }}
            onClose={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog du formulaire de document */}
      <Dialog
        open={openDocument}
        onClose={() => setOpenDocument(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedReservation && (
            <DocumentForm
              reservation={selectedReservation}
              type={documentType}
              onSuccess={() => {
                setOpenDocument(false);
                loadReservations();
              }}
              onClose={() => setOpenDocument(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
