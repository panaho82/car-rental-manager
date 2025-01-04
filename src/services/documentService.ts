import { supabase } from '../utils/supabaseClient';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Reservation {
  id: string;
  startDate: string;
  endDate: string;
  price: number;
  included?: boolean;
  vehicle?: {
    brand: string;
    model: string;
  };
  bungalow?: {
    name: string;
  };
}

export interface DocumentData {
  type: 'quote' | 'invoice';
  client: string;
  resources: string[];
  vehicleReservations: Reservation[];
  bungalowReservations: Reservation[];
  notes?: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'paid';
  createdAt: string;
}

export const documentService = {
  async getReservations(clientId: string, type: 'vehicles' | 'bungalows'): Promise<Reservation[]> {
    try {
      let query = supabase
        .from(`${type}_reservations`)
        .select(`
          id,
          start_date,
          end_date,
          price,
          ${type === 'vehicles' ? 'vehicle:vehicles(brand, model)' : 'bungalow:bungalows(name)'}
        `)
        .eq('client_id', clientId);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(reservation => ({
        id: reservation.id,
        startDate: reservation.start_date,
        endDate: reservation.end_date,
        price: reservation.price,
        included: false,
        ...(type === 'vehicles' ? { vehicle: reservation.vehicle } : { bungalow: reservation.bungalow })
      }));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  },

  calculateTotal(vehicleReservations: Reservation[], bungalowReservations: Reservation[]): number {
    const vehiclesTotal = vehicleReservations
      .filter(r => r.included)
      .reduce((sum, r) => sum + r.price, 0);

    const bungalowsTotal = bungalowReservations
      .filter(r => r.included)
      .reduce((sum, r) => sum + r.price, 0);

    return vehiclesTotal + bungalowsTotal;
  },

  async createDocument(data: DocumentData) {
    try {
      const { error } = await supabase
        .from('documents')
        .insert([
          {
            type: data.type,
            clientId: data.client,
            resources: data.resources,
            vehicleReservations: data.vehicleReservations,
            bungalowReservations: data.bungalowReservations,
            notes: data.notes,
            totalAmount: data.totalAmount,
            status: 'draft',
            createdAt: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  generateDocumentNumber(type: 'quote' | 'invoice', id: number) {
    const year = new Date().getFullYear();
    const prefix = type === 'quote' ? 'D' : 'F';
    return `${prefix}${year}-${id.toString().padStart(4, '0')}`;
  }
};
