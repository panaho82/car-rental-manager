-- Create invoice status type
DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'cancelled', 'overdue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment method type
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'card', 'bank_transfer', 'check');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    reservation_id UUID REFERENCES reservations(id) ON DELETE RESTRICT,
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT NOT NULL,
    status invoice_status DEFAULT 'draft',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(4,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    company_details JSONB NOT NULL,
    client_details JSONB NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE RESTRICT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method payment_method NOT NULL,
    reference_number TEXT,
    notes TEXT
);

-- Create invoice_items table for detailed invoice lines
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    item_type TEXT NOT NULL, -- 'vehicle_rental', 'bungalow_rental', 'extra_service'
    item_reference_id UUID, -- Can reference vehicle_id or bungalow_id
    tax_rate DECIMAL(4,2) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Invoices policies
CREATE POLICY "Enable all operations for service role" ON invoices
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON invoices
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable all for authenticated users" ON invoices
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Payments policies
CREATE POLICY "Enable all operations for service role" ON payments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON payments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable all for authenticated users" ON payments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Invoice items policies
CREATE POLICY "Enable all operations for service role" ON invoice_items
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON invoice_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable all for authenticated users" ON invoice_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add company settings table for invoice details
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    company_name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    tax_number TEXT,
    bank_details JSONB,
    logo_url TEXT,
    invoice_footer TEXT,
    default_tax_rate DECIMAL(4,2) DEFAULT 0,
    invoice_prefix TEXT DEFAULT 'INV-',
    invoice_number_sequence INTEGER DEFAULT 1
);

-- Enable RLS for company settings
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for company settings
CREATE POLICY "Enable all operations for service role" ON company_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON company_settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Insert initial company settings
INSERT INTO company_settings (
    company_name,
    address,
    phone,
    email,
    website,
    tax_number,
    bank_details,
    invoice_footer,
    default_tax_rate
) VALUES (
    'Raiatea Rent Car',
    'Uturoa, Raiatea, Polynésie française',
    '+689 87 XX XX XX',
    'contact@raiatea-rentcar.com',
    'www.raiatea-rentcar.com',
    'TAHITI XXXXXXXXX',
    '{"bank_name": "Banque de Polynésie", "account_number": "XXXXX", "iban": "XXXXX"}'::jsonb,
    'Merci de votre confiance !',
    13.0
) ON CONFLICT DO NOTHING;
