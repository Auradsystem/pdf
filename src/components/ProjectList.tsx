import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, Project } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Folder, Trash2 } from 'lucide-react';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("Projets récupérés:", data);
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError(`Failed to load projects: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectName.trim() || !user) return;

    try {
      setCreating(true);
      setError(null);

      const newProject = {
        name: newProjectName.trim(),
        user_id: user.id
      };
      
      console.log("Création du projet:", newProject);

      const { data, error } = await supabase
        .from('projets')
        .insert(newProject)
        .select()
        .single();

      if (error) throw error;

      console.log("Projet créé:", data);
      
      // Add to list and reset form
      setProjects([data, ...projects]);
      setNewProjectName('');
      
      // Navigate to the new project
      navigate(`/projects/${data.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(`Failed to create project: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project? All associated files will also be deleted.')) return;

    try {
      setError(null);

      // 1. Delete the project (cascade should handle files)
      const { error } = await supabase
        .from('projets')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // 2. Update UI
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (error: any) {
      console.error('Error deleting project:', error);
      setError(`Failed to delete project: ${error.message}`);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Projects</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create New Project
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleCreateProject} className="flex gap-3">
            <div className="flex-grow">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                disabled={creating}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={creating || !newProjectName.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              {creating ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Your Projects
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
              No projects found. Create your first project above.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {projects.map((project) => (
                <li key={project.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/projects/${project.id}`}
                      className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
                    >
                      <Folder className="h-5 w-5 text-gray-400 mr-2" />
                      {project.name}
                    </Link>
                    <div className="ml-2 flex-shrink-0 flex">
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="ml-2 flex items-center text-sm text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Created on {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectList;
