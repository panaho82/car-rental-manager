/**
 * Formate un nombre en devise XPF
 * @param amount - Le montant à formater
 * @returns Le montant formaté en XPF
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XPF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Formate une date en format français
 * @param date - La date à formater
 * @returns La date formatée
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formate un pourcentage avec une décimale
 * @param value - La valeur à formater
 * @returns Le pourcentage formaté
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Formate un numéro de téléphone polynésien
 * @param phone - Le numéro de téléphone à formater
 * @returns Le numéro formaté
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  return phone;
};

/**
 * Formate un numéro de document (devis/facture)
 * @param prefix - Le préfixe du document (D pour devis, F pour facture)
 * @param number - Le numéro du document
 * @param date - La date du document
 * @returns Le numéro formaté
 */
export const formatDocumentNumber = (prefix: string, number: number, date: Date): string => {
  const year = date.getFullYear();
  return `${prefix}${year}-${number.toString().padStart(4, '0')}`;
};
