import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSupabase } from '../../hooks/useSupabase';
import { Invoice, InvoiceStatus, Reservation, Client } from '../../types/supabase';
import { formatCurrency } from '../../lib/formatUtils';

interface InvoiceFormProps {
  reservation: Reservation | null;
  onClose?: () => void;
}

export const InvoiceForm = ({ reservation, onClose }: InvoiceFormProps) => {
  const { get, create } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    invoice_number: '',
    reservation_id: reservation?.id || '',
    client_id: reservation?.client_id || '',
    status: 'draft' as InvoiceStatus,
    issue_date: new Date(),
    due_date: new Date(),
    subtotal: reservation?.subtotal || 0,
    tax_rate: 0.16,
    tax_amount: reservation?.tax_amount || 0,
    total_amount: reservation?.total_amount || 0,
    notes: '',
    items: [
      {
        description: 'Réservation',
        quantity: 1,
        unit_price: reservation?.total_amount || 0,
        total: reservation?.total_amount || 0,
      }
    ]
  });

  useEffect(() => {
    if (reservation?.client_id) {
      loadClient(reservation.client_id);
    }
  }, [reservation]);

  const loadClient = async (clientId: string) => {
    try {
      const clientData = await get<Client>('clients', clientId);
      if (clientData) {
        setClient(clientData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du client:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Créer la facture
      await create('invoices', formData);
      onClose?.();
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      setError('Une erreur est survenue lors de la création de la facture.');
    } finally {
      setLoading(false);
    }
  };

  if (!reservation) {
    return (
      <Alert severity="error">
        Aucune réservation sélectionnée
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Facture</Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Informations client</Typography>
            {client && (
              <>
                <Typography>{client.first_name} {client.last_name}</Typography>
                <Typography>{client.email}</Typography>
                <Typography>{client.phone}</Typography>
                {client.address && <Typography>{client.address}</Typography>}
              </>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Détails de la facture</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="N° de facture"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Date d'émission"
                  value={formData.issue_date}
                  onChange={(date) => date && setFormData(prev => ({ ...prev, issue_date: date }))}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Date d'échéance"
                  value={formData.due_date}
                  onChange={(date) => date && setFormData(prev => ({ ...prev, due_date: date }))}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Articles</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Quantité</TableCell>
                  <TableCell align="right">Prix unitaire</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
            <Typography>Sous-total: {formatCurrency(formData.subtotal)}</Typography>
            <Typography>TVA ({(formData.tax_rate * 100).toFixed(0)}%): {formatCurrency(formData.tax_amount)}</Typography>
            <Typography variant="h6">Total: {formatCurrency(formData.total_amount)}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Créer la facture'}
        </Button>
      </Box>
    </Paper>
  );
};
