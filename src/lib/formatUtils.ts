/**
 * Formate un nombre en devise XPF
 * @param amount - Le montant à formater
 * @returns Le montant formaté avec le symbole XPF
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' XPF';
};

/**
 * Formate un numéro de téléphone polynésien
 * @param phone - Le numéro de téléphone à formater
 * @returns Le numéro formaté (ex: 87.77.77.77)
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    return match.slice(1).join('.');
  }
  return phone;
};

/**
 * Formate une adresse email en minuscules
 * @param email - L'adresse email à formater
 * @returns L'adresse email en minuscules
 */
export const formatEmail = (email: string): string => {
  return email.toLowerCase();
};
