import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Project } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Folder } from 'lucide-react';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('projets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !user) return;

    try {
      setIsCreating(true);
      setError(null);

      const { data, error } = await supabase
        .from('projets')
        .insert({
          name: newProjectName.trim(),
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setProjects([data, ...projects]);
      setNewProjectName('');
      setIsCreating(false);
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(`Failed to create project: ${error.message}`);
      setIsCreating(false);
    }
  };

  if (loading && projects.length === 0) {
    return <div className="text-center py-10">Loading projects...</div>;
  }

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
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Create a new project
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Create a new project to upload and manage PDF files.</p>
          </div>
          <form onSubmit={handleCreateProject} className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="projectName" className="sr-only">
                Project Name
              </label>
              <input
                type="text"
                name="projectName"
                id="projectName"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Project Name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <button
              type="submit"
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              disabled={isCreating || !newProjectName.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              {isCreating ? 'Creating...' : 'Create Project'}
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
          {projects.length === 0 ? (
            <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
              You don't have any projects yet. Create your first project above.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    to={`/projects/${project.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center">
                        <Folder className="h-5 w-5 text-indigo-500 mr-2" />
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {project.name}
                        </p>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Created on {new Date(project.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
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
