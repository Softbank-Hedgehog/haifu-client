import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDependencies } from '../context/DependencyContext';
import { ResourceUseCase } from '../../application/useCases/ResourceUseCase';
import type { Resource } from '../../domain/entities/Resource';
import type { Deployment } from '../../domain/entities/Deployment';
import MainLayout from '../components/Layout/MainLayout';

const ResourceDetailPage: React.FC = () => {
  const { projectId, resourceId } = useParams<{ projectId: string; resourceId: string }>();
  const navigate = useNavigate();
  const { resourceRepository } = useDependencies();
  const resourceUseCase = new ResourceUseCase(resourceRepository);
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'deployments' | 'repo' | 'logs' | 'ai'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resourceId) {
      loadResource();
    }
  }, [resourceId]);

  const loadResource = async () => {
    if (!resourceId) return;
    try {
      setLoading(true);
      const data = await resourceUseCase.getResource(resourceId);
      setResource(data.resource);
      setDeployments(data.deployments);
    } catch (error) {
      console.error('Failed to load resource:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !resource) {
    return (
      <MainLayout>
        <div className="loading">Loading service...</div>
      </MainLayout>
    );
  }

  const currentDeployment = deployments[0]; // Most recent deployment

  return (
    <MainLayout>
      <div className="service-detail-page">
        <div className="page-header">
          <button onClick={() => navigate(`/projects/${projectId}`)} className="back-btn">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="page-title-section">
            <div className="service-header-info">
              <h1>{resource.name}</h1>
              <span className={`status-badge status-${resource.status}`}>
                {resource.status}
              </span>
            </div>
            <p className="page-subtitle">Service deployment details and monitoring</p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="service-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'deployments' ? 'active' : ''}`}
            onClick={() => setActiveTab('deployments')}
          >
            <span className="material-symbols-outlined">history</span>
            Deployment History
          </button>
          <button
            className={`tab-btn ${activeTab === 'repo' ? 'active' : ''}`}
            onClick={() => setActiveTab('repo')}
          >
            <span className="material-symbols-outlined">code</span>
            GitHub Repo
          </button>
          <button
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('logs');
              navigate(`/projects/${projectId}/resources/${resourceId}/logs`);
            }}
          >
            <span className="material-symbols-outlined">description</span>
            Logs
          </button>
          <button
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('ai');
              navigate(`/projects/${projectId}/resources/${resourceId}/ai-chat`);
            }}
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            AI Analysis
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="service-overview">
            <div className="info-cards">
              <div className="info-card">
                <div className="info-card-header">
                  <span className="material-symbols-outlined">deployed_code</span>
                  <h3>Deployment Specs</h3>
                </div>
                <div className="info-card-content">
                  <div className="spec-item">
                    <span className="spec-label">Service Name:</span>
                    <span className="spec-value">{resource.name}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Status:</span>
                    <span className={`spec-value status-${resource.status}`}>{resource.status}</span>
                  </div>
                  {currentDeployment && (
                    <>
                      <div className="spec-item">
                        <span className="spec-label">Current Version:</span>
                        <span className="spec-value">v{currentDeployment.version}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Created:</span>
                        <span className="spec-value">{new Date(currentDeployment.createdAt).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <span className="material-symbols-outlined">link</span>
                  <h3>Access Information</h3>
                </div>
                <div className="info-card-content">
                  <div className="spec-item">
                    <span className="spec-label">Endpoint:</span>
                    <span className="spec-value">https://example.com</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Health Check:</span>
                    <span className="spec-value status-running">Healthy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deployment History Tab */}
        {activeTab === 'deployments' && (
          <div className="deployments-section">
            <div className="deployments-list">
              {deployments.length === 0 ? (
                <div className="empty-state">
                  <p>No deployments yet.</p>
                </div>
              ) : (
                deployments.map((deployment) => (
                  <div key={deployment.id} className="deployment-card">
                    <div className="deployment-card-header">
                      <div className="deployment-version">
                        <span className="material-symbols-outlined">tag</span>
                        <h3>v{deployment.version}</h3>
                      </div>
                      <span className={`status-badge status-${deployment.status}`}>
                        {deployment.status}
                      </span>
                    </div>
                    <div className="deployment-card-body">
                      <div className="deployment-meta">
                        <span>
                          <span className="material-symbols-outlined">schedule</span>
                          Created: {new Date(deployment.createdAt).toLocaleString()}
                        </span>
                        {deployment.completedAt && (
                          <span>
                            <span className="material-symbols-outlined">check_circle</span>
                            Completed: {new Date(deployment.completedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/projects/${projectId}/resources/${resourceId}/pipeline`)}
                      >
                        <span className="material-symbols-outlined">timeline</span>
                        View Pipeline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* GitHub Repo Tab */}
        {activeTab === 'repo' && (
          <div className="repo-section">
            <div className="repo-card">
              <h3>Repository Information</h3>
              <div className="repo-info">
                <p>GitHub repository information will be displayed here.</p>
                {/* TODO: GitHub Repo 정보 표시 */}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ResourceDetailPage;

