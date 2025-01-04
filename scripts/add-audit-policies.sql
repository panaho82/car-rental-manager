-- Activer RLS sur la table audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent insérer des logs d'audit" ON public.audit_logs;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent lire les logs d'audit" ON public.audit_logs;

-- Créer les politiques pour la table audit_logs
CREATE POLICY "Utilisateurs authentifiés peuvent insérer des logs d'audit"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifiés peuvent lire les logs d'audit"
ON public.audit_logs FOR SELECT
TO authenticated
USING (true);

-- Supprimer les politiques existantes pour reservation_versions si elles existent
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent insérer des versions" ON public.reservation_versions;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent lire les versions" ON public.reservation_versions;

-- Créer les politiques pour la table reservation_versions
CREATE POLICY "Utilisateurs authentifiés peuvent insérer des versions"
ON public.reservation_versions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifiés peuvent lire les versions"
ON public.reservation_versions FOR SELECT
TO authenticated
USING (true);
