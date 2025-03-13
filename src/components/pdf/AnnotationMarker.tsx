import React from 'react';
import { Annotation } from '../../types';
import { Camera, MessageSquare, Highlighter } from 'lucide-react';

interface AnnotationMarkerProps {
  annotation: Annotation;
  onClick: (annotation: Annotation) => void;
}

export const AnnotationMarker: React.FC<AnnotationMarkerProps> = ({ annotation, onClick }) => {
  const getIcon = () => {
    switch (annotation.annotation_type) {
      case 'camera':
        return <Camera size={16} />;
      case 'note':
        return <MessageSquare size={16} />;
      case 'highlight':
        return <Highlighter size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  const getColorClass = () => {
    switch (annotation.annotation_type) {
      case 'camera':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'note':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'highlight':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div
      className={`absolute cursor-pointer rounded-full p-2 text-white shadow-md transition-colors ${getColorClass()}`}
      style={{
        left: `${annotation.position_x}%`,
        top: `${annotation.position_y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      onClick={() => onClick(annotation)}
    >
      {getIcon()}
    </div>
  );
};
