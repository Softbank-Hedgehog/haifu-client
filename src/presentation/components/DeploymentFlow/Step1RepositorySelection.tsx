import React, { useState, useEffect } from 'react';
import { useDependencies } from '../../context/DependencyContext';
import { RepositoryUseCase } from '../../../application/useCases/RepositoryUseCase';
import type { GitHubRepository } from '../../../domain/valueObjects/GitHubRepository';
import type { Repository } from '../../../domain/entities/Repository';

interface Step1RepositorySelectionProps {
  repository: GitHubRepository;
  onRepositoryChange: (repository: GitHubRepository) => void;
  onRepositorySelect: (repository: Repository) => void;
}

const Step1RepositorySelection: React.FC<Step1RepositorySelectionProps> = ({
  repository,
  onRepositoryChange,
  onRepositorySelect,
}) => {
  const { repositoryRepository } = useDependencies();
  const repositoryUseCase = new RepositoryUseCase(repositoryRepository);
  
  const [allRepositories, setAllRepositories] = useState<Repository[]>([]);
  const [repositories, setRepositories] = useState<Array<{ owner: string; name: string; fullName: string }>>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await repositoryUseCase.listRepositories({
        page: 1,
        per_page: 30,
      });

      // 전체 Repository 엔티티 저장
      setAllRepositories(response.repositories);

      const repoList = response.repositories.map((repo) => {
        const [owner, name] = repo.fullName.split('/');
        return {
          owner: owner || '',
          name: name || repo.name,
          fullName: repo.fullName,
        };
      });
      
      setRepositories(repoList);
    } catch (err: any) {
      console.error('Failed to load repositories:', err);
      setError(err?.message || 'Failed to load repositories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repository.owner && repository.name) {
      setSelectedRepo(`${repository.owner}/${repository.name}`);
      // TODO: GitHub API로 브랜치 목록 가져오기
      setBranches(['main', 'dev', 'develop', 'master']);
    }
  }, [repository]);

  const handleRepoSelect = (fullName: string) => {
    const [owner, name] = fullName.split('/');
    setSelectedRepo(fullName);
    
    // 선택된 Repository 엔티티 찾기
    const selectedRepoEntity = allRepositories.find((repo) => repo.fullName === fullName);
    if (selectedRepoEntity) {
      onRepositorySelect(selectedRepoEntity);
    }
    
    onRepositoryChange({
      ...repository,
      owner,
      name,
    });
    // TODO: 브랜치 목록 다시 가져오기
    setBranches(['main', 'dev', 'develop', 'master']);
    onRepositoryChange({
      owner,
      name,
      branch: 'main',
      path: repository.path || '/',
    });
  };

  const handleBranchChange = (branch: string) => {
    onRepositoryChange({
      ...repository,
      branch,
    });
  };

  const handlePathChange = (path: string) => {
    onRepositoryChange({
      ...repository,
      path: path || '/',
    });
  };

  return (
    <div className="step-form-card">
      <div style = {{ padding: '1rem' }}>
        <div className="form-card-header">
          <h2>Source and Deployment</h2>
          <p>Select the GitHub repository and branch to deploy.</p>
        </div>

        <div className="form-group">
          <label htmlFor="repository">Repository</label>
          {loading ? (
            <div className="form-loading">Loading repositories...</div>
          ) : error ? (
            <div className="form-error">
              <p>{error}</p>
              <button type="button" onClick={loadRepositories} className="btn btn-secondary btn-sm">
                Retry
              </button>
            </div>
          ) : (
            <select
              id="repository"
              value={selectedRepo}
              onChange={(e) => handleRepoSelect(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select a repository</option>
              {repositories.map((repo) => (
                <option key={repo.fullName} value={repo.fullName}>
                  {repo.fullName}
                </option>
              ))}
            </select>
          )}
          <p className="form-hint">Select the GitHub repository to deploy from.</p>
        </div>

        {repository.owner && repository.name && (
          <>
            <div className="form-group">
              <label htmlFor="branch">Branch</label>
              <select
                id="branch"
                value={repository.branch}
                onChange={(e) => handleBranchChange(e.target.value)}
                required
              >
                <option value="">Select a branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              <p className="form-hint">Select the branch to deploy from.</p>
            </div>

            <div className="form-group">
              <label htmlFor="source-path">Source Directory (Optional)</label>
              <input
                id="source-path"
                type="text"
                placeholder="/"
                value={repository.path || '/'}
                onChange={(e) => handlePathChange(e.target.value)}
              />
              <p className="form-hint">The directory path in the repository. Defaults to root (/).</p>
            </div>

            <div className="info-box">
              <span className="material-symbols-outlined">info</span>
              <div>
                <strong>Auto-detection</strong>
                <p>Agent will automatically detect the tech stack and determine static/dynamic deployment based on the repository contents.</p>
              </div>
            </div>
          </>
        )}   
      </div>
    </div>
  );
};

export default Step1RepositorySelection;

