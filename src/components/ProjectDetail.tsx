import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, Project, File } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Upload, Trash2, FileText } from 'lucide-react';
import PDFViewer from './PDFViewer';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchFiles();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      if (!projectId) return;
      
      const { data, error } = await supabase
        .from('projets')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
    }
  };

  const fetchFiles = async () => {
    try {
      if (!projectId) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('projet_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !projectId || !user) return;

    const file = fileList[0];
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // 1. Upload file to storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${projectId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // CODE DE DÉBOGAGE
      console.log("Détails du projet et de l'utilisateur :");
      console.log("User ID:", user.id);
      console.log("Project ID:", projectId);

      // Vérifier que le projet existe et appartient à l'utilisateur connecté
      const { data: projectCheck } = await supabase
        .from('projets')
        .select('*')
        .eq('id', parseInt(projectId))
        .eq('user_id', user.id)
        .single();
        
      console.log("Projet trouvé:", projectCheck);

      // Si le projet n'appartient pas à l'utilisateur, afficher un message clair
      if (!projectCheck) {
        console.error("PROBLÈME: Ce projet n'existe pas ou n'appartient pas à l'utilisateur");
        setError("Vous n'avez pas les droits sur ce projet");
        
        // Essayer de nettoyer le fichier uploadé
        try {
          await supabase.storage.from('pdfs').remove([filePath]);
        } catch (cleanupError) {
          console.error('Error cleaning up storage after project check failed:', cleanupError);
        }
        
        return;
      }

      // Procéder à l'insertion normalement
      const { data, error: dbError } = await supabase
        .from('files')
        .insert({
          name: file.name,
          projet_id: parseInt(projectId),
          storage_path: filePath,
          user_id: user.id
        })
        .select()
        .single();

      if (dbError) {
        console.error("Erreur d'insertion:", dbError);
        throw dbError;
      }

      console.log("Fichier inséré avec succès:", data);

      // 3. Update UI
      setFiles([data, ...files]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      // Si l'erreur est liée à RLS, donnez un message plus clair
      if (error.message?.includes('policy') || error.message?.includes('permission')) {
        setError(`Erreur de permission: Vous n'avez pas les droits nécessaires pour ajouter un fichier à ce projet.`);
      } else {
        setError(`Failed to upload file: ${error.message}`);
      }
      
      // Essayer de nettoyer le fichier uploadé si l'insertion en DB a échoué
      try {
        if (filePath) {
          await supabase.storage.from('pdfs').remove([filePath]);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up storage after failed DB insert:', cleanupError);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: number, storagePath: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      setError(null);

      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from('pdfs')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // 3. Update UI
      setFiles(files.filter(file => file.id !== fileId));
      
      // Reset selected file if it was deleted
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(null);
      }
    } catch (error: any) {
      console.error('Error deleting file:', error);
      setError(`Failed to delete file: ${error.message}`);
    }
  };

  const handleViewFile = (file: File) => {
    setSelectedFile(file);
  };

  if (loading && !project) {
    return <div className="text-center py-10">Loading project details...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center text-indigo-600 hover:text-indigo-900">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {project?.name || 'Project Details'}
      </h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                PDF Files
              </h3>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="application/pdf"
                  className="hidden"
                  disabled={uploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {uploading ? 'Uploading...' : 'Upload PDF'}
                </button>
              </div>
            </div>
            <div className="border-t border-gray-200">
              {files.length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                  No PDF files uploaded yet. Upload your first PDF file.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {files.map((file) => (
                    <li key={file.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleViewFile(file)}
                          className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 truncate"
                        >
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          {file.name}
                        </button>
                        <div className="ml-2 flex-shrink-0 flex">
                          <button
                            onClick={() => handleDeleteFile(file.id, file.storage_path)}
                            className="ml-2 flex items-center text-sm text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Uploaded on {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedFile ? (
            <PDFViewer file={selectedFile} />
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg h-full flex items-center justify-center">
              <div className="text-center p-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No PDF Selected</h3>
                <p className="text-sm text-gray-500">
                  Select a PDF file from the list to view it here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
