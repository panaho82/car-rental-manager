-- Désactiver temporairement RLS pour la table vehicles
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent lire les véhicules" ON public.vehicles;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent créer des véhicules" ON public.vehicles;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent modifier les véhicules" ON public.vehicles;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent supprimer les véhicules" ON public.vehicles;

-- Créer les nouvelles politiques
CREATE POLICY "Utilisateurs authentifiés peuvent lire les véhicules"
ON public.vehicles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent créer des véhicules"
ON public.vehicles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifiés peuvent modifier les véhicules"
ON public.vehicles FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Utilisateurs authentifiés peuvent supprimer les véhicules"
ON public.vehicles FOR DELETE
TO authenticated
USING (true);

-- Réactiver RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
