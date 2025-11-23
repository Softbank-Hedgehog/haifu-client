import React, { useState, useEffect } from 'react';
import type { RepositoryUseCase } from '../../../application/useCases/RepositoryUseCase';
import type { GitHubRepository } from '../../../domain/valueObjects/GitHubRepository';
import type { AgentAnalysisRequest } from '../../../application/dto/AgentDTO';
import type { DeploymentRequest } from '../../../application/dto/DeploymentDTO';

interface BuildConfig {
  runtime: string;
  buildCommand: string;
  startCommand: string;
  port: string;
}

interface Step2BuildConfigurationProps {
  buildConfig: BuildConfig;
  onBuildConfigChange: (config: BuildConfig) => void;
  onServiceTypeChange?: (serviceType: "static" | "dynamic") => void;
  onDeploymentDataChange?: (data: any) => void;
  s3Url?: string | null;
  repository: GitHubRepository;
  projectId: string;
  userId: string;
  repositoryUseCase: RepositoryUseCase;
}

const Step2BuildConfiguration: React.FC<Step2BuildConfigurationProps> = ({
  buildConfig,
  onBuildConfigChange,
  onServiceTypeChange,
  onDeploymentDataChange,
  s3Url,
  repository,
  projectId,
  userId,
  repositoryUseCase,
}) => {
  const [showDockerInfo, setShowDockerInfo] = useState(false);
  const [dockerDetected, setDockerDetected] = useState(false);
  const [dockerfileContent, setDockerfileContent] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // 주요 파일 목록 (AI 분석에 사용할 파일들)
  const importantFiles = [
    'package.json',
    'requirements.txt',
    'pom.xml',
    'build.gradle',
    'go.mod',
    'Dockerfile',
    'docker-compose.yml',
    'package-lock.json',
    'yarn.lock',
    'tsconfig.json',
    'webpack.config.js',
    'vite.config.js',
    'index.js',
    'app.js',
    'main.py',
    'setup.py',
  ];

  // Repository 파일 내용 가져오기
  const fetchRepositoryFiles = async (): Promise<Array<{ path: string; content: string }>> => {
    if (!repository.owner || !repository.name) {
      return [];
    }

    const files: Array<{ path: string; content: string }> = [];
    
    try {
      // 루트 디렉토리 내용 가져오기
      const rootContents = await repositoryUseCase.listRepositories();
      const repositoryContents = await repositoryUseCase.getRepositoryContents(
        repository.owner,
        repository.name,
        repository.path || '/',
        repository.branch || 'main'
      );

      // 주요 파일들 찾기 및 내용 가져오기
      for (const file of importantFiles) {
        try {
          const fileContents = await repositoryUseCase.getRepositoryContents(
            repository.owner,
            repository.name,
            file,
            repository.branch || 'main'
          );
          
          if (fileContents && fileContents.length > 0) {
            const fileContent = fileContents[0];
            if (fileContent.type === 'file' && fileContent.content) {
              // Base64 디코딩 (GitHub API는 base64로 인코딩됨)
              try {
                const decodedContent = atob(fileContent.content.replace(/\s/g, ''));
                files.push({
                  path: fileContent.path,
                  content: decodedContent,
                });
              } catch (e) {
                // Base64 디코딩 실패 시 원본 내용 사용
                files.push({
                  path: fileContent.path,
                  content: fileContent.content,
                });
              }
            }
          }
        } catch (error) {
          // 파일을 찾지 못했으면 무시
          console.debug(`File ${file} not found`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch repository files:', error);
    }

    return files;
  };

  // S3 URL에서 bucket과 prefix 추출
  const parseS3Url = (url: string): { bucket: string; prefix: string } | null => {
    try {
      // s3://bucket/prefix 형식
      if (url.startsWith('s3://')) {
        const withoutProtocol = url.substring(5); // 's3://' 제거
        const firstSlash = withoutProtocol.indexOf('/');
        if (firstSlash === -1) {
          return { bucket: withoutProtocol, prefix: '' };
        }
        const bucket = withoutProtocol.substring(0, firstSlash);
        const prefix = withoutProtocol.substring(firstSlash + 1);
        return { bucket, prefix };
      }

      // https://bucket.s3.region.amazonaws.com/prefix 형식
      if (url.startsWith('https://')) {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        
        // bucket.s3.region.amazonaws.com 형식
        if (hostname.includes('.s3.') && hostname.includes('.amazonaws.com')) {
          const bucket = hostname.split('.')[0];
          const prefix = urlObj.pathname.substring(1); // 첫 번째 '/' 제거
          return { bucket, prefix };
        }
        
        // s3.region.amazonaws.com/bucket/prefix 형식
        if (hostname.includes('.amazonaws.com')) {
          const pathParts = urlObj.pathname.split('/').filter(p => p);
          if (pathParts.length >= 1) {
            const bucket = pathParts[0];
            const prefix = pathParts.slice(1).join('/');
            return { bucket, prefix };
          }
        }
      }

      // JSON 형식으로 받은 경우 (예: {"bucket": "...", "prefix": "..."})
      try {
        const parsed = JSON.parse(url);
        if (parsed.bucket && parsed.prefix !== undefined) {
          return { bucket: parsed.bucket, prefix: parsed.prefix };
        }
      } catch (e) {
        // JSON 파싱 실패는 무시
      }

      console.error('[Step2BuildConfiguration] Unable to parse S3 URL:', url);
      return null;
    } catch (error) {
      console.error('[Step2BuildConfiguration] Error parsing S3 URL:', error);
      return null;
    }
  };

  // Deployment API 호출하여 정적/동적 배포 타입 판단
  const handleSendClick = async () => {
    if (!s3Url) {
      alert('Repository has not been saved to S3 yet. Please go back and complete Step 1.');
      return;
    }

    try {
      setAnalyzing(true);
      setAiRecommendation(null);

      // S3 URL에서 bucket과 prefix 파싱
      const s3Info = parseS3Url(s3Url);
      if (!s3Info) {
        alert('S3 URL 형식이 올바르지 않습니다. S3 URL을 확인해주세요.');
        return;
      }

      // Deployment API 호출
      const deploymentRequest: DeploymentRequest = {
        s3_snapshot: {
          bucket: s3Info.bucket,
          s3_prefix: s3Info.prefix,
        },
      };

      console.log('[Step2BuildConfiguration] Calling Deployment API:', deploymentRequest);
      let response: any;
      try {
        response = await repositoryUseCase.determineDeploymentType(deploymentRequest);
        console.log('[Step2BuildConfiguration] Deployment API Response:', response);
        console.log('[Step2BuildConfiguration] Response type:', typeof response);
        console.log('[Step2BuildConfiguration] Has service_type:', !!response?.service_type);
      } catch (error: any) {
        console.error('[Step2BuildConfiguration] Failed to determine deployment type:', error);
        throw error;
      }

      // 응답에서 배포 타입 추출
      if (!response) {
        console.error('[Step2BuildConfiguration] Response is null or undefined');
        alert('Deployment type을 받지 못했습니다. 수동으로 입력해주세요.');
        return;
      }

      if (!response.service_type) {
        console.error('[Step2BuildConfiguration] service_type is missing in response');
        console.error('[Step2BuildConfiguration] Response keys:', Object.keys(response || {}));
        console.error('[Step2BuildConfiguration] Full response:', response);
        alert('Deployment type을 받지 못했습니다. 수동으로 입력해주세요.');
        return;
      }

      // 응답에서 배포 타입 추출
      if (response && response.service_type) {
        const serviceType = response.service_type;
        
        // 부모 컴포넌트에 배포 타입 전달
        if (onServiceTypeChange) {
          onServiceTypeChange(serviceType);
        }
        
        // 부모 컴포넌트에 배포 데이터 전달 (create service 시 사용)
        if (onDeploymentDataChange) {
          onDeploymentDataChange(response);
        }

        // 추천 받은 내용으로 buildConfig 업데이트
        const updatedConfig: BuildConfig = { ...buildConfig };

        if (serviceType === "static") {
          // 정적 배포의 경우
          if (response.build_commands && response.build_commands.length > 0) {
            updatedConfig.buildCommand = response.build_commands.join(' && ');
          } else if (!updatedConfig.buildCommand) {
            updatedConfig.buildCommand = 'npm run build';
          }
          if (!updatedConfig.startCommand) {
            updatedConfig.startCommand = '';
          }
          
          // AI 추천 메시지 구성
          let recommendation = `✅ Static Deployment Detected\n\n`;
          recommendation += `📦 Build Commands: ${response.build_commands?.join(', ') || 'npm run build'}\n`;
          recommendation += `📁 Output Directory: ${response.build_output_dir || 'dist'}\n`;
          recommendation += `🟢 Node Version: ${response.node_version || '18'}\n`;
          
          setAiRecommendation(recommendation);
        } else {
          // 동적 배포의 경우
          if (response.runtime) {
            // runtime 형식 변환 (python3.11 -> python311 등)
            let runtimeValue = response.runtime.toLowerCase();
            if (runtimeValue.includes('python3.11')) {
              updatedConfig.runtime = 'python311';
            } else if (runtimeValue.includes('python3.10')) {
              updatedConfig.runtime = 'python310';
            } else if (runtimeValue.includes('python3.9')) {
              updatedConfig.runtime = 'python39';
            } else if (runtimeValue.includes('nodejs') || runtimeValue.includes('node')) {
              updatedConfig.runtime = 'nodejs18';
            } else if (runtimeValue.includes('java')) {
              updatedConfig.runtime = 'java17';
            } else if (runtimeValue.includes('go')) {
              updatedConfig.runtime = 'go1.21';
            } else {
              updatedConfig.runtime = runtimeValue;
            }
          }
          
          if (response.start_command) {
            updatedConfig.startCommand = response.start_command;
          } else if (!updatedConfig.startCommand) {
            updatedConfig.startCommand = 'npm start';
          }
          
          if (response.port) {
            updatedConfig.port = response.port.toString();
          } else if (!updatedConfig.port) {
            updatedConfig.port = '80';
          }
          
          // AI 추천 메시지 구성
          let recommendation = `✅ Dynamic Deployment Detected\n\n`;
          recommendation += `⚙️ Runtime: ${response.runtime || 'nodejs18'}\n`;
          recommendation += `🚀 Start Command: ${response.start_command || 'npm start'}\n`;
          recommendation += `💻 CPU: ${response.cpu || '1 vCPU'}\n`;
          recommendation += `🧠 Memory: ${response.memory || '2 GB'}\n`;
          recommendation += `🔌 Port: ${response.port || 80}\n`;
          
          setAiRecommendation(recommendation);
        }

        // 업데이트된 config 적용
        onBuildConfigChange(updatedConfig);
      } else {
        alert('Deployment type을 받지 못했습니다. 수동으로 입력해주세요.');
      }
    } catch (error: any) {
      console.error('[Step2BuildConfiguration] Failed to determine deployment type:', error);
      alert(`배포 타입 판단에 실패했습니다: ${error.message || 'Unknown error'}\n수동으로 입력해주세요.`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Step2에 진입했을 때 자동으로 AI 분석 실행 (선택사항)
  useEffect(() => {
    // 자동 분석을 원하면 아래 주석을 해제하세요
    // if (s3Url && repository.owner && repository.name && !buildConfig.buildCommand) {
    //   handleSendClick();
    // }
  }, [s3Url, repository.owner, repository.name]);
  const runtimeOptions = [
    { value: 'nodejs18', label: 'Node.js 18' },
    { value: 'nodejs20', label: 'Node.js 20' },
    { value: 'python39', label: 'Python 3.9' },
    { value: 'python310', label: 'Python 3.10' },
    { value: 'python311', label: 'Python 3.11' },
    { value: 'java11', label: 'Java 11' },
    { value: 'java17', label: 'Java 17' },
  ];

  const handleChange = (field: keyof BuildConfig, value: string) => {
    onBuildConfigChange({
      ...buildConfig,
      [field]: value,
    });
  };

  return (
    <div className="step-form-card">
      <div style = {{ padding: '1rem' }}>
        <div className="form-card-header">
          <h2>Build Configuration</h2>
          <p>Configure how your application will be built and started.</p>
          <button 
            type="button" 
            className="connections-btn"
            onClick={handleSendClick}
            disabled={!s3Url || analyzing}
            title={!s3Url ? 'Complete Step 1 first' : analyzing ? 'Analyzing...' : 'Get AI recommendation'}
          >
            <span className={`material-symbols-outlined ${analyzing ? 'spin' : ''}`}>
              {analyzing ? 'sync' : 'auto_awesome'}
            </span>
          </button>
        </div>

            <div className="form-group">
              <label htmlFor="runtime">Runtime</label>
              <select
                id="runtime"
                value={buildConfig.runtime}
                onChange={(e) => handleChange('runtime', e.target.value)}
                required
              >
                {runtimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="form-hint">Select the App Runner runtime for the service.</p>
            </div>

            <div className="form-group">
              <label htmlFor="build-command">Build Command</label>
              <input
                id="build-command"
                type="text"
                placeholder="npm install"
                value={buildConfig.buildCommand}
                onChange={(e) => handleChange('buildCommand', e.target.value)}
              />
              <p className="form-hint">
                This command runs in the source directory when deploying. Use this to install dependencies or compile code.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="start-command">Start Command</label>
              <input
                id="start-command"
                type="text"
                placeholder="node server.js"
                value={buildConfig.startCommand}
                onChange={(e) => handleChange('startCommand', e.target.value)}
                required
              />
              <p className="form-hint">
                This command runs in the service's source directory to start the service process. Use this to start a web server.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="port">Port</label>
              <input
                id="port"
                type="number"
                min="1"
                max="65535"
                placeholder="8080"
                value={buildConfig.port}
                onChange={(e) => handleChange('port', e.target.value)}
                required
              />
              <p className="form-hint">The TCP port your service uses.</p>
            </div>
            <div className="dockerfile-section">
              <div className="dockerfile-card">
                <div className="dockerfile-header">
                  <h3>Dockerfile</h3>
                  <span className={`dockerfile-status ${dockerDetected ? 'present' : 'missing'}`}>
                    {dockerDetected ? 'Detected' : 'Not found'}
                  </span>
                </div>
                <p className="dockerfile-description">
                  hAIfu scans your repo and matches a Dockerfile so deployments can reuse the same build context.
                </p>
                <button
                  type="button"
                  className="view-dockerfile-btn"
                  onClick={() => setShowDockerInfo((prev) => !prev)}
                >
                  {showDockerInfo ? 'Hide Dockerfile' : 'View Dockerfile'}
                </button>
                {showDockerInfo && (
                  <pre className="dockerfile-preview">
                    {dockerfileContent || 'Dockerfile not found in repository.'}
                  </pre>
                )}
                {aiRecommendation && (
                  <div className="ai-recommendation">
                    <span className="material-symbols-outlined">psychology</span>
                    <p>{aiRecommendation}</p>
                  </div>
                )}
              </div>
            </div>
      </div>
    </div>
  );
};

export default Step2BuildConfiguration;

