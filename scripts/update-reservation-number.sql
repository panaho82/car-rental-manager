-- Ajouter la colonne reservation_number
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS reservation_number text;

-- Créer une fonction pour générer le numéro de réservation
CREATE OR REPLACE FUNCTION generate_reservation_number()
RETURNS trigger AS $$
DECLARE
    year text;
    sequence_number int;
BEGIN
    -- Obtenir l'année en cours
    year := to_char(CURRENT_DATE, 'YY');
    
    -- Obtenir le prochain numéro de séquence pour l'année en cours
    WITH sequence AS (
        SELECT COUNT(*) + 1 as next_num
        FROM public.reservations
        WHERE reservation_number LIKE 'RES' || year || '-%'
    )
    SELECT next_num INTO sequence_number FROM sequence;
    
    -- Formater le numéro de réservation (ex: RES23-0001)
    NEW.reservation_number := 'RES' || year || '-' || LPAD(sequence_number::text, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS set_reservation_number ON public.reservations;

-- Créer le trigger pour générer automatiquement le numéro de réservation
CREATE TRIGGER set_reservation_number
    BEFORE INSERT ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION generate_reservation_number();

-- Mettre à jour les réservations existantes avec un numéro
DO $$
DECLARE
    r RECORD;
    year text;
    counter int := 1;
BEGIN
    year := to_char(CURRENT_DATE, 'YY');
    FOR r IN SELECT id FROM public.reservations WHERE reservation_number IS NULL ORDER BY created_at
    LOOP
        UPDATE public.reservations 
        SET reservation_number = 'RES' || year || '-' || LPAD(counter::text, 4, '0')
        WHERE id = r.id;
        counter := counter + 1;
    END LOOP;
END $$;
