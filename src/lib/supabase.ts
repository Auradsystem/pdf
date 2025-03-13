import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tdameuxkfymxzatpvvin.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYW1ldXhrZnlteHphdHB2dmluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MjA1ODcsImV4cCI6MjA1NzM5NjU4N30.kaugD32aJ0y9UOm6MuEEeOz4xBalO5rizV2AelV_BAM';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
});

// Initialize storage bucket if needed
const initStorage = async () => {
  try {
    const { data, error } = await supabase.storage.getBucket('pdfs');
    if (error && error.message.includes('not found')) {
      await supabase.storage.createBucket('pdfs', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      console.log('Created pdfs bucket');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Call this function when the app starts
initStorage();

export type Project = {
  id: number;
  created_at: string;
  name: string;
  user_id: string;
};

export type File = {
  id: number;
  created_at: string;
  name: string;
  projet_id: number;
  storage_path: string;
  user_id?: string; // Add user_id field to match database schema
};

// Fonction de débogage pour vérifier les tables et leurs politiques RLS
export const checkRLSStatus = async () => {
  try {
    console.log("Vérification du statut RLS...");
    
    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Utilisateur connecté:", user?.id);
    
    // Tester l'accès à la table files
    const { data: filesData, error: filesError } = await supabase
      .from('files')
      .select('*')
      .limit(1);
    
    console.log("Test d'accès à la table files:");
    console.log("- Données:", filesData);
    console.log("- Erreur:", filesError);
    
    // Tester l'accès au bucket de stockage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('pdfs')
      .list();
    
    console.log("Test d'accès au bucket de stockage 'pdfs':");
    console.log("- Données:", storageData);
    console.log("- Erreur:", storageError);
    
    return {
      user: user?.id,
      filesAccess: !filesError,
      storageAccess: !storageError
    };
  } catch (error) {
    console.error("Erreur lors de la vérification du statut RLS:", error);
    return { error };
  }
};
