import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';
import { Folder, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string | number) => Promise<void>;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onDelete(project.id);
  };

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Folder className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 truncate" title={project.name}>
              {project.name}
            </h3>
          </div>
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-600 transition-colors duration-200"
            title="Delete project"
          >
            <Trash2 size={18} />
          </button>
        </div>
        {project.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={project.description}>
            {project.description}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Created on {formatDate(project.created_at)}
        </p>
      </div>
    </Link>
  );
};
