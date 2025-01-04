import { useState, useEffect } from 'react';
import { Box, Button, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Bungalow } from '../../types/supabase';
import { useSupabase } from '../../hooks/useSupabase';
import { BungalowForm } from '../../components/Bungalows/BungalowForm';
import { formatCurrency } from '../../lib/formatUtils';

const getStatusLabel = (status: string): string => {
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

const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case 'available':
      return 'success';
    case 'occupied':
      return 'primary';
    case 'maintenance':
      return 'error';
    default:
      return 'default';
  }
};

const BungalowsPage = () => {
  const { supabase } = useSupabase();
  const [bungalows, setBungalows] = useState<Bungalow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedBungalow, setSelectedBungalow] = useState<Bungalow | undefined>();
  const [error, setError] = useState<string | null>(null);

  const loadBungalows = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('bungalows')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setBungalows(data || []);
    } catch (error: any) {
      console.error('Error loading bungalows:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bungalow ?')) {
      try {
        const { error: deleteError } = await supabase
          .from('bungalows')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        await loadBungalows();
      } catch (error: any) {
        console.error('Error deleting bungalow:', error);
        setError(error.message);
      }
    }
  };

  const handleSubmit = async (bungalowData: Partial<Bungalow>) => {
    try {
      if (selectedBungalow) {
        const { error: updateError } = await supabase
          .from('bungalows')
          .update(bungalowData)
          .eq('id', selectedBungalow.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('bungalows')
          .insert([bungalowData]);

        if (insertError) throw insertError;
      }

      await loadBungalows();
      setOpenForm(false);
      setSelectedBungalow(undefined);
    } catch (error: any) {
      console.error('Error saving bungalow:', error);
      setError(error.message);
    }
  };

  const handleEdit = (bungalow: Bungalow) => {
    setSelectedBungalow(bungalow);
    setOpenForm(true);
  };

  useEffect(() => {
    loadBungalows();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des Bungalows
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedBungalow(undefined);
            setOpenForm(true);
          }}
        >
          Ajouter un bungalow
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
              <TableCell>Nom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Capacité</TableCell>
              <TableCell>État</TableCell>
              <TableCell>Prix/Jour (XPF)</TableCell>
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
            ) : bungalows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun bungalow trouvé
                </TableCell>
              </TableRow>
            ) : (
              bungalows.map((bungalow) => (
                <TableRow key={bungalow.id}>
                  <TableCell>{bungalow.name}</TableCell>
                  <TableCell>{bungalow.description}</TableCell>
                  <TableCell>{bungalow.capacity}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(bungalow.status)}
                      color={getStatusColor(bungalow.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatCurrency(bungalow.daily_rate)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEdit(bungalow)}
                      size="small"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(bungalow.id)}
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

      <BungalowForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedBungalow(undefined);
        }}
        onSubmit={handleSubmit}
        bungalow={selectedBungalow}
      />
    </Box>
  );
};

export default BungalowsPage;
