import React from 'react';

interface ServiceConfig {
  name: string;
  cpu: number;
  memory: number;
  environmentVariables: Array<{ name: string; value: string }>;
}

interface Step3ServiceConfigurationProps {
  serviceConfig: ServiceConfig;
  onServiceConfigChange: (config: ServiceConfig) => void;
}

const Step3ServiceConfiguration: React.FC<Step3ServiceConfigurationProps> = ({
  serviceConfig,
  onServiceConfigChange,
}) => {
  const cpuOptions = [0.25, 0.5, 1, 2, 4];
  const memoryOptions = [1, 2, 3, 4];

  const handleNameChange = (name: string) => {
    onServiceConfigChange({
      ...serviceConfig,
      name,
    });
  };

  const handleCpuChange = (cpu: number) => {
    onServiceConfigChange({
      ...serviceConfig,
      cpu,
    });
  };

  const handleMemoryChange = (memory: number) => {
    onServiceConfigChange({
      ...serviceConfig,
      memory,
    });
  };

  const handleEnvVarChange = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...serviceConfig.environmentVariables];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onServiceConfigChange({
      ...serviceConfig,
      environmentVariables: updated,
    });
  };

  const addEnvVar = () => {
    onServiceConfigChange({
      ...serviceConfig,
      environmentVariables: [...serviceConfig.environmentVariables, { name: '', value: '' }],
    });
  };

  const removeEnvVar = (index: number) => {
    const updated = serviceConfig.environmentVariables.filter((_, i) => i !== index);
    onServiceConfigChange({
      ...serviceConfig,
      environmentVariables: updated,
    });
  };

  return (
    <div className="step-form-card">
      <div style = {{ padding: '1rem' }}>
        <div className="form-card-header">
          <h2>Service Configuration</h2>
          <p>Configure your service name, server specifications, and environment variables.</p>
        </div>

        <div className="form-group">
          <label htmlFor="service-name">Service Name</label>
          <input
            id="service-name"
            type="text"
            placeholder="auth-service"
            value={serviceConfig.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
          <p className="form-hint">Enter a unique name for your service.</p>
        </div>

        <div className="spec-selection-grid">
          <div className="form-group">
            <label htmlFor="cpu">Virtual CPU</label>
            <select
              id="cpu"
              value={serviceConfig.cpu}
              onChange={(e) => handleCpuChange(parseFloat(e.target.value))}
              required
            >
              {cpuOptions.map((cpu) => (
                <option key={cpu} value={cpu}>
                  {cpu} vCPU
                </option>
              ))}
            </select>
            <p className="form-hint">Select the CPU specification for your service.</p>
          </div>

          <div className="form-group">
            <label htmlFor="memory">Virtual Memory</label>
            <select
              id="memory"
              value={serviceConfig.memory}
              onChange={(e) => handleMemoryChange(parseFloat(e.target.value))}
              required
            >
              {memoryOptions.map((memory) => (
                <option key={memory} value={memory}>
                  {memory} GB
                </option>
              ))}
            </select>
            <p className="form-hint">Select the memory specification for your service.</p>
          </div>
        </div>

        <div className="info-box ai-suggestion">
          <span className="material-symbols-outlined">auto_awesome</span>
          <div>
            <strong>AI Recommendation</strong>
            <p>Based on your repository analysis, we recommend {serviceConfig.cpu} vCPU and {serviceConfig.memory} GB memory. You can adjust these settings as needed.</p>
          </div>
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <label>Environment Variables (Optional)</label>
            <button type="button" onClick={addEnvVar} className="btn btn-secondary btn-sm">
              <span className="material-symbols-outlined">add</span>
              Add Variable
            </button>
          </div>
          <p className="form-hint">
            Add environment variables as plain text or reference them from Secrets Manager and SSM Parameter Store.
          </p>

          {serviceConfig.environmentVariables.length === 0 ? (
            <div className="empty-env-vars">
              <p>No environment variables configured.</p>
            </div>
          ) : (
            <div className="env-vars-table">
              <div className="env-vars-header">
                <div>Source</div>
                <div>Environment Variable Name</div>
                <div>Environment Variable Value</div>
                <div></div>
              </div>
              {serviceConfig.environmentVariables.map((envVar, index) => (
                <div key={index} className="env-var-row">
                  <select value="plain-text" className="env-var-source">
                    <option value="plain-text">Plain Text</option>
                    <option value="secrets-manager">Secrets Manager</option>
                    <option value="ssm-parameter">SSM Parameter Store</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Name"
                    value={envVar.name}
                    onChange={(e) => handleEnvVarChange(index, 'name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={envVar.value}
                    onChange={(e) => handleEnvVarChange(index, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeEnvVar(index)}
                    className="btn btn-text"
                    aria-label="Remove variable"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step3ServiceConfiguration;

