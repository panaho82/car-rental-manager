import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { useSupabase } from '../../hooks/useSupabase';
import { DocumentDetails } from '../../components/Documents/DocumentDetails';
import { DocumentPDF } from '../../components/Documents/DocumentPDF';
import { SendEmailDialog } from '../../components/Documents/SendEmailDialog';
import { formatCurrency } from '../../lib/formatUtils';

interface Document {
  id: string;
  type: 'quote' | 'invoice';
  number: string;
  date: string;
  due_date?: string;
  status: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  terms?: string;
  company_details: any;
  client_details: any;
  reservation?: {
    id: string;
    start_date: string;
    end_date: string;
  };
}

const DocumentsPage = () => {
  const { supabase } = useSupabase();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openPrintPreview, setOpenPrintPreview] = useState(false);
  const [openSendEmail, setOpenSendEmail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          reservation:reservations(
            id,
            start_date,
            end_date
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      setError('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (document: Document) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', document.id);

        if (error) throw error;
        await loadDocuments();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setError('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrint = (document: Document) => {
    setSelectedDocument(document);
    setOpenPrintPreview(true);
  };

  const handleSendEmail = (document: Document) => {
    setSelectedDocument(document);
    setOpenSendEmail(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'primary';
      case 'paid':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'sent':
        return 'Envoyé';
      case 'paid':
        return 'Payé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const filteredDocuments = documents.filter(document => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      document.number.toLowerCase().includes(searchStr) ||
      document.client_details?.last_name?.toLowerCase().includes(searchStr) ||
      document.client_details?.first_name?.toLowerCase().includes(searchStr);
    
    if (tabValue === 'all') return matchesSearch;
    if (tabValue === 'quotes') return matchesSearch && document.type === 'quote';
    if (tabValue === 'invoices') return matchesSearch && document.type === 'invoice';
    return false;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Typography variant="h4" gutterBottom>
        Documents
      </Typography>

      {/* Filtres */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Tous" value="all" />
          <Tab label="Devis" value="quotes" />
          <Tab label="Factures" value="invoices" />
        </Tabs>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un document..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      {/* Liste des documents */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Montant</TableCell>
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
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun document trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.number}</TableCell>
                  <TableCell>{formatDate(document.date)}</TableCell>
                  <TableCell>
                    {document.client_details?.last_name} {document.client_details?.first_name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(document.status)}
                      color={getStatusColor(document.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(document.total_amount)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Voir">
                      <IconButton
                        onClick={() => {
                          setSelectedDocument(document);
                          setOpenDetails(true);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Imprimer">
                      <IconButton onClick={() => handlePrint(document)}>
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Envoyer par email">
                      <IconButton onClick={() => handleSendEmail(document)}>
                        <EmailIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        onClick={() => handleDelete(document)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog des détails */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedDocument && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  startIcon={<PrintIcon />}
                  variant="outlined"
                  onClick={() => handlePrint(selectedDocument)}
                >
                  Imprimer
                </Button>
                <Button
                  startIcon={<EmailIcon />}
                  variant="outlined"
                  onClick={() => handleSendEmail(selectedDocument)}
                >
                  Envoyer par email
                </Button>
              </Box>
              <DocumentDetails document={selectedDocument} />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'aperçu avant impression */}
      <Dialog
        open={openPrintPreview}
        onClose={() => setOpenPrintPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedDocument && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <PDFDownloadLink
                  document={<DocumentPDF document={selectedDocument} />}
                  fileName={`${selectedDocument.number}.pdf`}
                >
                  {({ loading }) => (
                    <Button
                      variant="contained"
                      disabled={loading}
                    >
                      Télécharger PDF
                    </Button>
                  )}
                </PDFDownloadLink>
              </Box>
              <Box sx={{ height: '70vh' }}>
                <PDFViewer width="100%" height="100%">
                  <DocumentPDF document={selectedDocument} />
                </PDFViewer>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'envoi d'email */}
      {selectedDocument && (
        <SendEmailDialog
          open={openSendEmail}
          onClose={() => setOpenSendEmail(false)}
          document={selectedDocument}
        />
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default DocumentsPage;
