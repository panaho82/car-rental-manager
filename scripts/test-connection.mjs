import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhraroxivmnmmawbqlkt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocmFyb3hpdm1ubW1hd2JxbGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDg5MDIsImV4cCI6MjA4MDYyNDkwMn0.dtush0_IV5zHaLfYPUHvmA0Agj2Pfm7vSTLWX2X93ao';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Test de connexion à Supabase...');
  
  // Essayer de lire la table 'vehicles' (devrait marcher si elle existe)
  const { data, error } = await supabase
    .from('vehicles')
    .select('count')
    .limit(1);

  if (error) {
    console.error('Erreur de connexion:', error.message);
  } else {
    console.log('Connexion réussie !');
    console.log('Données reçues:', data);
  }
}

testConnection();

