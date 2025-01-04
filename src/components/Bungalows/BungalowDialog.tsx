import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Bungalow, BungalowStatus } from '../../types/supabase';

interface BungalowDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (bungalow: Partial<Bungalow>) => void;
  bungalow?: Bungalow | null;
}

export default function BungalowDialog({
  open,
  onClose,
  onSave,
  bungalow,
}: BungalowDialogProps) {
  const [formData, setFormData] = useState<Partial<Bungalow>>({
    name: '',
    daily_rate: 0,
    status: 'available' as BungalowStatus,
    description: '',
    features: [],
    image_url: '',
    capacity: 2,
  });

  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (bungalow) {
      setFormData(bungalow);
    } else {
      setFormData({
        name: '',
        daily_rate: 0,
        status: 'available' as BungalowStatus,
        description: '',
        features: [],
        image_url: '',
        capacity: 2,
      });
    }
  }, [bungalow]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'daily_rate' || name === 'capacity' ? Number(value) : value,
    }));
  };

  const handleStatusChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value as BungalowStatus,
    }));
  };

  const handleAddFeature = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newFeature.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleDeleteFeature = (featureToDelete: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.filter((feature) => feature !== featureToDelete),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {bungalow ? 'Modifier le bungalow' : 'Ajouter un nouveau bungalow'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="name"
              label="Nom du bungalow"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              name="daily_rate"
              label="Tarif journalier"
              type="number"
              value={formData.daily_rate}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">XPF</InputAdornment>
                ),
              }}
            />

            <TextField
              name="capacity"
              label="Capacité"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={formData.status}
                onChange={handleStatusChange}
                label="Statut"
                required
              >
                <MenuItem value="available">Disponible</MenuItem>
                <MenuItem value="occupied">Occupé</MenuItem>
                <MenuItem value="maintenance">En maintenance</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />

            <TextField
              name="image_url"
              label="URL de l'image"
              value={formData.image_url}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Ajouter des caractéristiques"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={handleAddFeature}
              helperText="Appuyez sur Entrée pour ajouter une caractéristique"
              fullWidth
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {formData.features?.map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  onDelete={() => handleDeleteFeature(feature)}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
