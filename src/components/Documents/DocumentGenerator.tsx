import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../../utils/supabaseClient';
import { useParams } from 'react-router-dom';

interface CompanyInfo {
  name: string;
  rc_number: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  logo_url?: string;
}

interface DocumentData {
  id: string;
  document_type: 'invoice' | 'quote';
  document_number: string;
  created_at: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
  };
  vehicle?: {
    id: string;
    name: string;
    license_plate: string;
  };
  bungalow?: {
    id: string;
    name: string;
  };
  start_date: string;
  end_date: string;
  daily_rate: number;
  number_of_days: number;
  total_ht: number;
  tva_rate: number;
  tva_amount: number;
  total_ttc: number;
  contract_number?: string;
  notes?: string;
  status: string;
}

export const DocumentGenerator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch company info
        const { data: companyData, error: companyError } = await supabase
          .from('company_info')
          .select('*')
          .single();

        if (companyError) throw companyError;
        setCompanyInfo(companyData);

        if (id) {
          // Fetch document if editing
          const { data: documentData, error: documentError } = await supabase
            .from('documents')
            .select(`
              *,
              client:clients (*),
              vehicle:vehicles (*),
              bungalow:bungalows (*)
            `)
            .eq('id', id)
            .single();

          if (documentError) throw documentError;
          setDocumentData(documentData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!companyInfo) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Erreur: Impossible de charger les informations de l'entreprise
        </Typography>
      </Box>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ p: 4, maxWidth: '210mm', margin: 'auto', bgcolor: 'white' }}>
      <Box sx={{ mb: 2, '@media print': { display: 'none' } }}>
        <Button variant="contained" onClick={handlePrint}>
          Imprimer
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 4 }} className="print-content">
        {/* En-tête */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            {companyInfo.logo_url && (
              <img
                src={companyInfo.logo_url}
                alt="Logo"
                style={{ maxWidth: 200, height: 'auto' }}
              />
            )}
            <Typography variant="h5" sx={{ mt: 2 }}>
              {companyInfo.name}
            </Typography>
            <Typography variant="body2">{companyInfo.rc_number}</Typography>
            <Typography variant="body2">{companyInfo.address}</Typography>
            <Typography variant="body2">{companyInfo.postal_code} {companyInfo.city}</Typography>
            <Typography variant="body2">Tél : {companyInfo.phone}</Typography>
            <Typography variant="body2">Email : {companyInfo.email}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" align="right">
              {documentData?.document_type === 'invoice' ? 'FACTURE' : 'DEVIS'} N°{documentData?.document_number || '---'}
            </Typography>
            <Typography variant="body2" align="right">
              RAIATEA, le {format(new Date(documentData?.created_at || new Date()), 'dd/MM/yyyy', { locale: fr })}
            </Typography>
            {documentData?.client && (
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography variant="body1">
                  {documentData.client.first_name} {documentData.client.last_name}
                </Typography>
                {documentData.client.address && (
                  <Typography variant="body2">{documentData.client.address}</Typography>
                )}
                <Typography variant="body2">Tél : {documentData.client.phone}</Typography>
                <Typography variant="body2">Email : {documentData.client.email}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {documentData && (
          <>
            {/* Détails de la location */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">
                {documentData.vehicle ? documentData.vehicle.name : documentData.bungalow?.name}
              </Typography>
              {documentData.vehicle && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {documentData.vehicle.license_plate}
                </Typography>
              )}
              <Typography variant="body1">
                Location {documentData.number_of_days} jours du{' '}
                {format(new Date(documentData.start_date), 'dd/MM/yyyy - HH\'h\'', { locale: fr })} au{' '}
                {format(new Date(documentData.end_date), 'dd/MM/yyyy - HH\'h\'', { locale: fr })}
              </Typography>
              <Typography variant="body1">
                Tarif journalier : {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XPF',
                  minimumFractionDigits: 0
                }).format(documentData.daily_rate)}
              </Typography>
            </Box>

            {/* Montants */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={4}>
                <Typography variant="body2">Base HT</Typography>
                <Typography variant="body1">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XPF',
                    minimumFractionDigits: 0
                  }).format(documentData.total_ht)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">TVA {documentData.tva_rate}%</Typography>
                <Typography variant="body1">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XPF',
                    minimumFractionDigits: 0
                  }).format(documentData.tva_amount)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2">Total TTC</Typography>
                <Typography variant="body1">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XPF',
                    minimumFractionDigits: 0
                  }).format(documentData.total_ttc)}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            {/* Total et mentions */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">
                Net à payer : {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XPF',
                  minimumFractionDigits: 0
                }).format(documentData.total_ttc)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Arrêté le présent {documentData.document_type === 'invoice' ? 'facture' : 'devis'} à la somme de :{' '}
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XPF',
                  minimumFractionDigits: 0
                }).format(documentData.total_ttc)} francs
              </Typography>
            </Box>

            {/* Notes et mentions légales */}
            {documentData.contract_number && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                CONTRAT N° {documentData.contract_number}
              </Typography>
            )}
            {documentData.notes && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {documentData.notes}
              </Typography>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};
