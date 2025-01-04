import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Divider,
  Tooltip,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  Print as PrintIcon,
  FileCopy as FileCopyIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useSupabase } from '../../hooks/useSupabase';
import { formatCurrency } from '../../lib/formatUtils';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  license_plate: string;
  daily_rate: number;
  status: string;
}

interface Bungalow {
  id: string;
  name: string;
  daily_rate: number;
  status: string;
}

interface Reservation {
  id?: string;
  client_id: string;
  vehicle_id?: string;
  bungalow_id?: string;
  start_date: Date;
  end_date: Date;
  status: string;
  total_amount: number;
  deposit_amount?: number;
  notes?: string;
  source?: string;
  file_number?: string;
  is_simulation?: boolean;
  adults?: number;
  children?: number;
  check_in_time?: string;
  check_out_time?: string;
  rate_per_night?: number;
  tax_rate?: number;
  commission_rate?: number;
  commission_type?: string;
  commission_amount?: number;
  subtotal?: number;
  tax_amount?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index } = props;
  return (
    <Box hidden={value !== index} sx={{ pt: 2 }}>
      {value === index && children}
    </Box>
  );
};

interface ReservationFormProps {
  initialData?: Reservation;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const ReservationForm = ({ initialData, onClose, onSuccess }: ReservationFormProps) => {
  const { supabase } = useSupabase();
  const [tabValue, setTabValue] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bungalows, setBungalows] = useState<Bungalow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Reservation>({
    client_id: '',
    source: 'Site WEB',
    file_number: '',
    status: 'confirmed',
    commission_type: 'to_refund',
    is_simulation: false,
    adults: 2,
    children: 0,
    start_date: new Date(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 1)),
    check_in_time: '08:00',
    check_out_time: '08:00',
    rate_per_night: 0,
    tax_rate: 0,
    commission_rate: 0,
    commission_amount: 0,
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0
  });

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialData && initialData.client_id) {
      const client = clients.find(c => c.id === initialData.client_id);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [initialData, clients]);

  useEffect(() => {
    calculateTotals();
  }, [formData.start_date, formData.end_date, formData.vehicle_id, formData.bungalow_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [{ data: clientsData }, { data: vehiclesData }, { data: bungalowsData }] = await Promise.all([
        supabase.from('clients').select('*').order('last_name'),
        supabase.from('vehicles').select('*').eq('status', 'available'),
        supabase.from('bungalows').select('*').eq('status', 'available')
      ]);

      setClients(clientsData || []);
      setVehicles(vehiclesData || []);
      setBungalows(bungalowsData || []);

      if (initialData) {
        setFormData({
          ...initialData,
          start_date: new Date(initialData.start_date),
          end_date: new Date(initialData.end_date)
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const days = Math.ceil(
      (formData.end_date.getTime() - formData.start_date.getTime()) / (1000 * 60 * 60 * 24)
    );

    let total = 0;

    // Calculer le coût du véhicule
    if (formData.vehicle_id) {
      const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
      if (vehicle) {
        total += vehicle.daily_rate * days;
      }
    }

    // Calculer le coût du bungalow
    if (formData.bungalow_id) {
      const bungalow = bungalows.find(b => b.id === formData.bungalow_id);
      if (bungalow) {
        total += bungalow.daily_rate * days;
      }
    }

    const subtotal = total;
    const taxAmount = subtotal * (formData.tax_rate || 0) / 100;
    const commissionAmount = subtotal * (formData.commission_rate || 0) / 100;

    setFormData(prev => ({
      ...prev,
      rate_per_night: total / days,
      subtotal,
      tax_amount: taxAmount,
      commission_amount: commissionAmount,
      total_amount: subtotal + taxAmount
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Vérifier que le client est sélectionné
      if (!formData.client_id) {
        setError('Veuillez sélectionner un client');
        setLoading(false);
        return;
      }

      // Vérifier qu'au moins un véhicule ou un bungalow est sélectionné
      if (!formData.vehicle_id && !formData.bungalow_id) {
        setError('Veuillez sélectionner un véhicule ou un bungalow');
        setLoading(false);
        return;
      }

      const reservationData = {
        client_id: formData.client_id,
        vehicle_id: formData.vehicle_id || null,
        bungalow_id: formData.bungalow_id || null,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString(),
        status: formData.status || 'confirmed',
        total_amount: formData.total_amount || 0,
        deposit_amount: formData.deposit_amount || null,
        notes: formData.notes || null,
        source: formData.source || null,
        file_number: formData.file_number || null,
        is_simulation: formData.is_simulation || false,
        adults: formData.adults || null,
        children: formData.children || null,
        check_in_time: formData.check_in_time || null,
        check_out_time: formData.check_out_time || null,
        rate_per_night: formData.rate_per_night || null,
        tax_rate: formData.tax_rate || null,
        commission_rate: formData.commission_rate || null,
        commission_type: formData.commission_type || null,
        commission_amount: formData.commission_amount || null,
        subtotal: formData.subtotal || null,
        tax_amount: formData.tax_amount || null
      };

      console.log('Données de réservation à enregistrer:', reservationData);

      let result;
      if (initialData?.id) {
        console.log('Mise à jour de la réservation:', initialData.id);
        result = await supabase
          .from('reservations')
          .update(reservationData)
          .eq('id', initialData.id)
          .select();
      } else {
        console.log('Création d\'une nouvelle réservation');
        result = await supabase
          .from('reservations')
          .insert([reservationData])
          .select();
      }

      console.log('Résultat de l\'opération:', result);

      if (result.error) {
        console.error('Erreur détaillée:', result.error);
        throw result.error;
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      setError('Erreur lors de l\'enregistrement de la réservation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 800, margin: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">
          {initialData ? 'Modifier la réservation' : 'Nouvelle réservation'}
        </Typography>
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="Informations générales" />
        <Tab label="Détails" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Client */}
          <Grid item xs={12}>
            <Autocomplete
              value={selectedClient}
              onChange={(event, newValue) => {
                setSelectedClient(newValue);
                setFormData(prev => ({
                  ...prev,
                  client_id: newValue?.id || ''
                }));
              }}
              options={clients}
              getOptionLabel={(option) => 
                typeof option === 'string' ? option : `${option.first_name} ${option.last_name}`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Client"
                  required
                  error={!formData.client_id}
                  helperText={!formData.client_id ? 'Veuillez sélectionner un client' : ''}
                />
              )}
            />
          </Grid>

          {/* Dates et Heures */}
          <Grid item xs={12} container spacing={2}>
            {/* Date de début */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date de début"
                value={formData.start_date}
                onChange={(date) => {
                  if (date) {
                    setFormData(prev => ({
                      ...prev,
                      start_date: date
                    }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !formData.start_date,
                    helperText: !formData.start_date ? 'Veuillez sélectionner une date de début' : ''
                  }
                }}
              />
            </Grid>

            {/* Date de fin */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date de fin"
                value={formData.end_date}
                onChange={(date) => {
                  if (date) {
                    setFormData(prev => ({
                      ...prev,
                      end_date: date
                    }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !formData.end_date,
                    helperText: !formData.end_date ? 'Veuillez sélectionner une date de fin' : ''
                  }
                }}
              />
            </Grid>
          </Grid>

          {/* Heures */}
          <Grid item xs={12} container spacing={2}>
            {/* Heure d'arrivée */}
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Heure d'arrivée"
                value={formData.check_in_time ? new Date(`1970-01-01T${formData.check_in_time}`) : null}
                onChange={(time) => {
                  if (time) {
                    setFormData(prev => ({
                      ...prev,
                      check_in_time: time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>

            {/* Heure de départ */}
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Heure de départ"
                value={formData.check_out_time ? new Date(`1970-01-01T${formData.check_out_time}`) : null}
                onChange={(time) => {
                  if (time) {
                    setFormData(prev => ({
                      ...prev,
                      check_out_time: time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>
          </Grid>

          {/* Véhicule */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Véhicule</InputLabel>
              <Select
                value={formData.vehicle_id || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    vehicle_id: value || null
                  }));
                }}
                label="Véhicule"
              >
                <MenuItem value="">Aucun véhicule</MenuItem>
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.license_plate}) - {formatCurrency(vehicle.daily_rate)}/jour
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Bungalow */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Bungalow</InputLabel>
              <Select
                value={formData.bungalow_id || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    bungalow_id: value || null
                  }));
                }}
                label="Bungalow"
              >
                <MenuItem value="">Aucun bungalow</MenuItem>
                {bungalows.map((bungalow) => (
                  <MenuItem key={bungalow.id} value={bungalow.id}>
                    {bungalow.name} - {formatCurrency(bungalow.daily_rate)}/nuit
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Totaux */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Résumé des coûts
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography>Sous-total: {formatCurrency(formData.subtotal || 0)}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography>Taxes: {formatCurrency(formData.tax_amount || 0)}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="h6">
                  Total: {formatCurrency(formData.total_amount || 0)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {/* Informations supplémentaires */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Numéro de dossier"
              value={formData.file_number || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, file_number: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                label="Statut"
              >
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="confirmed">Confirmé</MenuItem>
                <MenuItem value="cancelled">Annulé</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Adultes"
              value={formData.adults || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Enfants"
              value={formData.children || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) }))}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        {onClose && (
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !formData.client_id || (!formData.vehicle_id && !formData.bungalow_id)}
        >
          {loading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Créer'}
        </Button>
      </Box>
    </Paper>
  );
};
