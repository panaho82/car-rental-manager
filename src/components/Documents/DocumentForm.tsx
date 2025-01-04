import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress,
} from '@mui/material';
import { documentService } from '../../services/documentService';
import { formatCurrency } from '../../utils/formatUtils';

interface DocumentFormProps {
  type: 'quote' | 'invoice';
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export const DocumentForm = ({ type, onSubmit, onCancel, initialData }: DocumentFormProps) => {
  const [selectedClient, setSelectedClient] = useState<string>(initialData?.client || '');
  const [selectedResources, setSelectedResources] = useState<string[]>(initialData?.resources || []);
  const [vehicleReservations, setVehicleReservations] = useState<any[]>([]);
  const [bungalowReservations, setBungalowReservations] = useState<any[]>([]);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResourceChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const newSelectedResources = event.target.checked
      ? [...selectedResources, value]
      : selectedResources.filter((r) => r !== value);
    
    setSelectedResources(newSelectedResources);
    
    if (selectedClient) {
      await loadReservations(selectedClient, value, event.target.checked);
    }
  };

  const loadReservations = async (clientId: string, resourceType: string, isChecked: boolean) => {
    if (!isChecked) {
      if (resourceType === 'vehicles') {
        setVehicleReservations([]);
      } else {
        setBungalowReservations([]);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reservations = await documentService.getReservations(clientId, resourceType);
      
      if (resourceType === 'vehicles') {
        setVehicleReservations(reservations);
      } else {
        setBungalowReservations(reservations);
      }
    } catch (err) {
      setError('Erreur lors du chargement des réservations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReservationToggle = (type: 'vehicles' | 'bungalows', id: string) => {
    if (type === 'vehicles') {
      setVehicleReservations(reservations =>
        reservations.map(r =>
          r.id === id ? { ...r, included: !r.included } : r
        )
      );
    } else {
      setBungalowReservations(reservations =>
        reservations.map(r =>
          r.id === id ? { ...r, included: !r.included } : r
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      setError('Veuillez sélectionner un client');
      return;
    }

    const totalAmount = documentService.calculateTotal(
      vehicleReservations,
      bungalowReservations
    );

    const formData = {
      type,
      client: selectedClient,
      resources: selectedResources,
      vehicleReservations: vehicleReservations.filter(r => r.included),
      bungalowReservations: bungalowReservations.filter(r => r.included),
      notes,
      totalAmount,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h6" gutterBottom>
        {type === 'quote' ? 'Nouveau Devis' : 'Nouvelle Facture'}
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Client</InputLabel>
            <Select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              required
            >
              <MenuItem value="">Sélectionner un client</MenuItem>
              {/* Liste des clients */}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Sélectionner les ressources</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedResources.includes('vehicles')}
                    onChange={handleResourceChange}
                    value="vehicles"
                  />
                }
                label="Véhicules"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedResources.includes('bungalows')}
                    onChange={handleResourceChange}
                    value="bungalows"
                  />
                }
                label="Bungalows"
              />
            </FormGroup>
          </FormControl>
        </Grid>

        {loading && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          </Grid>
        )}

        {selectedResources.includes('vehicles') && !loading && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Réservations de Véhicules
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Véhicule</TableCell>
                    <TableCell>Période</TableCell>
                    <TableCell align="right">Prix</TableCell>
                    <TableCell>Inclure</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicleReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        {reservation.vehicle.brand} {reservation.vehicle.model}
                      </TableCell>
                      <TableCell>
                        {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(reservation.price)}
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={reservation.included}
                          onChange={() => handleReservationToggle('vehicles', reservation.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}

        {selectedResources.includes('bungalows') && !loading && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Réservations de Bungalows
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bungalow</TableCell>
                    <TableCell>Période</TableCell>
                    <TableCell align="right">Prix</TableCell>
                    <TableCell>Inclure</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bungalowReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        {reservation.bungalow.name}
                      </TableCell>
                      <TableCell>
                        {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(reservation.price)}
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={reservation.included}
                          onChange={() => handleReservationToggle('bungalows', reservation.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onCancel}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !selectedClient || selectedResources.length === 0}
            >
              {type === 'quote' ? 'Créer le Devis' : 'Créer la Facture'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
