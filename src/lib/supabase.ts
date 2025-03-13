import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tdameuxkfymxzatpvvin.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYW1ldXhrZnlteHphdHB2dmluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MjA1ODcsImV4cCI6MjA1NzM5NjU4N30.kaugD32aJ0y9UOm6MuEEeOz4xBalO5rizV2AelV_BAM';

// Créer le client Supabase avec la clé d'API anonyme
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
  // Forcer le rôle postgres pour toutes les requêtes
  headers: {
    'x-postgres-role': 'postgres'
  }
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

// Fonction simplifiée pour insérer un fichier via RPC
export const createFileRecord = async (name: string, projetId: number, storagePath: string, userId?: string) => {
  try {
    // Utiliser la fonction RPC qui contourne RLS
    const { data, error } = await supabase.rpc('insert_file_bypass_rls', {
      p_name: name,
      p_projet_id: projetId,
      p_storage_path: storagePath,
      p_user_id: userId
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating file record:', error);
    return { data: null, error };
  }
};

// Fonction simplifiée pour supprimer un fichier via RPC
export const deleteFileRecord = async (fileId: number) => {
  try {
    // Utiliser la fonction RPC qui contourne RLS
    const { data, error } = await supabase.rpc('delete_file_bypass_rls', {
      p_file_id: fileId
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error deleting file record:', error);
    return { data: null, error };
  }
};

// Fonction pour insérer directement avec SQL brut (méthode alternative)
export const insertFileWithSQL = async (name: string, projetId: number, storagePath: string, userId?: string) => {
  try {
    // Utiliser SQL brut pour contourner RLS
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: `INSERT INTO files (name, projet_id, storage_path, user_id) 
                  VALUES ('${name.replace(/'/g, "''")}', ${projetId}, '${storagePath.replace(/'/g, "''")}', ${userId ? `'${userId}'` : 'NULL'})`
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error executing SQL:', error);
    return { data: null, error };
  }
};

// Fonction pour tester la fonction RPC
export const testRpcFunction = async (fileName: string, projetId: number, storagePath: string, userId?: string) => {
  try {
    console.log('Calling RPC with params:', { fileName, projetId, storagePath, userId });
    const { data, error } = await supabase.rpc('insert_file_bypass_rls', {
      p_name: fileName,
      p_projet_id: projetId,
      p_storage_path: storagePath,
      p_user_id: userId
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error calling RPC function:', error);
    return { data: null, error };
  }
};
