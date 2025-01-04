import { Card, CardContent, CardMedia, Typography, Chip, IconButton, Box } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Bungalow } from '../../types/supabase';

interface BungalowCardProps {
  bungalow: Bungalow;
  onEdit: () => void;
}

export default function BungalowCard({ bungalow, onEdit }: BungalowCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Occupé';
      case 'maintenance':
        return 'En maintenance';
      default:
        return status;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={bungalow.image_url || '/placeholder-bungalow.jpg'}
        alt={bungalow.name}
      />
      <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8 }}
          onClick={onEdit}
        >
          <EditIcon />
        </IconButton>

        <Typography gutterBottom variant="h5" component="h2">
          {bungalow.name}
        </Typography>

        <Chip
          label={getStatusLabel(bungalow.status)}
          color={getStatusColor(bungalow.status) as any}
          size="small"
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary" paragraph>
          {bungalow.description || 'Aucune description disponible'}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="primary">
            {bungalow.daily_rate} XPF / nuit
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Capacité : {bungalow.capacity} personnes
          </Typography>
        </Box>

        {bungalow.features && bungalow.features.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {bungalow.features.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
