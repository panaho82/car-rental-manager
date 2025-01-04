-- Supprimer les tables existantes si nécessaire (dans l'ordre inverse des dépendances)
drop table if exists public.reservation_versions cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.payments cascade;
drop table if exists public.documents cascade;
drop table if exists public.reservations cascade;
drop table if exists public.bungalows cascade;
drop table if exists public.vehicles cascade;
drop table if exists public.clients cascade;

-- Table clients
create table if not exists public.clients (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    first_name text not null,
    last_name text not null,
    email text,
    mobile_phone text,
    address text,
    postal_code text,
    country text,
    comments text
);

-- Table vehicles
create table if not exists public.vehicles (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    brand text not null,
    model text not null,
    license_plate text not null,
    year integer,
    daily_rate integer not null,
    status text not null default 'available',
    description text,
    features jsonb,
    image_url text
);

-- Table bungalows
create table if not exists public.bungalows (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    description text,
    capacity integer not null,
    daily_rate integer not null,
    status text not null default 'available',
    features jsonb,
    image_url text,
    notes text,
    last_maintenance timestamp with time zone,
    next_maintenance timestamp with time zone
);

-- Table reservations
create table if not exists public.reservations (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    client_id uuid references public.clients(id),
    vehicle_id uuid references public.vehicles(id),
    bungalow_id uuid references public.bungalows(id),
    start_date timestamp with time zone not null,
    end_date timestamp with time zone not null,
    status text not null default 'pending',
    total_amount integer not null,
    deposit_amount integer,
    notes text,
    source text,
    file_number text,
    is_simulation boolean default false,
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

-- Table documents (devis et factures)
create table if not exists public.documents (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    reservation_id uuid references public.reservations(id),
    type text not null, -- 'quote' ou 'invoice'
    number text not null,
    date timestamp with time zone not null,
    due_date timestamp with time zone,
    status text not null default 'draft', -- 'draft', 'sent', 'paid', 'cancelled'
    subtotal integer not null,
    tax_rate numeric(5,2),
    tax_amount integer,
    total_amount integer not null,
    notes text,
    terms text,
    footer text,
    company_details jsonb, -- Informations de l'entreprise au moment de la création
    client_details jsonb   -- Informations du client au moment de la création
);

-- Table payments
create table if not exists public.payments (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    reservation_id uuid references public.reservations(id),
    document_id uuid references public.documents(id),
    amount integer not null,
    payment_date timestamp with time zone not null,
    payment_method text not null,
    reference_number text,
    notes text
);

-- Activer RLS sur toutes les tables
alter table public.clients enable row level security;
alter table public.vehicles enable row level security;
alter table public.bungalows enable row level security;
alter table public.reservations enable row level security;
alter table public.documents enable row level security;
alter table public.payments enable row level security;

-- Créer les politiques pour la table clients
drop policy if exists "Utilisateurs authentifiés peuvent lire les clients" on public.clients;
create policy "Utilisateurs authentifiés peuvent lire les clients"
on public.clients for select
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent créer des clients" on public.clients;
create policy "Utilisateurs authentifiés peuvent créer des clients"
on public.clients for insert
to authenticated
with check (true);

drop policy if exists "Utilisateurs authentifiés peuvent modifier les clients" on public.clients;
create policy "Utilisateurs authentifiés peuvent modifier les clients"
on public.clients for update
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent supprimer les clients" on public.clients;
create policy "Utilisateurs authentifiés peuvent supprimer les clients"
on public.clients for delete
to authenticated
using (true);

-- Créer les politiques pour la table vehicles
drop policy if exists "Utilisateurs authentifiés peuvent lire les véhicules" on public.vehicles;
create policy "Utilisateurs authentifiés peuvent lire les véhicules"
on public.vehicles for select
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent créer des véhicules" on public.vehicles;
create policy "Utilisateurs authentifiés peuvent créer des véhicules"
on public.vehicles for insert
to authenticated
with check (true);

drop policy if exists "Utilisateurs authentifiés peuvent modifier les véhicules" on public.vehicles;
create policy "Utilisateurs authentifiés peuvent modifier les véhicules"
on public.vehicles for update
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent supprimer les véhicules" on public.vehicles;
create policy "Utilisateurs authentifiés peuvent supprimer les véhicules"
on public.vehicles for delete
to authenticated
using (true);

-- Créer les politiques pour la table bungalows
drop policy if exists "Utilisateurs authentifiés peuvent lire les bungalows" on public.bungalows;
create policy "Utilisateurs authentifiés peuvent lire les bungalows"
on public.bungalows for select
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent créer des bungalows" on public.bungalows;
create policy "Utilisateurs authentifiés peuvent créer des bungalows"
on public.bungalows for insert
to authenticated
with check (true);

drop policy if exists "Utilisateurs authentifiés peuvent modifier les bungalows" on public.bungalows;
create policy "Utilisateurs authentifiés peuvent modifier les bungalows"
on public.bungalows for update
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent supprimer les bungalows" on public.bungalows;
create policy "Utilisateurs authentifiés peuvent supprimer les bungalows"
on public.bungalows for delete
to authenticated
using (true);

-- Créer les politiques pour la table reservations
drop policy if exists "Utilisateurs authentifiés peuvent lire les réservations" on public.reservations;
create policy "Utilisateurs authentifiés peuvent lire les réservations"
on public.reservations for select
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent créer des réservations" on public.reservations;
create policy "Utilisateurs authentifiés peuvent créer des réservations"
on public.reservations for insert
to authenticated
with check (true);

drop policy if exists "Utilisateurs authentifiés peuvent modifier les réservations" on public.reservations;
create policy "Utilisateurs authentifiés peuvent modifier les réservations"
on public.reservations for update
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent supprimer les réservations" on public.reservations;
create policy "Utilisateurs authentifiés peuvent supprimer les réservations"
on public.reservations for delete
to authenticated
using (true);

-- Créer les politiques pour la table documents
drop policy if exists "Utilisateurs authentifiés peuvent lire les documents" on public.documents;
create policy "Utilisateurs authentifiés peuvent lire les documents"
on public.documents for select
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent créer des documents" on public.documents;
create policy "Utilisateurs authentifiés peuvent créer des documents"
on public.documents for insert
to authenticated
with check (true);

drop policy if exists "Utilisateurs authentifiés peuvent modifier les documents" on public.documents;
create policy "Utilisateurs authentifiés peuvent modifier les documents"
on public.documents for update
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent supprimer les documents" on public.documents;
create policy "Utilisateurs authentifiés peuvent supprimer les documents"
on public.documents for delete
to authenticated
using (true);

-- Créer les politiques pour la table payments
drop policy if exists "Utilisateurs authentifiés peuvent lire les paiements" on public.payments;
create policy "Utilisateurs authentifiés peuvent lire les paiements"
on public.payments for select
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent créer des paiements" on public.payments;
create policy "Utilisateurs authentifiés peuvent créer des paiements"
on public.payments for insert
to authenticated
with check (true);

drop policy if exists "Utilisateurs authentifiés peuvent modifier les paiements" on public.payments;
create policy "Utilisateurs authentifiés peuvent modifier les paiements"
on public.payments for update
to authenticated
using (true);

drop policy if exists "Utilisateurs authentifiés peuvent supprimer les paiements" on public.payments;
create policy "Utilisateurs authentifiés peuvent supprimer les paiements"
on public.payments for delete
to authenticated
using (true);
