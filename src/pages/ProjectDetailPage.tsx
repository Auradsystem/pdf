import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { FileCard } from '../components/files/FileCard';
import { FileUploader } from '../components/files/FileUploader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { useFiles } from '../hooks/useFiles';
import { ChevronLeft, Upload, FolderOpen } from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { files, loading: filesLoading, uploadFile, deleteFile } = useFiles(projectId);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const project = projects.find(p => p.id === projectId);

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

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await uploadFile(file, projectId);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (fileId: string, filePath: string) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      try {
        await deleteFile(fileId, filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="flex items-center mb-6">
          <Link to="/projects" className="text-blue-600 hover:text-blue-800 mr-4">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        </div>
        
        {project.description && (
          <p className="text-gray-600 mb-6">{project.description}</p>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Files</h2>
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
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
          <div className="grid gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDelete={handleFileDelete}
              />
            ))}
          </div>
        )}
        
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload PDF File"
          size="md"
        >
          <FileUploader
            onUpload={handleFileUpload}
            isLoading={isUploading}
          />
        </Modal>
      </div>
    </Layout>
  );
};
