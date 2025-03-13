import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Upload, X, FileText as FileIcon } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isLoading, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer 
              ${selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'} 
              hover:bg-gray-100 ${error ? 'border-red-300 bg-red-50' : ''}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {selectedFile ? (
                <>
                  <FileIcon className="w-8 h-8 mb-2 text-green-600" />
                  <p className="text-sm text-gray-700 font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-1 text-sm text-gray-700 font-medium">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF files only (max 10MB)</p>
                </>
              )}
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
        </div>
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          {selectedFile && (
            <Button
              type="button"
              variant="outline"
              onClick={handleClearSelection}
              leftIcon={<X size={16} />}
            >
              Clear
            </Button>
          )}
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            isLoading={isLoading}
            leftIcon={<Upload size={16} />}
          >
            Upload PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
