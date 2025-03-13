import React from 'react';
import { Link } from 'react-router-dom';
import { PDFFile } from '../../types';
import { FileText, Trash2, Eye } from 'lucide-react';
import { Button } from '../ui/Button';

interface FileCardProps {
  file: PDFFile;
  onDelete: (fileId: string, filePath: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onDelete }) => {
  const formattedDate = new Date(file.created_at).toLocaleDateString();
  const formattedSize = formatFileSize(file.file_size);
  
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                <Link to={`/files/${file.id}`} className="hover:text-blue-600">
                  {file.name}
                </Link>
              </h3>
              <p className="text-sm text-gray-500">
                {formattedSize} • Uploaded on {formattedDate}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye size={16} />}
              as={Link}
              to={`/files/${file.id}`}
            >
              View
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(file.id, file.file_path)}
              leftIcon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
