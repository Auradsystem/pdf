import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Camera, MessageSquare, Highlighter } from 'lucide-react';

interface AnnotationFormProps {
  pageNumber: number;
  positionX: number;
  positionY: number;
  onSubmit: (
    pageNumber: number,
    annotationType: 'camera' | 'note' | 'highlight',
    positionX: number,
    positionY: number,
    content: Record<string, any>
  ) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const AnnotationForm: React.FC<AnnotationFormProps> = ({
  pageNumber,
  positionX,
  positionY,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [annotationType, setAnnotationType] = useState<'camera' | 'note' | 'highlight'>('note');
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const content = { text };
    
    await onSubmit(
      pageNumber,
      annotationType,
      positionX,
      positionY,
      content
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={annotationType === 'note' ? 'primary' : 'outline'}
          onClick={() => setAnnotationType('note')}
          className="flex-1"
        >
          <MessageSquare size={16} className="mr-2" />
          Note
        </Button>
        <Button
          type="button"
          variant={annotationType === 'highlight' ? 'primary' : 'outline'}
          onClick={() => setAnnotationType('highlight')}
          className="flex-1"
        >
          <Highlighter size={16} className="mr-2" />
          Highlight
        </Button>
        <Button
          type="button"
          variant={annotationType === 'camera' ? 'primary' : 'outline'}
          onClick={() => setAnnotationType('camera')}
          className="flex-1"
        >
          <Camera size={16} className="mr-2" />
          Camera
        </Button>
      </div>
      
      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
          Annotation Text
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Enter your annotation text here..."
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Annotation'}
        </Button>
      </div>
    </form>
  );
};
