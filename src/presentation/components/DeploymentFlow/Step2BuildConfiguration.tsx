import React from 'react';

interface BuildConfig {
  buildMode: 'auto' | 'manual';
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
        </div>

        <div className="form-group">
          <label>Build Settings</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="build-mode"
                value="auto"
                checked={buildConfig.buildMode === 'auto'}
                onChange={(e) => handleChange('buildMode', e.target.value)}
              />
              <div>
                <strong>Automatic Build</strong>
                <p>Agent will automatically detect and configure build settings based on your repository.</p>
              </div>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="build-mode"
                value="manual"
                checked={buildConfig.buildMode === 'manual'}
                onChange={(e) => handleChange('buildMode', e.target.value)}
              />
              <div>
                <strong>Manual Build</strong>
                <p>Configure all build settings manually.</p>
              </div>
            </label>
          </div>
        </div>

        {buildConfig.buildMode === 'manual' && (
          <>
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
          </>
        )}

        {buildConfig.buildMode === 'auto' && (
          <div className="info-box">
            <span className="material-symbols-outlined">auto_awesome</span>
            <div>
              <strong>AI-Powered Detection</strong>
              <p>Our agent will automatically analyze your repository and configure optimal build settings based on the detected tech stack.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2BuildConfiguration;

