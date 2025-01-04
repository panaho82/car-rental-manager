-- Drop existing policies
DROP POLICY IF EXISTS "View vehicles for authenticated users only" ON vehicles;
DROP POLICY IF EXISTS "Staff can insert vehicles" ON vehicles;
DROP POLICY IF EXISTS "Staff can update vehicles" ON vehicles;
DROP POLICY IF EXISTS "View bungalows for authenticated users only" ON bungalows;
DROP POLICY IF EXISTS "Staff can insert bungalows" ON bungalows;
DROP POLICY IF EXISTS "Staff can update bungalows" ON bungalows;

-- Create new policies for vehicles
CREATE POLICY "Enable all operations for service role" ON vehicles
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable select for authenticated users" ON vehicles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create new policies for bungalows
CREATE POLICY "Enable all operations for service role" ON bungalows
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable select for authenticated users" ON bungalows
    FOR SELECT
    USING (auth.role() = 'authenticated');
