import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { FileCard } from '../components/files/FileCard';
import { FileUploader } from '../components/files/FileUploader';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { useFiles } from '../hooks/useFiles';
import { ChevronLeft, Upload, Edit, Trash2 } from 'lucide-react';
import { ProjectForm } from '../components/projects/ProjectForm';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, updateProject, deleteProject } = useProjects();
  const { files, loading: filesLoading, uploadFile, deleteFile } = useFiles(projectId);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  const project = projects.find(p => p.id.toString() === projectId.toString());

  if (!project) {
    return (
      <Layout>
        <div className="py-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Project not found</h2>
            <p className="text-gray-600 mb-6">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button as={Link} to="/projects">
              Back to Projects
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleUpdateProject = async (data: { name: string; description: string }) => {
    setIsSubmitting(true);
    try {
      await updateProject(projectId, data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? All files will be deleted as well. This action cannot be undone.')) {
      try {
        await deleteProject(projectId);
        window.location.href = '/projects';
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsSubmitting(true);
    try {
      await uploadFile(file, projectId);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFile = async (fileId: string | number) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      try {
        await deleteFile(fileId);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/projects" className="text-blue-600 hover:text-blue-800 mr-4">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit size={16} />}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteProject}
              leftIcon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </div>
        </div>
        
        {project.description && (
          <p className="text-gray-600 mb-6">{project.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Files</h2>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<Upload size={16} />}
          >
            Upload PDF
          </Button>
        </div>
        
        {filesLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-600 mb-6">
              Upload your first PDF file to start annotating.
            </p>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              leftIcon={<Upload size={16} />}
            >
              Upload PDF
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDelete={handleDeleteFile}
              />
            ))}
          </div>
        )}
        
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload PDF File"
        >
          <FileUploader
            onUpload={handleFileUpload}
            isLoading={isSubmitting}
            onCancel={() => setIsUploadModalOpen(false)}
          />
        </Modal>
        
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Project"
        >
          <ProjectForm
            initialData={project}
            onSubmit={handleUpdateProject}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </Layout>
  );
};
