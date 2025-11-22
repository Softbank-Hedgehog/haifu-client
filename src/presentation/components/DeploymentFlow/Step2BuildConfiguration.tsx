import React, { useState } from 'react';

interface BuildConfig {
  runtime: string;
  buildCommand: string;
  startCommand: string;
  port: string;
}

interface Step2BuildConfigurationProps {
  buildConfig: BuildConfig;
  onBuildConfigChange: (config: BuildConfig) => void;
}

const Step2BuildConfiguration: React.FC<Step2BuildConfigurationProps> = ({
  buildConfig,
  onBuildConfigChange,
}) => {
  const [showDockerInfo, setShowDockerInfo] = useState(false);
  const dockerDetected = true; // placeholder until backend is wired
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
          <button type="button" className="connections-btn">
            <span className="material-symbols-outlined">send</span>
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
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
                  </pre>
                )}
              </div>
            </div>
      </div>
    </div>
  );
};

export default Step2BuildConfiguration;

