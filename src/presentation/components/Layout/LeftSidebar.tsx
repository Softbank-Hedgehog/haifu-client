import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDependencies } from '../../context/DependencyContext';
import { ProjectUseCase } from '../../../application/useCases/ProjectUseCase';
import type { Project } from '../../../domain/entities/Project';

interface LeftSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  isCollapsed: externalCollapsed, 
  onToggle,
  onCollapseChange 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { projectRepository } = useDependencies();
  const projectUseCase = new ProjectUseCase(projectRepository);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProjects, setExpandedProjects] = useState(true);
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // 16rem = 256px
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  
  // 외부에서 전달된 collapsed 상태를 사용하거나 내부 상태 사용
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  useEffect(() => {
    loadProjects();
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      const minWidth = 48; // 3rem
      const maxWidth = 384; // 24rem
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
        const newCollapsed = newWidth <= minWidth + 10;
        if (onCollapseChange) {
          onCollapseChange(newCollapsed);
        } else {
          setInternalCollapsed(newCollapsed);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    if (onToggle) {
      onToggle();
    } else if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
    
    if (!newCollapsed) {
      setSidebarWidth(256);
    } else {
      setSidebarWidth(48);
    }
  };

  const loadProjects = async () => {
    try {
      const projectList = await projectUseCase.listProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isProjectActive = (projectId: string) => {
    return location.pathname.includes(`/projects/${projectId}`);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <aside 
      ref={sidebarRef}
      className={`sidebar sidebar-left ${isCollapsed ? 'collapsed' : ''}`}
      style={{ width: `${sidebarWidth}px` }}
    >
      <div 
        ref={resizerRef}
        className={`sidebar-resizer ${isResizing ? 'resizing' : ''}`}
        onMouseDown={handleMouseDown}
      />
      <button 
        className="sidebar-toggle-btn"
        onClick={toggleCollapse}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon"></div>
            <div className="logo-text">
              <h1>Hedgehog Deploy</h1>
              <p>Workspace</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`nav-item ${isActive('/') && !location.pathname.includes('/projects/') ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
            <span>Projects</span>
          </Link>
          <Link
            to="/settings"
            className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </nav>

        {/* 프로젝트 리스트 */}
        <div className="sidebar-projects">
          <div 
            className="projects-header"
            onClick={() => setExpandedProjects(!expandedProjects)}
          >
            <span className="material-symbols-outlined">folder</span>
            <span>Projects</span>
            <span className="material-symbols-outlined expand-icon">
              {expandedProjects ? 'expand_less' : 'expand_more'}
            </span>
          </div>
          
          {expandedProjects && (
            <div className="projects-list">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`project-nav-item ${isProjectActive(project.id) ? 'active' : ''}`}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <span className="material-symbols-outlined">folder_open</span>
                  <span>{project.name}</span>
                </div>
              ))}
              <Link
                to="/projects/new"
                className="project-nav-item new-project"
              >
                <span className="material-symbols-outlined">add</span>
                <span>New Project</span>
              </Link>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <Link to="/help" className="nav-item">
            <span className="material-symbols-outlined">help</span>
            <span>Help & Support</span>
          </Link>
          <button onClick={logout} className="nav-item logout-btn">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
      {/* 접혔을 때 하단에 보이는 토글 버튼 */}
      {isCollapsed && (
        <button 
          className="sidebar-toggle-btn-bottom"
          onClick={toggleCollapse}
          aria-label="Expand sidebar"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      )}
    </aside>
  );
};

export default LeftSidebar;

