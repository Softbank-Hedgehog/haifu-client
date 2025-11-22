import React, { useEffect, useState, useRef } from 'react';
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    loadProjects();
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

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

  const handleMenuToggle = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    setOpenMenuId(openMenuId === projectId ? null : projectId);
  };

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setDeletingProjectId(projectId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProjectId) return;

    try {
      setDeleting(true);
      await projectUseCase.deleteProject(deletingProjectId);
      // 프로젝트 목록에서 제거
      setProjects(projects.filter(p => p.id !== deletingProjectId));
      setShowDeleteConfirm(false);
      setDeletingProjectId(null);
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      alert(error.message || 'Failed to delete project. Please try again.');
      setShowDeleteConfirm(false);
      setDeletingProjectId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeletingProjectId(null);
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
                  <div 
                    className="project-card-actions"
                    ref={(el) => { menuRefs.current[project.id] = el; }}
                  >
                    <button
                      className="project-menu-toggle"
                      onClick={(e) => handleMenuToggle(e, project.id)}
                      aria-label="More options"
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                    {openMenuId === project.id && (
                      <div className="project-menu-dropdown">
                        <button
                          className="project-menu-item delete-item"
                          onClick={(e) => handleDeleteClick(e, project.id)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
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

        {/* 삭제 확인 다이얼로그 */}
        {showDeleteConfirm && deletingProjectId && (
          <div className="modal-overlay" onClick={handleDeleteCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Delete Project</h2>
                <button
                  onClick={handleDeleteCancel}
                  className="modal-close-btn"
                  disabled={deleting}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this project?</p>
                <p style={{ color: 'var(--text-slate-400)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  <strong>Warning:</strong> This action cannot be undone. All services and deployments under this project will also be deleted.
                </p>
                <p style={{ fontWeight: 'bold', marginTop: '1rem' }}>
                  Project: {projects.find(p => p.id === deletingProjectId)?.name || 'Unknown'}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  onClick={handleDeleteCancel}
                  className="btn btn-secondary"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="btn btn-danger"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="material-symbols-outlined spin" style={{ marginRight: '0.5rem' }}>sync</span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>delete</span>
                      Delete Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MainPage;

