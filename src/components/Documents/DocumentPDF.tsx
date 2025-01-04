import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { formatCurrency } from '../../lib/formatUtils';

// Enregistrer la police Roboto
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  companyInfo: {
    flex: 1,
  },
  documentInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  clientSection: {
    marginBottom: 30,
  },
  notesSection: {
    marginBottom: 30,
  },
  totalsSection: {
    marginLeft: 'auto',
    width: '50%',
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsSection: {
    marginTop: 'auto',
  },
});

interface DocumentPDFProps {
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

export const DocumentPDF = ({ document }: DocumentPDFProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          {/* Informations de l'entreprise */}
          <View style={styles.companyInfo}>
            <Text style={styles.subtitle}>{document.company_details.name}</Text>
            <Text style={styles.text}>{document.company_details.address}</Text>
            <Text style={styles.text}>
              {document.company_details.postal_code} {document.company_details.city}
            </Text>
            <Text style={styles.text}>{document.company_details.country}</Text>
            <Text style={styles.text}>Tél: {document.company_details.phone}</Text>
            <Text style={styles.text}>Email: {document.company_details.email}</Text>
            <Text style={styles.text}>N° Tahiti: {document.company_details.tax_number}</Text>
          </View>

          {/* Informations du document */}
          <View style={styles.documentInfo}>
            <Text style={styles.title}>
              {document.type === 'quote' ? 'DEVIS' : 'FACTURE'}
            </Text>
            <Text style={styles.text}>N° {document.number}</Text>
            <Text style={styles.text}>Date: {formatDate(document.date)}</Text>
            {document.type === 'invoice' && document.due_date && (
              <Text style={styles.text}>
                Date d'échéance: {formatDate(document.due_date)}
              </Text>
            )}
          </View>
        </View>

        {/* Informations du client */}
        <View style={styles.clientSection}>
          <Text style={styles.subtitle}>Client</Text>
          <Text style={styles.text}>
            {document.client_details.first_name} {document.client_details.last_name}
          </Text>
          {document.client_details.address && (
            <Text style={styles.text}>{document.client_details.address}</Text>
          )}
          {document.client_details.postal_code && (
            <Text style={styles.text}>
              {document.client_details.postal_code} {document.client_details.country}
            </Text>
          )}
          {document.client_details.email && (
            <Text style={styles.text}>Email: {document.client_details.email}</Text>
          )}
        </View>

        {/* Notes */}
        {document.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.text}>{document.notes}</Text>
          </View>
        )}

        {/* Totaux */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.text}>Sous-total:</Text>
            <Text style={styles.text}>{formatCurrency(document.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.text}>TVA ({document.tax_rate}%):</Text>
            <Text style={styles.text}>{formatCurrency(document.tax_amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalAmount}>Total:</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(document.total_amount)}
            </Text>
          </View>
        </View>

        {/* Conditions */}
        {document.terms && (
          <View style={styles.termsSection}>
            <Text style={[styles.text, styles.bold]}>Conditions</Text>
            <Text style={styles.text}>{document.terms}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
