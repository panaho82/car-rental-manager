import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../../utils/supabaseClient';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

interface Document {
  id: string;
  document_type: 'invoice' | 'quote';
  document_number: string;
  created_at: string;
  client: {
    first_name: string;
    last_name: string;
  };
  vehicle?: {
    name: string;
    license_plate: string;
  };
  bungalow?: {
    name: string;
  };
  total_ttc: number;
  status: string;
}

export const DocumentsList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          document_type,
          document_number,
          created_at,
          total_ttc,
          status,
          client:clients (
            first_name,
            last_name
          ),
          vehicle:vehicles (
            name,
            license_plate
          ),
          bungalow:bungalows (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error in fetchDocuments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc =>
    doc.document_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${doc.client.first_name} ${doc.client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.vehicle?.license_plate || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDocument = (id: string) => {
    window.open(`/documents/${id}`, '_blank');
  };

  const handlePrintDocument = (id: string) => {
    window.open(`/documents/${id}/print`, '_blank');
  };

  const handleEditDocument = (id: string) => {
    window.location.href = `/documents/${id}/edit`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#FFA726';
      case 'sent': return '#42A5F5';
      case 'paid': return '#66BB6A';
      case 'cancelled': return '#EF5350';
      default: return '#78909C';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyé';
      case 'paid': return 'Payé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Rechercher"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
          placeholder="N° document, client, ou plaque"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/documents/new'}
        >
          Nouveau document
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Ressource</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Montant TTC</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.document_number}</TableCell>
                <TableCell>
                  {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell>
                  {`${doc.client.first_name} ${doc.client.last_name}`}
                </TableCell>
                <TableCell>
                  {doc.vehicle ? 
                    `${doc.vehicle.name} (${doc.vehicle.license_plate})` : 
                    doc.bungalow?.name || '-'}
                </TableCell>
                <TableCell>
                  {doc.document_type === 'invoice' ? 'Facture' : 'Devis'}
                </TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XPF',
                    minimumFractionDigits: 0
                  }).format(doc.total_ttc)}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      backgroundColor: getStatusColor(doc.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      fontSize: '0.75rem',
                    }}
                  >
                    {getStatusLabel(doc.status)}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Voir">
                    <IconButton size="small" onClick={() => handleViewDocument(doc.id)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton size="small" onClick={() => handleEditDocument(doc.id)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Imprimer">
                    <IconButton size="small" onClick={() => handlePrintDocument(doc.id)}>
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
