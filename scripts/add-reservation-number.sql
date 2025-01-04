-- Supprimer la colonne reservation_number existante
ALTER TABLE reservations
DROP COLUMN IF EXISTS reservation_number CASCADE;

-- Supprimer la séquence si elle existe
DROP SEQUENCE IF EXISTS reservation_number_seq CASCADE;

-- Créer une nouvelle séquence commençant à 1500
CREATE SEQUENCE reservation_number_seq
    START WITH 1500
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;

-- Ajouter la nouvelle colonne reservation_number
ALTER TABLE reservations
ADD COLUMN reservation_number TEXT;

-- Créer une fonction pour formater le numéro de réservation
CREATE OR REPLACE FUNCTION format_reservation_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reservation_number := 'RES-' || LPAD(nextval('reservation_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour formater automatiquement le numéro de réservation
DROP TRIGGER IF EXISTS set_reservation_number ON reservations;
CREATE TRIGGER set_reservation_number
    BEFORE INSERT ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION format_reservation_number();

-- Mettre à jour les réservations existantes
UPDATE reservations
SET reservation_number = 'RES-' || LPAD(nextval('reservation_number_seq')::TEXT, 5, '0')
WHERE reservation_number IS NULL;

-- Ajouter une contrainte unique
ALTER TABLE reservations
DROP CONSTRAINT IF EXISTS unique_reservation_number;
ALTER TABLE reservations
ADD CONSTRAINT unique_reservation_number UNIQUE (reservation_number);
