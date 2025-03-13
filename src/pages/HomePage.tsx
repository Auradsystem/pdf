import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { FileText, Edit, Users, Shield } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Annotate PDFs with ease
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            A powerful PDF editor that lets you annotate, highlight, and collaborate on documents in real-time.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              as={Link}
              to="/projects"
              size="lg"
              leftIcon={<FileText size={20} />}
            >
              Get Started
            </Button>
          </div>
        </div>
        
        <div className="mt-20">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            Features
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Edit className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Powerful Annotations</h3>
              <p className="mt-2 text-base text-gray-500">
                Add notes, highlights, and camera markers to your PDF documents with precision.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Project Management</h3>
              <p className="mt-2 text-base text-gray-500">
                Organize your PDFs into projects for better workflow and collaboration.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Secure Storage</h3>
              <p className="mt-2 text-base text-gray-500">
                Your documents are securely stored and only accessible to you and your collaborators.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-20 bg-blue-50 rounded-xl p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Sign up now and start annotating your PDF documents in minutes.
            </p>
            <div className="mt-8">
              <Button
                as={Link}
                to="/projects"
                size="lg"
              >
                Start Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
