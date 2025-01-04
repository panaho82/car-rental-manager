-- Step 1: Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create custom types
DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('available', 'rented', 'maintenance');
    CREATE TYPE bungalow_status AS ENUM ('available', 'occupied', 'maintenance');
    CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Create tables
-- Create a table for user profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
    PRIMARY KEY (id)
);

-- Create a table for vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    license_plate TEXT UNIQUE NOT NULL,
    color TEXT,
    daily_rate DECIMAL(10,2) NOT NULL,
    status vehicle_status DEFAULT 'available',
    mileage INTEGER,
    last_maintenance TIMESTAMP WITH TIME ZONE,
    next_maintenance TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    image_url TEXT
);

-- Create a table for bungalows
CREATE TABLE IF NOT EXISTS bungalows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL UNIQUE,
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

-- Create a table for clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    driver_license TEXT,
    nationality TEXT,
    passport_number TEXT,
    notes TEXT,
    blacklisted BOOLEAN DEFAULT false,
    blacklist_reason TEXT
);

-- Create a table for reservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
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

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_bungalows_status ON bungalows(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Step 5: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bungalows ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies
-- Policies for service role (for our setup script)
CREATE POLICY "Enable all operations for service role" ON vehicles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all operations for service role" ON bungalows
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policies for authenticated users
CREATE POLICY "Enable read for authenticated users" ON vehicles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable read for authenticated users" ON bungalows
    FOR SELECT
    TO authenticated
    USING (true);

-- Step 7: Insert initial data
-- Insert vehicles
INSERT INTO vehicles (brand, model, year, license_plate, color, daily_rate, status, mileage)
VALUES 
    ('Toyota', 'Hilux', 2023, 'RRC001', 'Blanc', 15000, 'available', 5000),
    ('Hyundai', 'Tucson', 2023, 'RRC002', 'Noir', 12000, 'available', 3500)
ON CONFLICT (license_plate) DO NOTHING;

-- Insert bungalows
INSERT INTO bungalows (name, description, capacity, daily_rate, status, features)
VALUES 
    ('Fare Moana', 'Vue sur lagon, 2 chambres', 4, 25000, 'available', 
     '{"bedrooms": 2, "bathrooms": 1, "aircon": true, "wifi": true}'::jsonb),
    ('Fare Miti', 'Bord de plage, 1 chambre', 2, 20000, 'available',
     '{"bedrooms": 1, "bathrooms": 1, "aircon": true, "wifi": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;
