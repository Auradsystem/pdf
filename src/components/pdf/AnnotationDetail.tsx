import React from 'react';
import { Annotation } from '../../types';
import { Button } from '../ui/Button';
import { Camera, MessageSquare, Highlighter, Trash2 } from 'lucide-react';

interface AnnotationDetailProps {
  annotation: Annotation;
  onDelete: (annotationId: string | number) => Promise<void>;
  onClose: () => void;
}

export const AnnotationDetail: React.FC<AnnotationDetailProps> = ({
  annotation,
  onDelete,
  onClose,
}) => {
  const getIcon = () => {
    switch (annotation.annotation_type) {
      case 'camera':
        return <Camera size={24} className="text-purple-600" />;
      case 'note':
        return <MessageSquare size={24} className="text-blue-600" />;
      case 'highlight':
        return <Highlighter size={24} className="text-yellow-600" />;
      default:
        return <MessageSquare size={24} className="text-gray-600" />;
    }
  };

  const getTitle = () => {
    switch (annotation.annotation_type) {
      case 'camera':
        return 'Camera Annotation';
      case 'note':
        return 'Note';
      case 'highlight':
        return 'Highlight';
      default:
        return 'Annotation';
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this annotation?')) {
      try {
        await onDelete(annotation.id);
        onClose();
      } catch (error) {
        console.error('Error deleting annotation:', error);
      }
    }
  };

  const formattedDate = new Date(annotation.created_at).toLocaleString();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {getIcon()}
        <h3 className="text-lg font-medium">{getTitle()}</h3>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>Page: {annotation.page_number}</p>
        <p>Created: {formattedDate}</p>
      </div>
      
      {annotation.content?.text && (
        <div className="mt-4">
          <p className="text-gray-800 whitespace-pre-wrap">{annotation.content.text}</p>
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          leftIcon={<Trash2 size={16} />}
        >
          Delete
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
};
