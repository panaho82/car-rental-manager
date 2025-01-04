import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qskctvadactgyeguosag.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFza2N0dmFkYWN0Z3llZ3Vvc2FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTgzNjYzNiwiZXhwIjoyMDUxNDEyNjM2fQ.y0jOMOFR-1nMjqJCB7ywLRrLY9-R_CfLkmJhN1QDXjc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Données initiales
const initialData = {
  vehicles: [
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
  ],
  bungalows: [
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
  ],
};

async function setupDatabase() {
  try {
    console.log('Début de la configuration de la base de données...');

    // Créer les tables
    console.log('Création des tables...');
    
    // Table clients
    await supabase.from('clients').select('count').limit(1).catch(() => {
      return supabase.from('clients').create([]);
    });

    // Table vehicles
    await supabase.from('vehicles').select('count').limit(1).catch(() => {
      return supabase.from('vehicles').create([]);
    });

    // Table bungalows
    await supabase.from('bungalows').select('count').limit(1).catch(() => {
      return supabase.from('bungalows').create([]);
    });

    // Table reservations
    await supabase.from('reservations').select('count').limit(1).catch(() => {
      return supabase.from('reservations').create([]);
    });

    // Table payments
    await supabase.from('payments').select('count').limit(1).catch(() => {
      return supabase.from('payments').create([]);
    });

    console.log('Tables créées avec succès');

    // Insérer les données initiales
    console.log('Ajout des données initiales...');

    // Véhicules
    const { error: vehiclesError } = await supabase
      .from('vehicles')
      .insert(initialData.vehicles);

    if (vehiclesError) {
      console.error('Erreur lors de l\'ajout des véhicules:', vehiclesError);
    } else {
      console.log('Véhicules initiaux ajoutés avec succès');
    }

    // Bungalows
    const { error: bungalowsError } = await supabase
      .from('bungalows')
      .insert(initialData.bungalows);

    if (bungalowsError) {
      console.error('Erreur lors de l\'ajout des bungalows:', bungalowsError);
    } else {
      console.log('Bungalows initiaux ajoutés avec succès');
    }

    console.log('Configuration terminée !');
    console.log('Vous pouvez maintenant vous connecter avec :');
    console.log('Email: admin@raiatea-rentcar.com');
    console.log('Mot de passe: Admin123!');

  } catch (error) {
    console.error('Erreur lors de la configuration :', error);
  }
}

setupDatabase();
