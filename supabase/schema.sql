-- Create custom types
CREATE TYPE vehicle_status AS ENUM ('available', 'rented', 'maintenance');
CREATE TYPE bungalow_status AS ENUM ('available', 'occupied', 'maintenance');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create a table for user profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
    PRIMARY KEY (id)
);

-- Create a table for vehicles
CREATE TABLE vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
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
CREATE TABLE bungalows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
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

-- Create a table for clients
CREATE TABLE clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
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
CREATE TABLE reservations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
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

-- Create indexes for better performance
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_bungalows_status ON bungalows(status);
CREATE INDEX idx_reservations_dates ON reservations(start_date, end_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_clients_email ON clients(email);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bungalows ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: only authenticated users can view profiles, only self can update
CREATE POLICY "View profiles for authenticated users only" 
    ON profiles FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);

-- Vehicles: authenticated users can view, only staff can modify
CREATE POLICY "View vehicles for authenticated users only" 
    ON vehicles FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Staff can insert vehicles" 
    ON vehicles FOR INSERT 
    TO authenticated 
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'staff')
    ));

CREATE POLICY "Staff can update vehicles" 
    ON vehicles FOR UPDATE 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'staff')
    ));

-- Similar policies for bungalows
CREATE POLICY "View bungalows for authenticated users only" 
    ON bungalows FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Staff can insert bungalows" 
    ON bungalows FOR INSERT 
    TO authenticated 
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'staff')
    ));

CREATE POLICY "Staff can update bungalows" 
    ON bungalows FOR UPDATE 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'staff')
    ));

-- Clients: authenticated users can view and modify
CREATE POLICY "View clients for authenticated users only" 
    ON clients FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Staff can insert clients" 
    ON clients FOR INSERT 
    TO authenticated 
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'staff')
    ));

CREATE POLICY "Staff can update clients" 
    ON clients FOR UPDATE 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'staff')
    ));

-- Reservations: authenticated users can view and modify
CREATE POLICY "View reservations for authenticated users only" 
    ON reservations FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Staff can insert reservations" 
    ON reservations FOR INSERT 
    TO authenticated 
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'staff')
    ));

CREATE POLICY "Staff can update reservations" 
    ON reservations FOR UPDATE 
    TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'staff')
    ));
