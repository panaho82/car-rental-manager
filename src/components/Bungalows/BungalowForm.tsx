import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Bungalow } from '../../types/supabase';

interface BungalowFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (bungalow: Partial<Bungalow>) => Promise<void>;
  bungalow?: Bungalow;
}

const BUNGALOW_STATUS = [
  { value: 'available', label: 'Disponible' },
  { value: 'occupied', label: 'Occupé' },
  { value: 'maintenance', label: 'En maintenance' }
] as const;

export const BungalowForm = ({ open, onClose, onSubmit, bungalow }: BungalowFormProps) => {
  const [formData, setFormData] = useState<Partial<Bungalow>>({
    name: '',
    description: null,
    capacity: 2,
    daily_rate: 0,
    status: 'available',
    features: {
      bedrooms: 1,
      bathrooms: 1,
      aircon: false,
      wifi: false,
    },
    notes: null,
    last_maintenance: null,
    next_maintenance: null,
    image_url: null
  });

  useEffect(() => {
    if (bungalow) {
      setFormData(bungalow);
    } else {
      setFormData({
        name: '',
        description: null,
        capacity: 2,
        daily_rate: 0,
        status: 'available',
        features: {
          bedrooms: 1,
          bathrooms: 1,
          aircon: false,
          wifi: false,
        },
        notes: null,
        last_maintenance: null,
        next_maintenance: null,
        image_url: null
      });
    }
  }, [bungalow]);

  const handleChange = (field: keyof Bungalow) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value: any = event.target.value;

    // Convertir les valeurs numériques
    if (field === 'capacity' || field === 'daily_rate') {
      value = Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureChange = (feature: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value: any = event.target.value;

    // Convertir les valeurs numériques
    if (feature === 'bedrooms' || feature === 'bathrooms') {
      value = Number(value);
    }
    // Convertir les booléens
    if (feature === 'aircon' || feature === 'wifi') {
      value = event.target.checked;
    }

    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value,
      },
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
          {bungalow ? 'Modifier le bungalow' : 'Ajouter un bungalow'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom"
                value={formData.name || ''}
                onChange={handleChange('name')}
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
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Capacité"
                type="number"
                value={formData.capacity || ''}
                onChange={handleChange('capacity')}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Prix par jour (XPF)"
                type="number"
                value={formData.daily_rate || ''}
                onChange={handleChange('daily_rate')}
                inputProps={{ min: 0 }}
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
                {BUNGALOW_STATUS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Nombre de chambres"
                type="number"
                value={formData.features?.bedrooms || ''}
                onChange={handleFeatureChange('bedrooms')}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Nombre de salles de bain"
                type="number"
                value={formData.features?.bathrooms || ''}
                onChange={handleFeatureChange('bathrooms')}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.features?.aircon || false}
                    onChange={handleFeatureChange('aircon')}
                  />
                }
                label="Climatisation"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.features?.wifi || false}
                    onChange={handleFeatureChange('wifi')}
                  />
                }
                label="Wi-Fi"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained">
            {bungalow ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BungalowForm;
