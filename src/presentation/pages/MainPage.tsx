import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDependencies } from '../context/DependencyContext';
import { ProjectUseCase } from '../../application/useCases/ProjectUseCase';
import type { Project } from '../../domain/entities/Project';
import MainLayout from '../components/Layout/MainLayout';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectRepository } = useDependencies();
  const projectUseCase = new ProjectUseCase(projectRepository);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectList = await projectUseCase.listProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // 검색 필터링
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="dashboard-page">
          <div className="loading">Loading projects...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="dashboard-page">
        <div className="page-header">
          <div className="page-title-section">
            <h1>Projects</h1>
            <p className="page-subtitle">Manage your projects and services</p>
          </div>
          <button onClick={handleCreateProject} className="btn btn-primary create-btn">
            <span className="material-symbols-outlined">add</span>
            Create New Project
          </button>
        </div>

        {/* 검색 및 필터 바 */}
        <div className="search-filter-bar">
          <div className="search-input-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined">folder_open</span>
            </div>
            <h2>No projects yet</h2>
            <p>Create your first project to get started with deployments!</p>
            <button onClick={handleCreateProject} className="btn btn-primary">
              <span className="material-symbols-outlined">add</span>
              Create Project
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <p>No projects match your search.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="project-card-header">
                  <div className="project-icon">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      folder
                    </span>
                  </div>
                  <div className="project-card-actions">
                    <span className="material-symbols-outlined">more_vert</span>
                  </div>
                </div>
                <div className="project-card-body">
                  <h3>{project.name}</h3>
                  <p className="project-description">
                    {project.description || 'No description'}
                  </p>
                </div>
                <div className="project-card-footer">
                  <span className="project-meta">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
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

export default MainPage;

