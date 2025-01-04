import { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useSupabase } from '../../hooks/useSupabase';
import { StyledTextField } from '../common/StyledTextField';

interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  postal_code: string;
  country: string;
  mobile_phone: string;
  comments: string;
}

interface ClientFormProps {
  client?: ClientFormData & { id: string };
  onSuccess?: () => void;
}

export const ClientForm = ({ client, onSuccess }: ClientFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { supabase } = useSupabase();
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: client || {
      first_name: '',
      last_name: '',
      email: '',
      address: '',
      postal_code: '',
      country: 'Polynésie française',
      mobile_phone: '',
      comments: '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (client?.id) {
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', client.id);

        if (updateError) throw updateError;
        setSuccessMessage('Client modifié avec succès');
      } else {
        const { error: insertError } = await supabase
          .from('clients')
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (insertError) throw insertError;
        setSuccessMessage('Client créé avec succès');
        reset();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde du client:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {client ? 'Modifier le client' : 'Nouveau Client'}
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Nom et Prénom */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="last_name"
              control={control}
              rules={{ required: 'Le nom est requis' }}
              render={({ field, fieldState: { error } }) => (
                <StyledTextField
                  {...field}
                  label="Nom"
                  fullWidth
                  required
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="first_name"
              control={control}
              rules={{ required: 'Le prénom est requis' }}
              render={({ field, fieldState: { error } }) => (
                <StyledTextField
                  {...field}
                  label="Prénom"
                  fullWidth
                  required
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <StyledTextField
                  {...field}
                  label="Email"
                  fullWidth
                  type="email"
                />
              )}
            />
          </Grid>

          {/* Adresse */}
          <Grid item xs={12}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <StyledTextField
                  {...field}
                  label="Adresse"
                  fullWidth
                  multiline
                  rows={2}
                />
              )}
            />
          </Grid>

          {/* Code postal */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="postal_code"
              control={control}
              render={({ field }) => (
                <StyledTextField
                  {...field}
                  label="Code postal"
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Pays */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="country"
              control={control}
              rules={{ required: 'Le pays est requis' }}
              render={({ field, fieldState: { error } }) => (
                <StyledTextField
                  {...field}
                  label="Pays"
                  fullWidth
                  required
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Grid>

          {/* Téléphone mobile */}
          <Grid item xs={12}>
            <Controller
              name="mobile_phone"
              control={control}
              render={({ field }) => (
                <StyledTextField
                  {...field}
                  label="Téléphone mobile"
                  fullWidth
                />
              )}
            />
          </Grid>

          {/* Commentaires */}
          <Grid item xs={12}>
            <Controller
              name="comments"
              control={control}
              render={({ field }) => (
                <StyledTextField
                  {...field}
                  label="Commentaires"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
          </Grid>

          {/* Boutons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Réinitialiser
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : client ? 'Modifier' : 'Enregistrer'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Messages d'erreur et de succès */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage(null)}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};
