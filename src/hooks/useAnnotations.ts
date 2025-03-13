import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Annotation } from '../types';
import { useAuth } from '../context/AuthContext';

export const useAnnotations = (fileId?: number) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchAnnotations = async () => {
    try {
      setLoading(true);
      if (!user || !fileId) {
        setAnnotations([]);
        return;
      }

      // Create annotations table if it doesn't exist
      const { error: tableError } = await supabase.rpc('create_annotations_table_if_not_exists');
      
      if (tableError) {
        console.warn('Error checking/creating annotations table:', tableError);
        // Continue anyway, as the table might already exist
      }

      const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('file_id', fileId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAnnotations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error fetching annotations:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAnnotation = async (
    pageNumber: number,
    positionX: number,
    positionY: number
  ) => {
    try {
      if (!user || !fileId) throw new Error('User not authenticated or file not specified');

      const { data, error } = await supabase
        .from('annotations')
        .insert([
          {
            file_id: fileId,
            page_number: pageNumber,
            position_x: positionX,
            position_y: positionY
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setAnnotations(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error creating annotation:', err);
      throw err;
    }
  };

  const deleteAnnotation = async (annotationId: number) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('annotations')
        .delete()
        .eq('id', annotationId);

      if (error) throw error;
      setAnnotations(prev => prev.filter(annotation => annotation.id !== annotationId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error deleting annotation:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (fileId) {
      fetchAnnotations();
    }
  }, [fileId, user]);

  return {
    annotations,
    loading,
    error,
    fetchAnnotations,
    createAnnotation,
    deleteAnnotation
  };
};
