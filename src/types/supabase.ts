export type VehicleStatus = 'available' | 'rented' | 'maintenance';
export type BungalowStatus = 'available' | 'occupied' | 'maintenance';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type UserRole = 'admin' | 'staff';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'check';
export type CommissionType = 'to_refund' | 'to_receive' | 'none';

export interface Profile {
  id: string;
  updated_at: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
}

export interface Client {
  id: string;
  title: string;
  first_name: string;
  last_name: string;
  spouse_name?: string;
  email_title?: string;
  company?: string;
  address?: string;
  address_complement?: string;
  postal_code?: string;
  city?: string;
  country: string;
  language: string;
  phone_home?: string;
  phone_mobile?: string;
  phone_other?: string;
  email?: string;
  no_email: boolean;
  family_status?: string;
  birth_date?: string;
  preferences?: string;
  comments?: string;
  creation_date: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  license_plate: string;
  daily_rate: number;
  status: VehicleStatus;
  description?: string;
  features?: string[];
  image_url?: string;
}

export interface Bungalow {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string | null;
  capacity: number;
  daily_rate: number;
  status: BungalowStatus;
  features: {
    bedrooms: number;
    bathrooms: number;
    aircon: boolean;
    wifi: boolean;
  } | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  notes: string | null;
  image_url: string | null;
}

export interface Reservation {
  id: string;
  client_id: string;
  vehicle_id?: string;
  bungalow_id?: string;
  start_date: string;
  end_date: string;
  status: ReservationStatus;
  total_amount: number;
  deposit_amount?: number;
  notes?: string;
  source?: string;
  file_number?: string;
  is_simulation?: boolean;
  adults?: number;
  children?: number;
  check_in_time?: string;
  check_out_time?: string;
  rate_per_night?: number;
  tax_rate?: number;
  commission_rate?: number;
  commission_type?: CommissionType;
  commission_amount?: number;
  subtotal?: number;
  tax_amount?: number;
  payment_schedule?: PaymentSchedule[];
}

export interface PaymentSchedule {
  date: Date;
  amount: number;
  is_paid: boolean;
  notes?: string;
}

export interface Invoice {
  id: string;
  reservation_id: string;
  client_id: string;
  number: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  company_details: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  client_details: {
    client_id: string;
  };
}

export interface Payment {
  id: string;
  created_at: string;
  updated_at: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number: string | null;
  notes: string | null;
}

export interface InvoiceItem {
  id: string;
  created_at: string;
  updated_at: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: 'vehicle_rental' | 'bungalow_rental' | 'extra_service';
  item_reference_id: string | null;
  tax_rate: number;
}

export interface CompanySettings {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  tax_number: string | null;
  bank_details: Record<string, any> | null;
  logo_url: string | null;
  invoice_footer: string | null;
  default_tax_rate: number;
  invoice_prefix: string;
  invoice_number_sequence: number;
}
