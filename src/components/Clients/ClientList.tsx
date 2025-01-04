import { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSupabase } from '../../hooks/useSupabase';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_phone: string;
  country: string;
}

interface ClientListProps {
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
}

export const ClientList = ({ onEdit, onDelete }: ClientListProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (loading) {
    return <Typography>Chargement des clients...</Typography>;
  }

  if (error) {
    return <Typography color="error">Erreur: {error}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Liste des Clients
        </Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nom</TableCell>
            <TableCell>Prénom</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Téléphone</TableCell>
            <TableCell>Pays</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Aucun client trouvé
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.last_name}</TableCell>
                <TableCell>{client.first_name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.mobile_phone}</TableCell>
                <TableCell>{client.country}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => onEdit?.(client)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete?.(client)}
                    color="error"
                    size="small"
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
  );
};
