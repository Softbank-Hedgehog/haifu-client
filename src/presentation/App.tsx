import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DependencyProvider } from './context/DependencyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import CallbackPage from './pages/CallbackPage';
import MainPage from './pages/MainPage';
import ProjectCreationPage from './pages/ProjectCreationPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import ServiceDeploymentFlow from './pages/ServiceDeploymentFlow';
import PipelineStatusPage from './pages/PipelineStatusPage';
import DeployLogPage from './pages/DeployLogPage';
import AIChatPage from './pages/AIChatPage';
import './styles/common.css';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/callback"
        element={<CallbackPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <ProjectCreationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/resources/new"
        element={
          <ProtectedRoute>
            <ServiceDeploymentFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/resources/:resourceId"
        element={
          <ProtectedRoute>
            <ResourceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/resources/:resourceId/pipeline"
        element={
          <ProtectedRoute>
            <PipelineStatusPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/resources/:resourceId/logs"
        element={
          <ProtectedRoute>
            <DeployLogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/resources/:resourceId/ai-chat"
        element={
          <ProtectedRoute>
            <AIChatPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  
  return (
    <DependencyProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </DependencyProvider>
  );
};

export default App;

