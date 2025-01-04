import { Box, Grid, Paper, Typography } from '@mui/material';
import { formatCurrency } from '../../lib/formatUtils';

interface DocumentDetailsProps {
  document: {
    type: 'quote' | 'invoice';
    number: string;
    date: string;
    due_date?: string;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    notes?: string;
    terms?: string;
    company_details: {
      name: string;
      address: string;
      postal_code: string;
      city: string;
      country: string;
      phone: string;
      email: string;
      tax_number: string;
    };
    client_details: {
      first_name: string;
      last_name: string;
      email?: string;
      address?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

export const DocumentDetails = ({ document }: DocumentDetailsProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Paper sx={{ p: 4 }}>
      {/* En-tête */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Informations de l'entreprise */}
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom>
            {document.company_details.name}
          </Typography>
          <Typography>{document.company_details.address}</Typography>
          <Typography>
            {document.company_details.postal_code} {document.company_details.city}
          </Typography>
          <Typography>{document.company_details.country}</Typography>
          <Typography>Tél: {document.company_details.phone}</Typography>
          <Typography>Email: {document.company_details.email}</Typography>
          <Typography>N° Tahiti: {document.company_details.tax_number}</Typography>
        </Grid>

        {/* Informations du document */}
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" gutterBottom>
              {document.type === 'quote' ? 'DEVIS' : 'FACTURE'}
            </Typography>
            <Typography>N° {document.number}</Typography>
            <Typography>Date: {formatDate(document.date)}</Typography>
            {document.type === 'invoice' && document.due_date && (
              <Typography>Date d'échéance: {formatDate(document.due_date)}</Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Informations du client */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Client
        </Typography>
        <Typography>
          {document.client_details.first_name} {document.client_details.last_name}
        </Typography>
        {document.client_details.address && (
          <Typography>{document.client_details.address}</Typography>
        )}
        {document.client_details.postal_code && (
          <Typography>
            {document.client_details.postal_code} {document.client_details.country}
          </Typography>
        )}
        {document.client_details.email && (
          <Typography>Email: {document.client_details.email}</Typography>
        )}
      </Box>

      {/* Notes */}
      {document.notes && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" whiteSpace="pre-wrap">
            {document.notes}
          </Typography>
        </Box>
      )}

      {/* Totaux */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography>Sous-total:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="right">
                    {formatCurrency(document.subtotal)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>TVA ({document.tax_rate}%):</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography align="right">
                    {formatCurrency(document.tax_amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">Total:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" align="right">
                    {formatCurrency(document.total_amount)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Conditions */}
      {document.terms && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Conditions
          </Typography>
          <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
            {document.terms}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
