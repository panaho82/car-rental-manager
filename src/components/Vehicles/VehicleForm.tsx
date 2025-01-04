import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material';
import { Vehicle } from '../../types/supabase';

interface VehicleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (vehicle: Partial<Vehicle>) => Promise<void>;
  vehicle?: Vehicle;
}

const VEHICLE_STATUS = [
  { value: 'available', label: 'Disponible' },
  { value: 'rented', label: 'Loué' },
  { value: 'maintenance', label: 'En maintenance' }
] as const;

export const VehicleForm = ({ open, onClose, onSubmit, vehicle }: VehicleFormProps) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    status: 'available',
    daily_rate: 0,
    description: '',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
    } else {
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        status: 'available',
        daily_rate: 0,
        description: '',
      });
    }
  }, [vehicle, open]);

  const handleChange = (field: keyof Vehicle) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.type === 'number' 
      ? parseFloat(event.target.value) 
      : event.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {vehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Marque"
                value={formData.brand || ''}
                onChange={handleChange('brand')}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Modèle"
                value={formData.model || ''}
                onChange={handleChange('model')}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Année"
                type="number"
                value={formData.year || ''}
                onChange={handleChange('year')}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Immatriculation"
                value={formData.license_plate || ''}
                onChange={handleChange('license_plate')}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Statut"
                value={formData.status || 'available'}
                onChange={handleChange('status')}
                required
              >
                {VEHICLE_STATUS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Prix par jour (XPF)"
                type="number"
                value={formData.daily_rate || ''}
                onChange={handleChange('daily_rate')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description || ''}
                onChange={handleChange('description')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained">
            {vehicle ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
