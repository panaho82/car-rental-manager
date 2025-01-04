import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Vehicle } from '../../types/supabase';
import { useSupabase } from '../../hooks/useSupabase';
import { VehicleForm } from '../../components/Vehicles/VehicleForm';
import { formatCurrency } from '../../lib/formatUtils';

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'available':
      return 'Disponible';
    case 'rented':
      return 'Loué';
    case 'maintenance':
      return 'En maintenance';
    default:
      return status;
  }
};

const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case 'available':
      return 'success';
    case 'rented':
      return 'primary';
    case 'maintenance':
      return 'error';
    default:
      return 'default';
  }
};

export const VehiclesPage = () => {
  const { supabase } = useSupabase();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();
  const [error, setError] = useState<string | null>(null);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select('*')
        .order('brand', { ascending: true });

      if (fetchError) throw fetchError;
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      try {
        const { error: deleteError } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        await loadVehicles();
      } catch (error: any) {
        console.error('Error deleting vehicle:', error);
        setError(error.message);
      }
    }
  };

  const handleSubmit = async (vehicleData: Partial<Vehicle>) => {
    try {
      if (selectedVehicle) {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', selectedVehicle.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('vehicles')
          .insert([vehicleData]);

        if (insertError) throw insertError;
      }

      await loadVehicles();
      setOpenForm(false);
      setSelectedVehicle(undefined);
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      setError(error.message);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenForm(true);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des Véhicules
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedVehicle(undefined);
            setOpenForm(true);
          }}
        >
          Ajouter un véhicule
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Marque</TableCell>
              <TableCell>Modèle</TableCell>
              <TableCell>Année</TableCell>
              <TableCell>Immatriculation</TableCell>
              <TableCell>État</TableCell>
              <TableCell>Prix/Jour (XPF)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun véhicule trouvé
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.license_plate}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(vehicle.status)}
                      color={getStatusColor(vehicle.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(vehicle.daily_rate)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEdit(vehicle)}
                      size="small"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(vehicle.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <VehicleForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedVehicle(undefined);
        }}
        onSubmit={handleSubmit}
        vehicle={selectedVehicle}
      />
    </Box>
  );
};
