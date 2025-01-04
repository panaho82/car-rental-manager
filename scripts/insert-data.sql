-- Insert vehicles
INSERT INTO vehicles (brand, model, year, license_plate, color, daily_rate, status, mileage)
VALUES 
    ('Toyota', 'Hilux', 2023, 'RRC001', 'Blanc', 15000, 'available', 5000),
    ('Hyundai', 'Tucson', 2023, 'RRC002', 'Noir', 12000, 'available', 3500)
ON CONFLICT (license_plate) DO NOTHING;

-- Insert bungalows
INSERT INTO bungalows (name, description, capacity, daily_rate, status, features)
VALUES 
    ('Fare Moana', 'Vue sur lagon, 2 chambres', 4, 25000, 'available', 
     '{"bedrooms": 2, "bathrooms": 1, "aircon": true, "wifi": true}'::jsonb),
    ('Fare Miti', 'Bord de plage, 1 chambre', 2, 20000, 'available',
     '{"bedrooms": 1, "bathrooms": 1, "aircon": true, "wifi": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;
