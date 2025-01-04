import emailjs from '@emailjs/browser';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { DocumentPDF } from '../components/Documents/DocumentPDF';

// Configuration EmailJS
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // À remplacer par votre ID de service EmailJS
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // À remplacer par votre ID de template EmailJS
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // À remplacer par votre clé publique EmailJS

interface EmailParams {
  to_email: string;
  to_name: string;
  from_name: string;
  subject: string;
  message: string;
  attachment_url?: string;
}

export const sendEmail = async (params: EmailParams) => {
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: params.to_email,
        to_name: params.to_name,
        from_name: params.from_name,
        subject: params.subject,
        message: params.message,
        attachment_url: params.attachment_url,
      },
      EMAILJS_PUBLIC_KEY
    );

    return response;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

export const getEmailTemplate = (documentType: 'quote' | 'invoice') => {
  const templates = {
    quote: {
      subject: 'Votre devis de Raiatea Rental Car',
      message: `
Bonjour {to_name},

Veuillez trouver ci-joint votre devis.

N'hésitez pas à nous contacter si vous avez des questions.

Cordialement,
L'équipe Raiatea Rental Car
      `,
    },
    invoice: {
      subject: 'Votre facture de Raiatea Rental Car',
      message: `
Bonjour {to_name},

Veuillez trouver ci-joint votre facture.

Pour rappel, le paiement est attendu sous 30 jours.

Cordialement,
L'équipe Raiatea Rental Car
      `,
    },
  };

  return templates[documentType];
};
