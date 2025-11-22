import React from 'react';
import type { GitHubRepository } from '../../../domain/valueObjects/GitHubRepository';

interface BuildConfig {
  runtime: string;
  buildCommand: string;
  startCommand: string;
  port: string;
}

interface ServiceConfig {
  name: string;
  cpu: number;
  memory: number;
  environmentVariables: Array<{ name: string; value: string }>;
}

interface Step4ReviewAndCreateProps {
  repository: GitHubRepository;
  buildConfig: BuildConfig;
  serviceConfig: ServiceConfig;
}

const Step4ReviewAndCreate: React.FC<Step4ReviewAndCreateProps> = ({
  repository,
  buildConfig,
  serviceConfig,
}) => {
  return (
    <div className="review-page">
      <div className="review-card">
        <div style = {{ padding: '1rem' }}>
          <div className="review-header">
            <h2>Review and Create</h2>
            <p>Please review your service configuration before creating.</p>
          </div>

          {/* Step 1: Source and Deployment */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>1. Source and Deployment</h3>
              <span className="material-symbols-outlined">edit</span>
            </div>
            <div className="review-content">
              <div className="review-item">
                <span className="review-label">Repository Provider:</span>
                <span className="review-value">GitHub</span>
              </div>
              <div className="review-item">
                <span className="review-label">Repository:</span>
                <span className="review-value">{repository.owner}/{repository.name}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Branch:</span>
                <span className="review-value">{repository.branch}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Source Directory:</span>
                <span className="review-value">{repository.path || '/'}</span>
              </div>
            </div>
          </div>

          {/* Step 2: Build Configuration */}
            <div className="review-section">
              <div className="review-section-header">
                <h3>2. Build Configuration</h3>
                <span className="material-symbols-outlined">edit</span>
              </div>
              <div className="review-content">
                <div className="review-item">
                  <span className="review-label">Configuration Source:</span>
                  <span className="review-value">API</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Runtime:</span>
                  <span className="review-value">{buildConfig.runtime}</span>
                </div>
                {buildConfig.buildCommand && (
                  <div className="review-item">
                    <span className="review-label">Build Command:</span>
                    <span className="review-value">{buildConfig.buildCommand}</span>
                  </div>
                )}
                <div className="review-item">
                  <span className="review-label">Start Command:</span>
                  <span className="review-value">{buildConfig.startCommand || 'Not specified'}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Port:</span>
                  <span className="review-value">{buildConfig.port}</span>
                </div>
              </div>
            </div>

          {/* Step 3: Service Configuration */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>3. Service Configuration</h3>
              <span className="material-symbols-outlined">edit</span>
            </div>
            <div className="review-content">
              <div className="review-item">
                <span className="review-label">Service Name:</span>
                <span className="review-value">{serviceConfig.name}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Virtual CPU:</span>
                <span className="review-value">{serviceConfig.cpu} vCPU</span>
              </div>
              <div className="review-item">
                <span className="review-label">Virtual Memory:</span>
                <span className="review-value">{serviceConfig.memory} GB</span>
              </div>
              {serviceConfig.environmentVariables.length > 0 && (
                <div className="review-item">
                  <span className="review-label">Environment Variables:</span>
                  <div className="review-value">
                    {serviceConfig.environmentVariables.map((env, idx) => (
                      <div key={idx} className="env-var-review">
                        <strong>{env.name}</strong> = {env.value || '(empty)'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="review-summary">
            <div className="summary-card">
              <h4>Service Summary</h4>
              <div className="summary-grid">
                <div>
                  <span className="summary-label">Service Name</span>
                  <span className="summary-value">{serviceConfig.name}</span>
                </div>
                <div>
                  <span className="summary-label">Repository</span>
                  <span className="summary-value">{repository.owner}/{repository.name}</span>
                </div>
                <div>
                  <span className="summary-label">Branch</span>
                  <span className="summary-value">{repository.branch}</span>
                </div>
                <div>
                  <span className="summary-label">Server Spec</span>
                  <span className="summary-value">{serviceConfig.cpu} vCPU & {serviceConfig.memory} GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4ReviewAndCreate;

