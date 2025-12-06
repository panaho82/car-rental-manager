-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE DES SOCIÉTÉS (TENANTS)
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Polynésie Française',
    rc_number TEXT,
    n_tahiti TEXT,
    logo_url TEXT,
    website TEXT,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Active la sécurité
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 2. AJOUT DE company_id AUX TABLES EXISTANTES
-- Profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Vehicles
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Bungalows
ALTER TABLE bungalows 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Reservations
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Documents (Invoices/Quotes)
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);


-- 3. CRÉATION DES INDEX (Performance)
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_bungalows_company ON bungalows(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_reservations_company ON reservations(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);


-- 4. FONCTION UTILITAIRE DE SÉCURITÉ
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. POLITIQUES DE SÉCURITÉ (RLS) - ISOLATION DES DONNÉES

-- A. Companies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
CREATE POLICY "Users can view their own company"
ON companies FOR SELECT
USING (id = get_user_company_id());

-- IMPORTANT : Autoriser la création pour l'inscription (Sign Up)
DROP POLICY IF EXISTS "Authenticated users can create a company" ON companies;
CREATE POLICY "Authenticated users can create a company"
ON companies FOR INSERT
TO authenticated
WITH CHECK (true);


-- B. Profiles
DROP POLICY IF EXISTS "Users can view profiles from same company" ON profiles;
CREATE POLICY "Users can view profiles from same company"
ON profiles FOR SELECT
USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);


-- C. Vehicles
DROP POLICY IF EXISTS "View vehicles for authenticated users only" ON vehicles;
DROP POLICY IF EXISTS "Staff can insert vehicles" ON vehicles;
DROP POLICY IF EXISTS "Staff can update vehicles" ON vehicles;

CREATE POLICY "Users can view company vehicles" ON vehicles FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert company vehicles" ON vehicles FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update company vehicles" ON vehicles FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete company vehicles" ON vehicles FOR DELETE USING (company_id = get_user_company_id());


-- D. Bungalows
DROP POLICY IF EXISTS "View bungalows for authenticated users only" ON bungalows;
DROP POLICY IF EXISTS "Staff can insert bungalows" ON bungalows;
DROP POLICY IF EXISTS "Staff can update bungalows" ON bungalows;

CREATE POLICY "Users can view company bungalows" ON bungalows FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert company bungalows" ON bungalows FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update company bungalows" ON bungalows FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete company bungalows" ON bungalows FOR DELETE USING (company_id = get_user_company_id());


-- E. Clients
DROP POLICY IF EXISTS "View clients for authenticated users only" ON clients;
DROP POLICY IF EXISTS "Staff can insert clients" ON clients;
DROP POLICY IF EXISTS "Staff can update clients" ON clients;

CREATE POLICY "Users can view company clients" ON clients FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert company clients" ON clients FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update company clients" ON clients FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete company clients" ON clients FOR DELETE USING (company_id = get_user_company_id());


-- F. Reservations
DROP POLICY IF EXISTS "View reservations for authenticated users only" ON reservations;
DROP POLICY IF EXISTS "Staff can insert reservations" ON reservations;
DROP POLICY IF EXISTS "Staff can update reservations" ON reservations;

CREATE POLICY "Users can view company reservations" ON reservations FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert company reservations" ON reservations FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update company reservations" ON reservations FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete company reservations" ON reservations FOR DELETE USING (company_id = get_user_company_id());


-- G. Documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company documents" ON documents FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert company documents" ON documents FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update company documents" ON documents FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete company documents" ON documents FOR DELETE USING (company_id = get_user_company_id());

