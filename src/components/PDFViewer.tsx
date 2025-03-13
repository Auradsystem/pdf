import React, { useEffect, useState } from 'react';
import { supabase, File } from '../lib/supabase';

interface PDFViewerProps {
  file: File;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.storage
          .from('pdfs')
          .createSignedUrl(file.storage_path, 3600); // 1 hour expiry

        if (error) throw error;
        setPdfUrl(data.signedUrl);
      } catch (error: any) {
        console.error('Error fetching PDF URL:', error);
        setError('Failed to load PDF file');
      } finally {
        setLoading(false);
      }
    };

    if (file) {
      fetchPdfUrl();
    }

    return () => {
      // Clean up URL object if needed
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [file]);

  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg h-full flex items-center justify-center">
        <div className="text-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg h-full flex items-center justify-center">
        <div className="text-center p-12">
          <div className="text-red-500 mx-auto mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading PDF</h3>
          <p className="text-sm text-gray-500">
            {error || 'Unable to load the PDF file'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg h-[calc(100vh-200px)]">
      <div className="px-4 py-3 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
          {file.name}
        </h3>
      </div>
      <iframe
        src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
        className="w-full h-full"
        title={file.name}
        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-same-origin allow-scripts allow-top-navigation"
      />
    </div>
  );
};

export default PDFViewer;
