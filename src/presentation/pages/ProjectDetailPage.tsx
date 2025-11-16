import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDependencies } from '../context/DependencyContext';
import { ProjectUseCase } from '../../application/useCases/ProjectUseCase';
import { ResourceUseCase } from '../../application/useCases/ResourceUseCase';
import type { Project } from '../../domain/entities/Project';
import type { Resource } from '../../domain/entities/Resource';
import MainLayout from '../components/Layout/MainLayout';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projectRepository, resourceRepository } = useDependencies();
  const projectUseCase = new ProjectUseCase(projectRepository);
  const resourceUseCase = new ResourceUseCase(resourceRepository);
  
  const [project, setProject] = useState<Project | null>(null);
  const [services, setServices] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showResourceTypeMenu, setShowResourceTypeMenu] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadServices();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    try {
      const proj = await projectUseCase.getProject(projectId);
      setProject(proj);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const loadServices = async () => {
    if (!projectId) return;
    try {
      const resourceList = await resourceUseCase.listResources(projectId);
      // 서비스 타입만 필터링
      const serviceList = resourceList.filter(r => r.type === 'service');
      setServices(serviceList);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = (type: 'service' | 'database') => {
    setShowResourceTypeMenu(false);
    navigate(`/projects/${projectId}/resources/new?type=${type}`);
  };

  const handleServiceClick = (resourceId: string) => {
    navigate(`/projects/${projectId}/resources/${resourceId}`);
  };

  // 필터링
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading || !project) {
    return (
      <MainLayout>
        <div className="loading">Loading project...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="project-detail-page">
        <div className="page-header">
          <div className="page-title-section">
            <h1>{project.name}</h1>
            <p className="page-subtitle">{project.description || 'Manage your services and deployments'}</p>
          </div>
          <div className="resource-type-toggle">
            <button 
              onClick={() => setShowResourceTypeMenu(!showResourceTypeMenu)}
              className="btn btn-primary create-btn"
            >
              <span className="material-symbols-outlined">add</span>
              Create Resource
              <span className="material-symbols-outlined">arrow_drop_down</span>
            </button>
            {showResourceTypeMenu && (
              <div className="resource-type-menu">
                <button
                  onClick={() => handleCreateResource('service')}
                  className="resource-type-option"
                >
                  <span className="material-symbols-outlined">deployed_code</span>
                  <div>
                    <strong>Service Deployment</strong>
                    <p>Deploy a web service or API</p>
                  </div>
                </button>
                <button
                  onClick={() => handleCreateResource('database')}
                  className="resource-type-option"
                >
                  <span className="material-symbols-outlined">storage</span>
                  <div>
                    <strong>Database</strong>
                    <p>Set up a database instance</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 검색 및 필터 바 */}
        <div className="search-filter-bar">
          <div className="search-input-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${statusFilter === 'running' ? 'active' : ''}`}
              onClick={() => setStatusFilter('running')}
            >
              Running
            </button>
            <button
              className={`filter-btn ${statusFilter === 'failed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('failed')}
            >
              Failed
            </button>
            <button
              className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </button>
          </div>
        </div>

        {services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined">deployed_code</span>
            </div>
            <h2>No services yet</h2>
            <p>Create your first service deployment to get started!</p>
            <button onClick={() => handleCreateResource('service')} className="btn btn-primary">
              <span className="material-symbols-outlined">add</span>
              Create Service
            </button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="empty-state">
            <p>No services match your filters.</p>
          </div>
        ) : (
          <div className="services-list">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="service-card"
                onClick={() => handleServiceClick(service.id)}
              >
                <div className="service-card-header">
                  <div className="service-info">
                    <span className="material-symbols-outlined service-icon">deployed_code</span>
                    <div>
                      <h3>{service.name}</h3>
                      <p className="service-type">Service Deployment</p>
                    </div>
                  </div>
                  <span className={`status-badge status-${service.status}`}>
                    {service.status}
                  </span>
                </div>
                <div className="service-card-body">
                  <div className="service-meta">
                    <span>Updated {new Date(service.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="service-card-footer">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectDetailPage;

