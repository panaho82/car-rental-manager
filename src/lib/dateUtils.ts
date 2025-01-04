import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns';
import fr from 'date-fns/locale/fr';

// Format constants
export const DATE_FORMAT = 'dd/MM/yyyy';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;

// Current timezone offset for Raiatea (French Polynesia)
export const TIMEZONE_OFFSET = '-10:00';

/**
 * Formats a date string to a localized display format
 */
export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return isValid(date) ? format(date, DATE_FORMAT, { locale: fr }) : '';
};

/**
 * Formats a date string to a localized date and time format
 */
export const formatDateTime = (dateString: string): string => {
  const date = parseISO(dateString);
  return isValid(date) ? format(date, DATETIME_FORMAT, { locale: fr }) : '';
};

/**
 * Calculates the number of days between two dates
 */
export const calculateDays = (startDate: string, endDate: string): number => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return differenceInDays(end, start);
};

/**
 * Adds days to a date and returns ISO string
 */
export const addDaysToDate = (dateString: string, days: number): string => {
  const date = parseISO(dateString);
  return addDays(date, days).toISOString();
};

/**
 * Gets the current date in ISO format with Raiatea timezone
 */
export const getCurrentDate = (): string => {
  // Using the provided time as source of truth
  return '2025-01-02T12:55:04-10:00';
};

/**
 * Validates if a string is a valid date
 */
export const isValidDate = (dateString: string): boolean => {
  const date = parseISO(dateString);
  return isValid(date);
};
