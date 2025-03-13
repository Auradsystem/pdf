import React, { useState } from 'react';
import { Annotation } from '../../types';
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
  isLoading,
}) => {
  const [annotationType, setAnnotationType] = useState<'camera' | 'note' | 'highlight'>('note');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (annotationType === 'note' && !text.trim()) {
      setError('Please enter some text for the note');
      return;
    }
    
    try {
      await onSubmit(
        pageNumber,
        annotationType,
        positionX,
        positionY,
        { text }
      );
    } catch (error) {
      console.error('Error creating annotation:', error);
      setError('Failed to create annotation. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Annotation Type
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            className={`flex items-center justify-center p-2 rounded-md ${
              annotationType === 'note'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent'
            }`}
            onClick={() => setAnnotationType('note')}
          >
            <MessageSquare size={20} className="mr-2" />
            Note
          </button>
          <button
            type="button"
            className={`flex items-center justify-center p-2 rounded-md ${
              annotationType === 'highlight'
                ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent'
            }`}
            onClick={() => setAnnotationType('highlight')}
          >
            <Highlighter size={20} className="mr-2" />
            Highlight
          </button>
          <button
            type="button"
            className={`flex items-center justify-center p-2 rounded-md ${
              annotationType === 'camera'
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent'
            }`}
            onClick={() => setAnnotationType('camera')}
          >
            <Camera size={20} className="mr-2" />
            Camera
          </button>
        </div>
      </div>
      
      {annotationType === 'note' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your note here..."
            className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-blue-500 block w-full sm:text-sm min-h-[100px]"
          />
        </div>
      )}
      
      {annotationType === 'highlight' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Highlight Comment (optional)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment to your highlight..."
            className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-blue-500 block w-full sm:text-sm min-h-[100px]"
          />
        </div>
      )}
      
      {annotationType === 'camera' && (
        <div className="text-sm text-gray-600">
          <p>This will create a camera annotation at position:</p>
          <p>Page: {pageNumber}, X: {positionX.toFixed(2)}%, Y: {positionY.toFixed(2)}%</p>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
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
          isLoading={isLoading}
        >
          Create Annotation
        </Button>
      </div>
    </form>
  );
};
