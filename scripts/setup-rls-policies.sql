-- Activer RLS sur toutes les tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bungalows ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;

-- Politique pour vehicles : permettre la lecture à tous
CREATE POLICY "Enable read access for all users" ON vehicles
    FOR SELECT USING (true);

-- Politique pour bungalows : permettre la lecture à tous
CREATE POLICY "Enable read access for all users" ON bungalows
    FOR SELECT USING (true);

-- Politique pour clients : permettre la lecture à tous
CREATE POLICY "Enable read access for all users" ON clients
    FOR SELECT USING (true);

-- Politique pour documents : permettre la lecture et l'écriture à tous
CREATE POLICY "Enable read access for all users" ON documents
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON documents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON documents
    FOR UPDATE USING (true);

-- Politique pour company_info : permettre la lecture à tous
CREATE POLICY "Enable read access for all users" ON company_info
    FOR SELECT USING (true);
