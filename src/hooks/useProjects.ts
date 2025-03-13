import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Using the exact table name 'projets' as defined in the SQL
      const { data, error } = await supabase
        .from('projets')
        .select('*')
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: { name: string; description?: string }) => {
    try {
      // Using the exact table name 'projets' as defined in the SQL
      const { data, error } = await supabase
        .from('projets')
        .insert([
          {
            name: projectData.name,
            // description is not in the SQL schema, but we can keep it for UI purposes
            // it will be ignored by Supabase if the column doesn't exist
            description: projectData.description,
            user_id: user?.id
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      setProjects(prev => [...prev, ...(data || [])]);
      return data?.[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (projectId: string | number, updates: Partial<Project>) => {
    try {
      // Using the exact table name 'projets' as defined in the SQL
      const { data, error } = await supabase
        .from('projets')
        .update(updates)
        .eq('id', projectId)
        .select();

      if (error) {
        throw error;
      }

      setProjects(prev => 
        prev.map(project => project.id === projectId ? { ...project, ...updates } : project)
      );
      
      return data?.[0];
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string | number) => {
    try {
      // Using the exact table name 'projets' as defined in the SQL
      const { error } = await supabase
        .from('projets')
        .delete()
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects
  };
};
