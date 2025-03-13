import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Project, File as PDFFile, checkRLSStatus } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import PDFViewer from './PDFViewer';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PDFFile | null>(null);
  const [rlsStatus, setRlsStatus] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchFiles();
      checkRLS();
    }
  }, [projectId]);

  const checkRLS = async () => {
    const status = await checkRLSStatus();
    setRlsStatus(status);
    console.log("RLS Status:", status);
  };

  const fetchProject = async () => {
    try {
      if (!projectId || !user) return;
      
      const { data, error } = await supabase
        .from('projets')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project');
      navigate('/projects');
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

  // Function to sanitize filename for storage
  const sanitizeFileName = (fileName: string): string => {
    // Replace spaces and special characters with underscores
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-zA-Z0-9.-]/g, '_'); // Replace special chars with underscore
  };

  // Nouvelle approche pour l'upload de fichier
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (!fileInput.files || fileInput.files.length === 0 || !projectId) {
      return;
    }

    const file = fileInput.files[0];
    const fileExt = file.name.split('.').pop();
    if (fileExt?.toLowerCase() !== 'pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Vérifier à nouveau le statut RLS avant l'upload
      await checkRLS();

      // Sanitize the original filename
      const sanitizedName = sanitizeFileName(file.name);
      
      // Create a unique filename with timestamp
      const fileName = `${Date.now()}_${sanitizedName}`;
      
      // Create the storage path - use just the project ID and filename
      const filePath = `${projectId}/${fileName}`;
      
      console.log('Uploading file to path:', filePath);
      
      // Utiliser la fonction rpc pour contourner RLS
      const { data: fileData, error: rpcError } = await supabase.rpc('create_file_with_upload', {
        p_name: file.name,
        p_projet_id: projectId,
        p_storage_path: filePath
      });

      if (rpcError) {
        console.error('RPC error details:', rpcError);
        throw rpcError;
      }

      console.log('File record created via RPC:', fileData);

      // Si l'RPC a réussi, maintenant télécharger le fichier
      if (fileData) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw uploadError;
        }

        console.log('File uploaded successfully:', uploadData);
      }

      // Refresh file list
      await fetchFiles();
      fileInput.value = '';
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(`Failed to upload file: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  // Méthode alternative d'upload si la première échoue
  const handleFileUploadAlternative = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    if (!fileInput.files || fileInput.files.length === 0 || !projectId) {
      return;
    }

    const file = fileInput.files[0];
    const fileExt = file.name.split('.').pop();
    if (fileExt?.toLowerCase() !== 'pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Sanitize the original filename
      const sanitizedName = sanitizeFileName(file.name);
      
      // Create a unique filename with timestamp
      const fileName = `${Date.now()}_${sanitizedName}`;
      
      // Create the storage path - use just the project ID and filename
      const filePath = `${projectId}/${fileName}`;
      
      console.log('Uploading file to path:', filePath);
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Utiliser directement SQL pour insérer dans la table files
      const { data: fileData, error: sqlError } = await supabase.rpc('insert_file_record', {
        file_name: file.name,
        file_path: filePath,
        project_id: projectId
      });

      if (sqlError) {
        console.error('SQL error details:', sqlError);
        throw sqlError;
      }

      console.log('File record created via SQL:', fileData);

      // Refresh file list
      await fetchFiles();
      fileInput.value = '';
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(`Failed to upload file: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: number, storagePath: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('pdfs')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Update state
      setFiles(files.filter(f => f.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file');
    }
  };

  const getFileUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('pdfs').getPublicUrl(storagePath);
    return data.publicUrl;
  };

  if (loading && !project) {
    return <div className="text-center py-10">Loading project...</div>;
  }

  return (
    <div>
      <div className="mb-5">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </button>
      </div>

      {rlsStatus && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <p className="text-sm text-blue-700">Statut RLS:</p>
              <pre className="mt-1 text-xs text-blue-700 overflow-auto">
                {JSON.stringify(rlsStatus, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {project?.name}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Created on {project?.created_at && new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF
            </label>
            <div className="flex items-center">
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Upload className="h-4 w-4 inline mr-1" />
                {uploading ? 'Uploading...' : 'Choose PDF file'}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              <button
                onClick={checkRLS}
                className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Vérifier RLS
              </button>
              <label className="ml-2 cursor-pointer bg-green-100 py-2 px-3 border border-green-300 rounded-md shadow-sm text-sm leading-4 font-medium text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <Upload className="h-4 w-4 inline mr-1" />
                Méthode alternative
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileUploadAlternative}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <h4 className="text-md font-medium text-gray-700 mb-2">PDF Files</h4>
          {files.length === 0 ? (
            <p className="text-sm text-gray-500">No files uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`border rounded-lg p-3 cursor-pointer ${
                    selectedFile?.id === file.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id, file.storage_path);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {selectedFile.name}
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <PDFViewer fileUrl={getFileUrl(selectedFile.storage_path)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
