import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PDFFile } from '../types';
import { useAuth } from '../context/AuthContext';

export const useFiles = (projectId?: number) => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchFiles = async () => {
    try {
      setLoading(true);
      if (!user || !projectId) {
        setFiles([]);
        return;
      }

      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('projet_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, projectId: number) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Upload file to storage
      const filePath = `${user.id}/${projectId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create file record in database
      const { data, error: dbError } = await supabase
        .from('files')
        .insert([
          {
            name: file.name,
            projet_id: projectId,
            storage_path: filePath
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;
      setFiles(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error uploading file:', err);
      throw err;
    }
  };

  const deleteFile = async (fileId: number, filePath: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('pdfs')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete file record from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error deleting file:', err);
      throw err;
    }
  };

  const getFileUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('pdfs')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error getting file URL:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchFiles();
    }
  }, [projectId, user]);

  return {
    files,
    loading,
    error,
    fetchFiles,
    uploadFile,
    deleteFile,
    getFileUrl
  };
};
