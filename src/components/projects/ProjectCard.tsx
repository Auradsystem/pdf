import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';
import { Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const formattedDate = new Date(project.created_at).toLocaleDateString();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                <Link to={`/projects/${project.id}`} className="hover:text-blue-600">
                  {project.name}
                </Link>
              </h3>
              <p className="text-sm text-gray-500">Created on {formattedDate}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(project)}
              leftIcon={<Edit size={16} />}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(project.id)}
              leftIcon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </div>
        </div>
        {project.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
        )}
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <Link
          to={`/projects/${project.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View Project &rarr;
        </Link>
      </div>
    </div>
  );
};
