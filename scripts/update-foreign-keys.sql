-- Mise à jour des contraintes pour la table reservations (véhicules)
ALTER TABLE reservations
DROP CONSTRAINT IF EXISTS reservations_vehicle_id_fkey;

ALTER TABLE reservations
ADD CONSTRAINT reservations_vehicle_id_fkey
FOREIGN KEY (vehicle_id)
REFERENCES vehicles(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Mise à jour des contraintes pour les clients
ALTER TABLE reservations
DROP CONSTRAINT IF EXISTS reservations_client_id_fkey;

ALTER TABLE reservations
ADD CONSTRAINT reservations_client_id_fkey
FOREIGN KEY (client_id)
REFERENCES clients(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Mise à jour des contraintes pour reservation_versions
ALTER TABLE reservation_versions
DROP CONSTRAINT IF EXISTS reservation_versions_reservation_id_fkey;

ALTER TABLE reservation_versions
ADD CONSTRAINT reservation_versions_reservation_id_fkey
FOREIGN KEY (reservation_id)
REFERENCES reservations(id)
ON DELETE CASCADE
ON UPDATE CASCADE;
