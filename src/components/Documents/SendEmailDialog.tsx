import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { sendEmail, getEmailTemplate } from '../../services/emailService';

interface SendEmailDialogProps {
  open: boolean;
  onClose: () => void;
  document: {
    type: 'quote' | 'invoice';
    number: string;
    client_details: {
      first_name: string;
      last_name: string;
      email?: string;
    };
  };
  pdfUrl?: string;
}

export const SendEmailDialog = ({
  open,
  onClose,
  document,
  pdfUrl,
}: SendEmailDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const template = getEmailTemplate(document.type);

  const [formData, setFormData] = useState({
    to_email: document.client_details.email || '',
    to_name: `${document.client_details.first_name} ${document.client_details.last_name}`,
    subject: template.subject,
    message: template.message.replace(
      '{to_name}',
      `${document.client_details.first_name} ${document.client_details.last_name}`
    ),
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      await sendEmail({
        ...formData,
        from_name: 'Raiatea Rental Car',
        attachment_url: pdfUrl,
      });

      onClose();
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      setError(error.message || 'Une erreur est survenue lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Envoyer par email
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email du destinataire"
            type="email"
            value={formData.to_email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, to_email: e.target.value }))
            }
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Nom du destinataire"
            value={formData.to_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, to_name: e.target.value }))
            }
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Objet"
            value={formData.subject}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, subject: e.target.value }))
            }
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            required
          />
        </Box>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.to_email || !formData.message}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Envoi en cours...
            </>
          ) : (
            'Envoyer'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
