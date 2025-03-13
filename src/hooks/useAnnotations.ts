import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Annotation } from '../types';

export const useAnnotations = (fileId?: string | number) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fileId) {
      fetchAnnotations();
    } else {
      setAnnotations([]);
      setLoading(false);
    }
  }, [fileId]);

  const fetchAnnotations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('file_id', fileId);

      if (error) {
        throw error;
      }

      setAnnotations(data || []);
    } catch (error) {
      console.error('Error fetching annotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAnnotation = async (
    pageNumber: number,
    annotationType: string,
    positionX: number,
    positionY: number,
    content?: Record<string, any>
  ) => {
    try {
      const { data, error } = await supabase
        .from('annotations')
        .insert([
          {
            file_id: fileId,
            page_number: pageNumber,
            position_x: positionX,
            position_y: positionY,
            annotation_type: annotationType,
            content
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      setAnnotations(prev => [...prev, ...(data || [])]);
      return data?.[0];
    } catch (error) {
      console.error('Error creating annotation:', error);
      throw error;
    }
  };

  const deleteAnnotation = async (annotationId: string | number) => {
    try {
      const { error } = await supabase
        .from('annotations')
        .delete()
        .eq('id', annotationId);

      if (error) {
        throw error;
      }

      setAnnotations(prev => prev.filter(a => a.id !== annotationId));
    } catch (error) {
      console.error('Error deleting annotation:', error);
      throw error;
    }
  };

  return {
    annotations,
    loading,
    createAnnotation,
    deleteAnnotation,
    refreshAnnotations: fetchAnnotations
  };
};
