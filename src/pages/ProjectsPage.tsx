import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import { Plus, FolderPlus } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleCreateProject = async (name: string, description: string) => {
    setIsSubmitting(true);
    try {
      await createProject(name, description);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (name: string, description: string) => {
    if (!editingProject) return;
    
    setIsSubmitting(true);
    try {
      await updateProject(editingProject.id, { name, description });
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(projectId);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            New Project
          </Button>
        </div>
        
        {projectsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first project to start organizing your PDF files.
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
                onEdit={openEditModal}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
        
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingProject ? 'Edit Project' : 'Create New Project'}
          size="md"
        >
          <ProjectForm
            initialData={editingProject || {}}
            onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
            onCancel={closeModal}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </Layout>
  );
};
