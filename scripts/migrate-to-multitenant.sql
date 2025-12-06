-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TRANSFORMER company_info EN TABLE TENANTS (COMPANIES)
-- On renomme pour plus de clarté, ou on crée si elle n'existe pas
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
    rc_number TEXT, -- Numéro registre commerce
    n_tahiti TEXT, -- Spécifique Tahiti
    logo_url TEXT,
    website TEXT,
    settings JSONB DEFAULT '{}'::jsonb -- Pour configurer devise, format date, etc.
);

-- Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 2. UPDATE PROFILES TO LINK TO A COMPANY
-- Chaque utilisateur appartient à une société
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- 3. ADD company_id TO ALL DATA TABLES
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

-- 4. UPDATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_bungalows_company ON bungalows(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_reservations_company ON reservations(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);

-- 5. DEFINE NEW RLS POLICIES (ISOLATION PER COMPANY)

-- Helper function to get current user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- COMPANIES: Users can view ONLY their own company
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
CREATE POLICY "Users can view their own company"
ON companies FOR SELECT
USING (id = get_user_company_id());

-- PROFILES: Users can view profiles from their company
DROP POLICY IF EXISTS "Users can view profiles from same company" ON profiles;
CREATE POLICY "Users can view profiles from same company"
ON profiles FOR SELECT
USING (company_id = get_user_company_id());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- VEHICLES
DROP POLICY IF EXISTS "View vehicles for authenticated users only" ON vehicles;
DROP POLICY IF EXISTS "Staff can insert vehicles" ON vehicles;
DROP POLICY IF EXISTS "Staff can update vehicles" ON vehicles;

CREATE POLICY "Users can view company vehicles"
ON vehicles FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company vehicles"
ON vehicles FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company vehicles"
ON vehicles FOR UPDATE
USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company vehicles"
ON vehicles FOR DELETE
USING (company_id = get_user_company_id());

-- BUNGALOWS
DROP POLICY IF EXISTS "View bungalows for authenticated users only" ON bungalows;
DROP POLICY IF EXISTS "Staff can insert bungalows" ON bungalows;
DROP POLICY IF EXISTS "Staff can update bungalows" ON bungalows;

CREATE POLICY "Users can view company bungalows"
ON bungalows FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company bungalows"
ON bungalows FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company bungalows"
ON bungalows FOR UPDATE
USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company bungalows"
ON bungalows FOR DELETE
USING (company_id = get_user_company_id());

-- CLIENTS
DROP POLICY IF EXISTS "View clients for authenticated users only" ON clients;
DROP POLICY IF EXISTS "Staff can insert clients" ON clients;
DROP POLICY IF EXISTS "Staff can update clients" ON clients;

CREATE POLICY "Users can view company clients"
ON clients FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company clients"
ON clients FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company clients"
ON clients FOR UPDATE
USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company clients"
ON clients FOR DELETE
USING (company_id = get_user_company_id());

-- RESERVATIONS
DROP POLICY IF EXISTS "View reservations for authenticated users only" ON reservations;
DROP POLICY IF EXISTS "Staff can insert reservations" ON reservations;
DROP POLICY IF EXISTS "Staff can update reservations" ON reservations;

CREATE POLICY "Users can view company reservations"
ON reservations FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company reservations"
ON reservations FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company reservations"
ON reservations FOR UPDATE
USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company reservations"
ON reservations FOR DELETE
USING (company_id = get_user_company_id());

-- DOCUMENTS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company documents"
ON documents FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company documents"
ON documents FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company documents"
ON documents FOR UPDATE
USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company documents"
ON documents FOR DELETE
USING (company_id = get_user_company_id());

-- 6. MIGRATION DES DONNÉES EXISTANTES (POUR LE PREMIER TENANT)
-- Si la table company_info existait et contenait des données, on crée la première company
-- NOTE: À exécuter manuellement si nécessaire ou décommenter
/*
INSERT INTO companies (id, name, rc_number, address, postal_code, city, phone, email, logo_url)
SELECT id, name, rc_number, address, postal_code, city, phone, email, logo_url 
FROM company_info
ON CONFLICT DO NOTHING;

-- Assigner tout le monde à cette première company
DO $$
DECLARE
    first_company_id UUID;
BEGIN
    SELECT id INTO first_company_id FROM companies LIMIT 1;
    
    IF first_company_id IS NOT NULL THEN
        UPDATE profiles SET company_id = first_company_id WHERE company_id IS NULL;
        UPDATE vehicles SET company_id = first_company_id WHERE company_id IS NULL;
        UPDATE bungalows SET company_id = first_company_id WHERE company_id IS NULL;
        UPDATE clients SET company_id = first_company_id WHERE company_id IS NULL;
        UPDATE reservations SET company_id = first_company_id WHERE company_id IS NULL;
        UPDATE documents SET company_id = first_company_id WHERE company_id IS NULL;
    END IF;
END $$;
*/

