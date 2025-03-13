import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { Plus } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, createProject, deleteProject } = useProjects();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleCreateProject = async (data: { name: string; description: string }) => {
    setIsSubmitting(true);
    try {
      await createProject(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string | number) => {
    if (window.confirm('Are you sure you want to delete this project? All files will be deleted as well. This action cannot be undone.')) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            New Project
          </Button>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-xl font-medium text-gray-900 mb-2">No projects yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first project to start uploading and annotating PDF files.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus size={16} />}
            >
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
        
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Project"
        >
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setIsModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </Layout>
  );
};
