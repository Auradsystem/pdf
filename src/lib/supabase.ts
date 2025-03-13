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
  user_id?: string;
};

// Cette fonction n'est plus nécessaire car nous utilisons la fonction RPC
// Mais nous la gardons pour référence
export const createFileRecord = async (name: string, projetId: number, storagePath: string) => {
  try {
    // Insertion directe dans la table files
    const { data, error } = await supabase
      .from('files')
      .insert({
        name: name,
        projet_id: projetId,
        storage_path: storagePath
      })
      .select(); // Retourne les données insérées
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating file record:', error);
    return { data: null, error };
  }
};
