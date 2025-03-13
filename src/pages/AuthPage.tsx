import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { FileText } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center mb-8">
        <FileText className="h-16 w-16 text-blue-600" />
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900">PDF Editor</h1>
        <p className="mt-2 text-center text-gray-600 max-w-md">
          Annotate, highlight, and collaborate on PDF documents with ease.
        </p>
      </div>
      
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm 
            onRegisterClick={() => setIsLogin(false)} 
            onSuccess={() => {}} 
          />
        ) : (
          <RegisterForm 
            onLoginClick={() => setIsLogin(true)} 
            onSuccess={() => setIsLogin(true)} 
          />
        )}
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
