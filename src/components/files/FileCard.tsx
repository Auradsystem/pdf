import React from 'react';
import { Link } from 'react-router-dom';
import { PDFFile } from '../../types';
import { FileText, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

interface FileCardProps {
  file: PDFFile;
  onDelete: (fileId: string | number) => Promise<void>;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onDelete }) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onDelete(file.id);
  };

  return (
    <Link
      to={`/files/${file.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 truncate" title={file.name}>
              {file.name}
            </h3>
          </div>
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-600 transition-colors duration-200"
            title="Delete file"
          >
            <Trash2 size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Added on {formatDate(file.created_at)}
        </p>
      </div>
    </Link>
  );
};
