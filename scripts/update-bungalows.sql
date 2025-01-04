-- Sauvegarde des données existantes
CREATE TABLE IF NOT EXISTS public.bungalows_backup AS SELECT * FROM public.bungalows;
CREATE TABLE IF NOT EXISTS public.reservations_backup AS SELECT * FROM public.reservations;
CREATE TABLE IF NOT EXISTS public.payments_backup AS SELECT * FROM public.payments;

-- Désactiver les politiques RLS temporairement
ALTER TABLE public.bungalows DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent lire les bungalows" ON public.bungalows;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent créer des bungalows" ON public.bungalows;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent modifier les bungalows" ON public.bungalows;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent supprimer les bungalows" ON public.bungalows;

-- Supprimer les tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.reservations;
DROP TABLE IF EXISTS public.bungalows;

-- Recréer la table bungalows avec la nouvelle structure
CREATE TABLE IF NOT EXISTS public.bungalows (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    name text NOT NULL,
    description text,
    capacity integer NOT NULL,
    daily_rate integer NOT NULL,
    status text NOT NULL DEFAULT 'available',
    features jsonb,
    image_url text,
    notes text,
    last_maintenance timestamp with time zone,
    next_maintenance timestamp with time zone
);

-- Recréer la table reservations
CREATE TABLE IF NOT EXISTS public.reservations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_id uuid REFERENCES public.clients(id),
    vehicle_id uuid REFERENCES public.vehicles(id),
    bungalow_id uuid REFERENCES public.bungalows(id),
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    total_amount integer NOT NULL,
    deposit_amount integer,
    notes text,
    source text,
    file_number text,
    is_simulation boolean DEFAULT false,
    adults integer,
    children integer,
    check_in_time time,
    check_out_time time,
    rate_per_night integer,
    tax_rate numeric(5,2),
    commission_rate numeric(5,2),
    commission_type text,
    commission_amount integer,
    subtotal integer,
    tax_amount integer
);

-- Recréer la table payments
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    reservation_id uuid REFERENCES public.reservations(id),
    amount integer NOT NULL,
    payment_date timestamp with time zone NOT NULL,
    payment_method text NOT NULL,
    reference_number text,
    notes text
);

-- Restaurer les données dans l'ordre des dépendances
INSERT INTO public.bungalows (
    id, created_at, updated_at, name, description, capacity,
    daily_rate, status, features, image_url
)
SELECT
    id, created_at, updated_at, name, description, capacity,
    daily_rate, status, features, image_url
FROM public.bungalows_backup;

INSERT INTO public.reservations (
    id, created_at, updated_at, client_id, vehicle_id, bungalow_id,
    start_date, end_date, status, total_amount, deposit_amount, notes,
    source, file_number, is_simulation, adults, children, check_in_time,
    check_out_time, rate_per_night, tax_rate, commission_rate,
    commission_type, commission_amount, subtotal, tax_amount
)
SELECT
    id, created_at, updated_at, client_id, vehicle_id, bungalow_id,
    start_date, end_date, status, total_amount, deposit_amount, notes,
    source, file_number, is_simulation, adults, children, check_in_time,
    check_out_time, rate_per_night, tax_rate, commission_rate,
    commission_type, commission_amount, subtotal, tax_amount
FROM public.reservations_backup;

INSERT INTO public.payments (
    id, created_at, updated_at, reservation_id,
    amount, payment_date, payment_method, reference_number, notes
)
SELECT
    id, created_at, updated_at, reservation_id,
    amount, payment_date, payment_method, reference_number, notes
FROM public.payments_backup;

-- Réactiver RLS
ALTER TABLE public.bungalows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Recréer les politiques pour les bungalows
CREATE POLICY "Utilisateurs authentifiés peuvent lire les bungalows"
ON public.bungalows FOR SELECT TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent créer des bungalows"
ON public.bungalows FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifiés peuvent modifier les bungalows"
ON public.bungalows FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent supprimer les bungalows"
ON public.bungalows FOR DELETE TO authenticated USING (true);

-- Recréer les politiques pour les réservations
CREATE POLICY "Utilisateurs authentifiés peuvent lire les réservations"
ON public.reservations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent créer des réservations"
ON public.reservations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifiés peuvent modifier les réservations"
ON public.reservations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent supprimer les réservations"
ON public.reservations FOR DELETE TO authenticated USING (true);

-- Recréer les politiques pour les paiements
CREATE POLICY "Utilisateurs authentifiés peuvent lire les paiements"
ON public.payments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent créer des paiements"
ON public.payments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifiés peuvent modifier les paiements"
ON public.payments FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent supprimer les paiements"
ON public.payments FOR DELETE TO authenticated USING (true);

-- Supprimer les tables de sauvegarde
DROP TABLE IF EXISTS public.payments_backup;
DROP TABLE IF EXISTS public.reservations_backup;
DROP TABLE IF EXISTS public.bungalows_backup;
