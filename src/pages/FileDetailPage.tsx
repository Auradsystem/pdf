import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { PDFViewer } from '../components/pdf/PDFViewer';
import { AnnotationMarker } from '../components/pdf/AnnotationMarker';
import { AnnotationForm } from '../components/pdf/AnnotationForm';
import { AnnotationDetail } from '../components/pdf/AnnotationDetail';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useFiles } from '../hooks/useFiles';
import { useAnnotations } from '../hooks/useAnnotations';
import { Annotation } from '../types';
import { ChevronLeft, Plus } from 'lucide-react';

export const FileDetailPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { files, loading: filesLoading, getFileUrl } = useFiles();
  const { 
    annotations, 
    loading: annotationsLoading, 
    createAnnotation, 
    deleteAnnotation 
  } = useAnnotations(fileId);
  
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [newAnnotationPosition, setNewAnnotationPosition] = useState<{ x: number; y: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fileId && files.length > 0) {
      const file = files.find(f => f.id === fileId);
      if (file) {
        getFileUrl(file.file_path).then(url => {
          setFileUrl(url);
        }).catch(error => {
          console.error('Error getting file URL:', error);
        });
      }
    }
  }, [fileId, files]);

  if (authLoading || filesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!fileId) {
    return <Navigate to="/projects" replace />;
  }

  const file = files.find(f => f.id === fileId);

  if (!file) {
    return (
      <Layout>
        <div className="py-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-900 mb-2">File not found</h2>
            <p className="text-gray-600 mb-6">
              The file you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button as={Link} to="/projects">
              Back to Projects
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setIsDetailModalOpen(true);
  };

  const handleAddAnnotation = (pageNumber: number, x: number, y: number) => {
    setNewAnnotationPosition({ x, y });
    setIsAnnotationModalOpen(true);
  };

  const handleCreateAnnotation = async (
    pageNumber: number,
    annotationType: 'camera' | 'note' | 'highlight',
    positionX: number,
    positionY: number,
    content: Record<string, any>
  ) => {
    setIsSubmitting(true);
    try {
      await createAnnotation(pageNumber, annotationType, positionX, positionY, content);
      setIsAnnotationModalOpen(false);
      setNewAnnotationPosition(null);
    } catch (error) {
      console.error('Error creating annotation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    try {
      await deleteAnnotation(annotationId);
      setIsDetailModalOpen(false);
      setSelectedAnnotation(null);
    } catch (error) {
      console.error('Error deleting annotation:', error);
    }
  };

  const currentPageAnnotations = annotations.filter(a => a.page_number === currentPage);

  return (
    <Layout>
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to={`/projects/${file.project_id}`} className="text-blue-600 hover:text-blue-800 mr-4">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{file.name}</h1>
          </div>
        </div>
        
        <div className="relative">
          {fileUrl ? (
            <PDFViewer
              fileUrl={fileUrl}
              onPageChange={handlePageChange}
              onAnnotationAdd={handleAddAnnotation}
            />
          ) : (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {!annotationsLoading && currentPageAnnotations.map((annotation) => (
            <AnnotationMarker
              key={annotation.id}
              annotation={annotation}
              onClick={handleAnnotationClick}
            />
          ))}
        </div>
        
        <Modal
          isOpen={isAnnotationModalOpen}
          onClose={() => {
            setIsAnnotationModalOpen(false);
            setNewAnnotationPosition(null);
          }}
          title="Add Annotation"
          size="md"
        >
          {newAnnotationPosition && (
            <AnnotationForm
              pageNumber={currentPage}
              positionX={newAnnotationPosition.x}
              positionY={newAnnotationPosition.y}
              onSubmit={handleCreateAnnotation}
              onCancel={() => {
                setIsAnnotationModalOpen(false);
                setNewAnnotationPosition(null);
              }}
              isLoading={isSubmitting}
            />
          )}
        </Modal>
        
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAnnotation(null);
          }}
          title="Annotation Details"
          size="md"
        >
          {selectedAnnotation && (
            <AnnotationDetail
              annotation={selectedAnnotation}
              onDelete={handleDeleteAnnotation}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedAnnotation(null);
              }}
            />
          )}
        </Modal>
      </div>
    </Layout>
  );
};
