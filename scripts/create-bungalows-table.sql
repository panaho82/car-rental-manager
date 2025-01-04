-- Créer la table bungalows si elle n'existe pas
CREATE TABLE IF NOT EXISTS bungalows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    daily_rate DECIMAL(10, 2) NOT NULL,
    weekly_rate DECIMAL(10, 2) NOT NULL,
    monthly_rate DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Désactiver temporairement RLS pour permettre l'insertion initiale
ALTER TABLE bungalows DISABLE ROW LEVEL SECURITY;

-- Insérer quelques bungalows de test si la table est vide
INSERT INTO bungalows (
    name, 
    description, 
    capacity,
    daily_rate,
    weekly_rate,
    monthly_rate,
    status,
    created_at,
    updated_at
)
SELECT 
    'Bungalow Plage',
    'Vue sur la plage',
    4, -- capacité
    15000, -- tarif journalier
    105000, -- tarif hebdomadaire
    450000, -- tarif mensuel
    'available',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM bungalows WHERE name = 'Bungalow Plage');

INSERT INTO bungalows (
    name, 
    description, 
    capacity,
    daily_rate,
    weekly_rate,
    monthly_rate,
    status,
    created_at,
    updated_at
)
SELECT 
    'Bungalow Jardin',
    'Vue sur le jardin',
    2, -- capacité
    12000, -- tarif journalier
    84000, -- tarif hebdomadaire
    360000, -- tarif mensuel
    'available',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM bungalows WHERE name = 'Bungalow Jardin');

-- Réactiver RLS
ALTER TABLE bungalows ENABLE ROW LEVEL SECURITY;

-- Supprimer la politique existante si elle existe
DROP POLICY IF EXISTS "Enable read access for all users" ON bungalows;

-- Créer une nouvelle politique
CREATE POLICY "Enable read access for all users" ON bungalows
FOR ALL
USING (true)
WITH CHECK (true);

-- Vérifier que la table a été créée et contient des données
SELECT * FROM bungalows;
