-- Ajouter la colonne description à la table vehicles si elle n'existe pas déjà
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'vehicles' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.vehicles ADD COLUMN description text;
    END IF;
END $$;
