-- Créer la table vehicles si elle n'existe pas
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    license_plate TEXT NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    weekly_rate DECIMAL(10, 2) NOT NULL,
    monthly_rate DECIMAL(10, 2) NOT NULL,
    status vehicle_status NOT NULL DEFAULT 'available',
    category TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '{}',
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Désactiver temporairement RLS pour permettre l'insertion initiale
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;

-- Insérer quelques véhicules de test si la table est vide
INSERT INTO vehicles (
    brand,
    model,
    license_plate,
    year,
    daily_rate,
    status,
    features,
    image_url,
    description
)
SELECT 
    'Toyota',
    'Hilux',
    '123ABC',
    2023,
    12000,
    'available'::vehicle_status,
    '{"climatisation": true, "4x4": true, "bluetooth": true}'::jsonb,
    'https://example.com/toyota-hilux.jpg',
    'Pick-up double cabine, parfait pour les activités en plein air'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '123ABC');

INSERT INTO vehicles (
    brand,
    model,
    license_plate,
    year,
    daily_rate,
    status,
    features,
    image_url,
    description
)
SELECT 
    'Peugeot',
    '208',
    '456DEF',
    2024,
    8000,
    'available'::vehicle_status,
    '{"climatisation": true, "bluetooth": true, "camera_recul": true}'::jsonb,
    'https://example.com/peugeot-208.jpg',
    'Citadine économique et confortable'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '456DEF');

INSERT INTO vehicles (
    brand,
    model,
    license_plate,
    year,
    daily_rate,
    status,
    features,
    image_url,
    description
)
SELECT 
    'Dacia',
    'Duster',
    '789GHI',
    2023,
    10000,
    'available'::vehicle_status,
    '{"climatisation": true, "4x4": true, "bluetooth": true, "camera_recul": true}'::jsonb,
    'https://example.com/dacia-duster.jpg',
    'SUV compact et polyvalent, idéal pour explorer l''île'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '789GHI');

INSERT INTO vehicles (
    brand,
    model,
    license_plate,
    year,
    daily_rate,
    status,
    features,
    image_url,
    description
)
SELECT 
    'Renault',
    'Clio',
    'ABC123',
    2024,
    7500,
    'available'::vehicle_status,
    '{"climatisation": true, "bluetooth": true, "camera_recul": true, "gps": true}'::jsonb,
    'https://example.com/renault-clio.jpg',
    'Petite citadine moderne et économique'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'ABC123');

-- Réactiver RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Supprimer la politique existante si elle existe
DROP POLICY IF EXISTS "Enable read access for all users" ON vehicles;

-- Créer une nouvelle politique
CREATE POLICY "Enable read access for all users" ON vehicles
FOR ALL
USING (true)
WITH CHECK (true);

-- Vérifier que la table a été créée et contient des données
SELECT * FROM vehicles;
