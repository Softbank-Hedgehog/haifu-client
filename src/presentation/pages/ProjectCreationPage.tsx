import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDependencies } from '../context/DependencyContext';
import { ProjectUseCase } from '../../application/useCases/ProjectUseCase';
import MainLayout from '../components/Layout/MainLayout';

const ProjectCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectRepository } = useDependencies();
  const projectUseCase = new ProjectUseCase(projectRepository);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Project name is required');
      return;
    }

    try {
      setLoading(true);
      const project = await projectUseCase.createProject({
        name: name.trim(),
        description: description.trim(),
      });
      navigate(`/projects/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="project-creation-page">
        <div className="page-header">
          <button onClick={() => navigate('/')} className="back-btn">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="page-title-section">
            <h1>Create a New Project</h1>
            <p className="page-subtitle">Start by giving your project a name and description.</p>
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <h2>Project Details</h2>
            <p>These details will help identify your project across the platform.</p>
          </div>

          <form onSubmit={handleSubmit} className="project-form">
            <div className="form-group">
              <label htmlFor="project-name">Project Name</label>
              <input
                id="project-name"
                type="text"
                placeholder="e.g., My Awesome App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-description">Project Description (Optional)</label>
              <textarea
                id="project-description"
                placeholder="Describe your project..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="btn btn-primary"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProjectCreationPage;

