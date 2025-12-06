-- MASTER SETUP SCRIPT - SaaS Multi-tenant
-- Ce script initialise toute la base de données avec l'architecture Multi-tenant directement.

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('available', 'rented', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bungalow_status AS ENUM ('available', 'occupied', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 2. TABLE DES SOCIÉTÉS (TENANTS) - Le coeur du SaaS
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
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;


-- 3. TABLE UTILISATEURS (PROFILES)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
    company_id UUID REFERENCES companies(id)
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;


-- 4. AUTRES TABLES MÉTIERS
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company_id UUID REFERENCES companies(id) NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    license_plate TEXT NOT NULL,
    color TEXT,
    daily_rate DECIMAL(10,2) NOT NULL,
    status vehicle_status DEFAULT 'available',
    mileage INTEGER,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    next_maintenance TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    image_url TEXT
);
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS bungalows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company_id UUID REFERENCES companies(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    status bungalow_status DEFAULT 'available',
    features JSONB,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    next_maintenance TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    image_url TEXT
);
ALTER TABLE bungalows ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company_id UUID REFERENCES companies(id) NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    driver_license TEXT,
    nationality TEXT,
    passport_number TEXT,
    notes TEXT,
    blacklisted BOOLEAN DEFAULT false,
    blacklist_reason TEXT
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS reservations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company_id UUID REFERENCES companies(id) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
    bungalow_id UUID REFERENCES bungalows(id) ON DELETE RESTRICT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status reservation_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2),
    notes TEXT,
    CHECK (vehicle_id IS NOT NULL OR bungalow_id IS NOT NULL),
    CHECK (start_date < end_date)
);
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'quote')),
    document_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    client_id UUID REFERENCES clients(id),
    vehicle_id UUID REFERENCES vehicles(id),
    bungalow_id UUID REFERENCES bungalows(id),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    notes TEXT,
    details JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;


-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_bungalows_company ON bungalows(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_reservations_company ON reservations(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);


-- 6. FONCTION HELPER
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. POLITIQUES DE SÉCURITÉ (RLS)

-- COMPANIES
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
CREATE POLICY "Users can view their own company" ON companies FOR SELECT USING (id = get_user_company_id());
DROP POLICY IF EXISTS "Authenticated users can create a company" ON companies;
CREATE POLICY "Authenticated users can create a company" ON companies FOR INSERT TO authenticated WITH CHECK (true);

-- PROFILES
DROP POLICY IF EXISTS "Users can view profiles from same company" ON profiles;
CREATE POLICY "Users can view profiles from same company" ON profiles FOR SELECT USING (company_id = get_user_company_id());
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- VEHICLES
DROP POLICY IF EXISTS "Users can view company vehicles" ON vehicles;
CREATE POLICY "Users can view company vehicles" ON vehicles FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert company vehicles" ON vehicles FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update company vehicles" ON vehicles FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete company vehicles" ON vehicles FOR DELETE USING (company_id = get_user_company_id());

-- BUNGALOWS
DROP POLICY IF EXISTS "Users can view company bungalows" ON bungalows;
CREATE POLICY "Users can view company bungalows" ON bungalows FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert company bungalows" ON bungalows FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update company bungalows" ON bungalows FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete company bungalows" ON bungalows FOR DELETE USING (company_id = get_user_company_id());

-- CLIENTS
DROP POLICY IF EXISTS "Users can view company clients" ON clients;
CREATE POLICY "Users can view company clients" ON clients FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert company clients" ON clients FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update company clients" ON clients FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete company clients" ON clients FOR DELETE USING (company_id = get_user_company_id());

-- RESERVATIONS
DROP POLICY IF EXISTS "Users can view company reservations" ON reservations;
CREATE POLICY "Users can view company reservations" ON reservations FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert company reservations" ON reservations FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update company reservations" ON reservations FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete company reservations" ON reservations FOR DELETE USING (company_id = get_user_company_id());

-- DOCUMENTS
DROP POLICY IF EXISTS "Users can view company documents" ON documents;
CREATE POLICY "Users can view company documents" ON documents FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert company documents" ON documents FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update company documents" ON documents FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete company documents" ON documents FOR DELETE USING (company_id = get_user_company_id());

