import React from 'react';
import { Link } from 'react-router-dom';
import { PDFFile } from '../../types';
import { FileText, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface FileCardProps {
  file: PDFFile;
  onDelete: (fileId: string | number) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onDelete }) => {
  const formattedDate = new Date(file.created_at).toLocaleDateString();
  
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
              <p className="text-sm text-gray-500">Added on {formattedDate}</p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(file.id)}
            leftIcon={<Trash2 size={16} />}
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <Link
          to={`/files/${file.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View & Annotate &rarr;
        </Link>
      </div>
    </div>
  );
};
