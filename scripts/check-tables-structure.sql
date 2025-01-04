-- Afficher la structure de la table vehicles
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'vehicles'
ORDER BY ordinal_position;

-- Afficher la structure de la table bungalows
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'bungalows'
ORDER BY ordinal_position;
