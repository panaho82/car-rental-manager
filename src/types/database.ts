export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'staff'
        }
        Insert: {
          id: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'staff'
        }
        Update: {
          id?: string
          updated_at?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'staff'
        }
      }
      vehicles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          brand: string
          model: string
          year: number
          license_plate: string
          color: string | null
          daily_rate: number
          status: 'available' | 'rented' | 'maintenance'
          mileage: number | null
          last_maintenance: string | null
          next_maintenance: string | null
          notes: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          brand: string
          model: string
          year: number
          license_plate: string
          color?: string | null
          daily_rate: number
          status?: 'available' | 'rented' | 'maintenance'
          mileage?: number | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          notes?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          brand?: string
          model?: string
          year?: number
          license_plate?: string
          color?: string | null
          daily_rate?: number
          status?: 'available' | 'rented' | 'maintenance'
          mileage?: number | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          notes?: string | null
          image_url?: string | null
        }
      }
      bungalows: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          capacity: number
          daily_rate: number
          status: 'available' | 'occupied' | 'maintenance'
          features: Json | null
          last_maintenance: string | null
          next_maintenance: string | null
          notes: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          capacity: number
          daily_rate: number
          status?: 'available' | 'occupied' | 'maintenance'
          features?: Json | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          notes?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          capacity?: number
          daily_rate?: number
          status?: 'available' | 'occupied' | 'maintenance'
          features?: Json | null
          last_maintenance?: string | null
          next_maintenance?: string | null
          notes?: string | null
          image_url?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          address: string | null
          driver_license: string | null
          nationality: string | null
          passport_number: string | null
          notes: string | null
          blacklisted: boolean
          blacklist_reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          driver_license?: string | null
          nationality?: string | null
          passport_number?: string | null
          notes?: string | null
          blacklisted?: boolean
          blacklist_reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          driver_license?: string | null
          nationality?: string | null
          passport_number?: string | null
          notes?: string | null
          blacklisted?: boolean
          blacklist_reason?: string | null
        }
      }
      reservations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          client_id: string
          vehicle_id: string | null
          bungalow_id: string | null
          start_date: string
          end_date: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount: number
          deposit_amount: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          client_id: string
          vehicle_id?: string | null
          bungalow_id?: string | null
          start_date: string
          end_date: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount: number
          deposit_amount?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          client_id?: string
          vehicle_id?: string | null
          bungalow_id?: string | null
          start_date?: string
          end_date?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          total_amount?: number
          deposit_amount?: number | null
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      vehicle_status: 'available' | 'rented' | 'maintenance'
      bungalow_status: 'available' | 'occupied' | 'maintenance'
      reservation_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    }
  }
}
