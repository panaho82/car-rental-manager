-- Supprimer les objets existants si nécessaire
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS company_info CASCADE;
DROP SEQUENCE IF EXISTS invoice_number_seq CASCADE;
DROP SEQUENCE IF EXISTS quote_number_seq CASCADE;

-- Extension pour UUID si pas déjà installée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table pour stocker les informations de l'entreprise
CREATE TABLE company_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    rc_number TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    logo_url TEXT
);

-- Séquences pour les numéros de facture et devis
CREATE SEQUENCE invoice_number_seq START WITH 1;
CREATE SEQUENCE quote_number_seq START WITH 1;

-- Table pour les documents (factures et devis)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'quote')),
    document_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    client_id UUID REFERENCES clients(id),
    reservation_id UUID REFERENCES reservations(id),
    vehicle_id UUID REFERENCES vehicles(id),
    bungalow_id UUID REFERENCES bungalows(id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    number_of_days INTEGER NOT NULL,
    total_ht DECIMAL(10, 2) NOT NULL,
    tva_rate DECIMAL(5, 2) NOT NULL,
    tva_amount DECIMAL(10, 2) NOT NULL,
    total_ttc DECIMAL(10, 2) NOT NULL,
    payment_method TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'draft',
    notes TEXT,
    contract_number TEXT,
    UNIQUE(document_type, document_number)
);

-- Fonction pour générer le numéro de document
CREATE OR REPLACE FUNCTION generate_document_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.document_type = 'invoice' THEN
        NEW.document_number := TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
            LPAD(nextval('invoice_number_seq')::TEXT, 4, '0');
    ELSE
        NEW.document_number := TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
            LPAD(nextval('quote_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de document
DROP TRIGGER IF EXISTS set_document_number ON documents;
CREATE TRIGGER set_document_number
    BEFORE INSERT ON documents
    FOR EACH ROW
    EXECUTE FUNCTION generate_document_number();

-- Insérer les informations de l'entreprise
INSERT INTO company_info (
    name, rc_number, address, postal_code, city, phone, email
) VALUES (
    'RAIATEA RENT À CAR',
    'R.C 07238 B - NR TAHITI 834119',
    'BP 160',
    '98735',
    'UTUROA - RAIATEA',
    '+689.40663535',
    'raiatearentcar@mail.pf'
) ON CONFLICT DO NOTHING;
