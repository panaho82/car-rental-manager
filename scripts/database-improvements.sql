-- Création des types ENUM pour les statuts
DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM (
        'pending',
        'confirmed',
        'cancelled',
        'completed',
        'no_show'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM (
        'available',
        'rented',
        'maintenance',
        'unavailable'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Création de la table d'historique des modifications
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    action text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    user_id uuid, -- ID de l'utilisateur qui a fait la modification
    ip_address text
);

-- Création de la table des versions de réservations
CREATE TABLE IF NOT EXISTS public.reservation_versions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    reservation_id uuid REFERENCES public.reservations(id),
    version_number integer NOT NULL,
    changes jsonb NOT NULL,
    user_id uuid,
    reason text
);

-- Fonction pour le trigger de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour le trigger d'audit
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        user_id,
        ip_address
    )
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE 
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
            WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD)
            ELSE NULL
        END,
        CASE 
            WHEN TG_OP = 'DELETE' THEN NULL
            ELSE to_jsonb(NEW)
        END,
        COALESCE(current_setting('app.current_user_id', true), NULL)::uuid,
        current_setting('app.client_ip', true)
    );
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour le versionnage des réservations
CREATE OR REPLACE FUNCTION track_reservation_versions()
RETURNS TRIGGER AS $$
DECLARE
    v_version_number integer;
BEGIN
    -- Obtenir le prochain numéro de version
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO v_version_number
    FROM public.reservation_versions
    WHERE reservation_id = NEW.id;

    -- Créer une nouvelle version
    INSERT INTO public.reservation_versions (
        reservation_id,
        version_number,
        changes,
        user_id
    )
    VALUES (
        NEW.id,
        v_version_number,
        jsonb_strip_nulls(to_jsonb(NEW)),
        COALESCE(current_setting('app.current_user_id', true), NULL)::uuid
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Application des triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.reservations;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS audit_reservations_trigger ON public.reservations;
CREATE TRIGGER audit_reservations_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS version_reservations_trigger ON public.reservations;
CREATE TRIGGER version_reservations_trigger
    AFTER INSERT OR UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION track_reservation_versions();

-- Mise à jour des colonnes de statut pour utiliser les ENUM
DO $$ 
BEGIN
    -- Mise à jour de la table reservations si elle existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reservations') THEN
        ALTER TABLE public.reservations ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE public.reservations ALTER COLUMN status TYPE reservation_status USING status::reservation_status;
        ALTER TABLE public.reservations ALTER COLUMN status SET DEFAULT 'pending'::reservation_status;
    END IF;

    -- Mise à jour de la table vehicles si elle existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicles') THEN
        ALTER TABLE public.vehicles ALTER COLUMN status DROP DEFAULT;
        ALTER TABLE public.vehicles ALTER COLUMN status TYPE vehicle_status USING status::vehicle_status;
        ALTER TABLE public.vehicles ALTER COLUMN status SET DEFAULT 'available'::vehicle_status;
    END IF;
END $$;

-- Ajout des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record 
ON public.audit_logs (table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON public.audit_logs (created_at);

CREATE INDEX IF NOT EXISTS idx_reservation_versions_reservation 
ON public.reservation_versions (reservation_id, version_number);

-- Ajout des politiques RLS pour les nouvelles tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs authentifiés peuvent lire les logs d'audit"
ON public.audit_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent lire les versions"
ON public.reservation_versions FOR SELECT
TO authenticated
USING (true);

-- Configuration des paramètres de session pour l'audit
CREATE OR REPLACE FUNCTION set_session_variables(user_id uuid, client_ip text)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, false);
    PERFORM set_config('app.client_ip', client_ip, false);
END;
$$ LANGUAGE plpgsql;
