import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PDFFile } from '../types';

export const useFiles = (projectId?: string | number) => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchFiles();
    } else {
      setFiles([]);
      setLoading(false);
    }
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      // Using the exact table name 'files' and column name 'projet_id' as defined in the SQL
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('projet_id', projectId);

      if (error) {
        throw error;
      }

      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, projectId: string | number) => {
    try {
      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `files/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pdf-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Create file record in database using the exact table name 'files' and column name 'projet_id'
      const { data, error: dbError } = await supabase
        .from('files')
        .insert([
          {
            name: file.name,
            projet_id: projectId,
            storage_path: filePath
          }
        ])
        .select();

      if (dbError) {
        throw dbError;
      }

      const newFile = data?.[0] || null;

      if (newFile) {
        setFiles(prev => [...prev, newFile]);
      }
      
      return newFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const deleteFile = async (fileId: string | number) => {
    try {
      // Get file path first
      const fileToDelete = files.find(f => f.id === fileId);
      
      if (fileToDelete?.storage_path) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('pdf-files')
          .remove([fileToDelete.storage_path]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      }

      // Delete from database using the exact table name 'files'
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        throw dbError;
      }

      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const getFileUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('pdf-files')
        .createSignedUrl(filePath, 3600);

      if (error) {
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      throw error;
    }
  };

  return {
    files,
    loading,
    uploadFile,
    deleteFile,
    getFileUrl,
    refreshFiles: fetchFiles
  };
};
