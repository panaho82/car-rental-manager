import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qskctvadactgyeguosag.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFza2N0dmFkYWN0Z3llZ3Vvc2FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTgzNjYzNiwiZXhwIjoyMDUxNDEyNjM2fQ.y0jOMOFR-1nMjqJCB7ywLRrLY9-R_CfLkmJhN1QDXjc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Données initiales pour les véhicules
const initialVehicles = [
  {
    brand: 'Toyota',
    model: 'Hilux',
    year: 2023,
    license_plate: 'RRC001',
    color: 'Blanc',
    daily_rate: 15000,
    status: 'available',
    mileage: 5000,
  },
  {
    brand: 'Hyundai',
    model: 'Tucson',
    year: 2023,
    license_plate: 'RRC002',
    color: 'Noir',
    daily_rate: 12000,
    status: 'available',
    mileage: 3500,
  },
];

// Données initiales pour les bungalows
const initialBungalows = [
  {
    name: 'Fare Moana',
    description: 'Vue sur lagon, 2 chambres',
    capacity: 4,
    daily_rate: 25000,
    status: 'available',
    features: {
      bedrooms: 2,
      bathrooms: 1,
      aircon: true,
      wifi: true,
    },
  },
  {
    name: 'Fare Miti',
    description: 'Bord de plage, 1 chambre',
    capacity: 2,
    daily_rate: 20000,
    status: 'available',
    features: {
      bedrooms: 1,
      bathrooms: 1,
      aircon: true,
      wifi: true,
    },
  },
];

async function setupDatabase() {
  try {
    console.log('Début de la configuration de la base de données...');

    // Créer un compte administrateur
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@raiatea-rentcar.com',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrateur Principal',
      },
    });

    if (adminError) throw adminError;
    console.log('Compte administrateur créé avec succès');

    // Créer le profil administrateur
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: adminUser.user.id,
        full_name: 'Administrateur Principal',
        role: 'admin',
      });

    if (profileError) throw profileError;
    console.log('Profil administrateur créé avec succès');

    // Insérer les véhicules initiaux
    const { error: vehiclesError } = await supabase
      .from('vehicles')
      .insert(initialVehicles);

    if (vehiclesError) throw vehiclesError;
    console.log('Véhicules initiaux ajoutés avec succès');

    // Insérer les bungalows initiaux
    const { error: bungalowsError } = await supabase
      .from('bungalows')
      .insert(initialBungalows);

    if (bungalowsError) throw bungalowsError;
    console.log('Bungalows initiaux ajoutés avec succès');

    console.log('Configuration terminée avec succès !');
    console.log('Identifiants administrateur :');
    console.log('Email: admin@raiatea-rentcar.com');
    console.log('Mot de passe: Admin123!');

  } catch (error) {
    console.error('Erreur lors de la configuration :', error);
  }
}

setupDatabase();
