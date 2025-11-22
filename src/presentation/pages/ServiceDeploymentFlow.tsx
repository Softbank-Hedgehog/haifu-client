import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDependencies } from '../context/DependencyContext';
import { ResourceUseCase } from '../../application/useCases/ResourceUseCase';
import { RepositoryUseCase } from '../../application/useCases/RepositoryUseCase';
import type { ServiceDeploymentConfig } from '../../application/dto/ResourceDTO';
import type { ServerSpec } from '../../domain/valueObjects/ServerSpec';
import type { GitHubRepository } from '../../domain/valueObjects/GitHubRepository';
import type { Repository } from '../../domain/entities/Repository';
import MainLayout from '../components/Layout/MainLayout';
import Step1RepositorySelection from '../components/DeploymentFlow/Step1RepositorySelection';
import Step2BuildConfiguration from '../components/DeploymentFlow/Step2BuildConfiguration';
import Step3ServiceConfiguration from '../components/DeploymentFlow/Step3ServiceConfiguration';
import Step4ReviewAndCreate from '../components/DeploymentFlow/Step4ReviewAndCreate';

const ServiceDeploymentFlow: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resourceRepository, repositoryRepository } = useDependencies();
  const resourceUseCase = new ResourceUseCase(resourceRepository);
  const repositoryUseCase = new RepositoryUseCase(repositoryRepository);
  
  const resourceType = (searchParams.get('type') || 'service') as 'service' | 'database';
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [s3Url, setS3Url] = useState<string | null>(null);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);

  // Step 1: Repository Selection
  const [repository, setRepository] = useState<GitHubRepository>({
    owner: '',
    name: '',
    branch: 'main',
    path: '/',
  });

  // Step 2: Build Configuration
  const [buildConfig, setBuildConfig] = useState({
    runtime: 'nodejs18',
    buildCommand: '',
    startCommand: '',
    port: '8080',
  });

  // Step 3: Service Configuration
  const [serviceConfig, setServiceConfig] = useState({
    name: '',
    cpu: 1,
    memory: 2,
    environmentVariables: [] as Array<{ name: string; value: string }>,
  });

  const handleNext = async () => {
    // Step 1에서 Next 클릭 시 repository를 S3에 저장
    if (currentStep === 1) {
      if (!projectId || !repository.owner || !repository.name || !selectedRepository) {
        alert('Please select a repository first');
        return;
      }

      try {
        setLoading(true);
        
        const generateRandomLong = (): number => {
          const array = new Uint8Array(8);
          crypto.getRandomValues(array);
          
          let longValue = BigInt(0);
          for (let i = 0; i < 8; i++) {
            longValue = (longValue << BigInt(8)) | BigInt(array[i]);
          }
          
          // 양수로 만들기 (부호 비트 제거)
          longValue = longValue & BigInt('0x7FFFFFFFFFFFFFFF');
          
          const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
          if (longValue > MAX_SAFE_INTEGER) {
            longValue = longValue % MAX_SAFE_INTEGER;
          }
          
          return Number(longValue);
        };
        
        const tmpId = generateRandomLong();
        console.log('[ServiceDeploymentFlow] Generated tmp_id (Long):', tmpId);
        
        const response = await repositoryUseCase.saveRepositoryToS3({
          project_id: projectId || '',
          tmp_id: tmpId,
          owner: repository.owner,
          repo: repository.name,
          branch: repository.branch || 'main',
          source_path: repository.path || '/',
        });

        // S3 URL 저장
        setS3Url(response.url);
        setCurrentStep(currentStep + 1);
      } catch (error: any) {
        console.error('Failed to save repository to S3:', error);
        alert(error.message || 'Failed to save repository to S3. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // 다른 단계에서는 바로 다음 단계로 이동
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(`/projects/${projectId}`);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate(`/projects/${projectId}`);
    }
  };

  const handleSubmit = async () => {
    if (!projectId) return;
    if (!serviceConfig.name.trim()) {
      alert('Service name is required');
      return;
    }

    try {
      setLoading(true);
      
      const deploymentConfig: ServiceDeploymentConfig = {
        repository,
        serverSpec: {
          cpu: serviceConfig.cpu,
          memory: serviceConfig.memory,
        },
        environmentVariables: serviceConfig.environmentVariables.reduce(
          (acc, env) => {
            if (env.name && env.value) {
              acc[env.name] = env.value;
            }
            return acc;
          },
          {} as Record<string, string>
        ),
      };

      const resource = await resourceUseCase.createResource({
        projectId,
        type: resourceType,
        name: serviceConfig.name.trim(),
        config: deploymentConfig,
      });

      navigate(`/projects/${projectId}/resources/${resource.id}/pipeline`);
    } catch (error) {
      console.error('Failed to create resource:', error);
      alert('Failed to create service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Step 1 of 4: Source and Deployment';
      case 2:
        return 'Step 2 of 4: Build Configuration';
      case 3:
        return 'Step 3 of 4: Service Configuration';
      case 4:
        return 'Step 4 of 4: Review and Create';
      default:
        return '';
    }
  };

  return (
    <MainLayout>
      <div className="deployment-flow-page">
        <div className="page-header">
          <button onClick={handleCancel} className="back-btn">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="page-title-section">
            <h1>Create Service Deployment</h1>
            <p className="page-subtitle">{getStepTitle()}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-steps">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className={`progress-step ${step === currentStep ? 'active' : step < currentStep ? 'completed' : ''}`}>
                  <div className="step-number">{step < currentStep ? '✓' : step}</div>
                  <div className="step-label">
                    {step === 1 && 'Source'}
                    {step === 2 && 'Build'}
                    {step === 3 && 'Service'}
                    {step === 4 && 'Review'}
                  </div>
                </div>
                {step < 4 && (
                  <div className={`progress-line ${step < currentStep ? 'completed' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="step-content">
          {currentStep === 1 && (
            <Step1RepositorySelection
              repository={repository}
              onRepositoryChange={setRepository}
              onRepositorySelect={setSelectedRepository}
            />
          )}
          {currentStep === 2 && (
            <Step2BuildConfiguration
              buildConfig={buildConfig}
              onBuildConfigChange={setBuildConfig}
              s3Url={s3Url}
            />
          )}
          {currentStep === 3 && (
            <Step3ServiceConfiguration
              serviceConfig={serviceConfig}
              onServiceConfigChange={setServiceConfig}
            />
          )}
          {currentStep === 4 && (
            <Step4ReviewAndCreate
              repository={repository}
              buildConfig={buildConfig}
              serviceConfig={serviceConfig}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="deployment-flow-actions">
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
          <div className="nav-buttons">
            {currentStep > 1 && (
              <button onClick={handleBack} className="btn btn-secondary">
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
            )}
            {currentStep < 4 ? (
              <button onClick={handleNext} className="btn btn-primary">
                Next Step
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !serviceConfig.name.trim()}
                className="btn btn-primary"
              >
                {loading ? 'Creating...' : 'Create Service'}
                <span className="material-symbols-outlined">deployed_code</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ServiceDeploymentFlow;

