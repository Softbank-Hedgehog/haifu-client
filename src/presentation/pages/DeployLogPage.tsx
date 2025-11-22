import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDependencies } from '../context/DependencyContext';
import { ResourceUseCase } from '../../application/useCases/ResourceUseCase';
import type { Resource } from '../../domain/entities/Resource';
import MainLayout from '../components/Layout/MainLayout';

const DeployLogPage: React.FC = () => {
  const { projectId, resourceId } = useParams<{ projectId: string; resourceId: string }>();
  const navigate = useNavigate();
  const { resourceRepository } = useDependencies();
  const resourceUseCase = new ResourceUseCase(resourceRepository);
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resourceId) {
      loadResource();
      startLogStream();
    }
    return () => {
      // Cleanup log stream
    };
  }, [resourceId]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const loadResource = async () => {
    if (!resourceId || !projectId) return;
    try {
      setLoading(true);
      const data = await resourceUseCase.getResource(resourceId, projectId);
      setResource(data.resource);
    } catch (error) {
      console.error('Failed to load resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLogStream = () => {
    // TODO: 실제 로그 스트리밍 API 연결 (WebSocket 또는 SSE)
    // 지금은 시뮬레이션
    const mockLogs = [
      '[INFO] Starting deployment...',
      '[INFO] Pulling latest image...',
      '[INFO] Creating containers...',
      '[INFO] Starting services...',
      '[SUCCESS] Deployment completed successfully!',
    ];

    mockLogs.forEach((log, idx) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, log]);
      }, idx * 1000);
    });

    // AI 분석 시뮬레이션
    setTimeout(() => {
      setAiAnalysis('Deployment completed successfully. All services are running normally.');
    }, mockLogs.length * 1000);
  };

  const handleRedeploy = () => {
    // TODO: 재배포 API 호출
    navigate(`/projects/${projectId}/resources/${resourceId}/redeploy`);
  };

  if (loading || !resource) {
    return (
      <MainLayout>
        <div className="loading">Loading deployment logs...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="deploy-log-page">
        <div className="page-header">
          <button onClick={() => navigate(`/projects/${projectId}/resources/${resourceId}`)} className="back-btn">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="page-title-section">
            <h1>Deployment Logs</h1>
            <p className="page-subtitle">{resource.name} - Real-time deployment logs</p>
          </div>
          <button onClick={handleRedeploy} className="btn btn-primary">
            <span className="material-symbols-outlined">refresh</span>
            Re-deploy
          </button>
        </div>

        <div className="log-viewer-container">
          {/* 로그 뷰어 */}
          <div className="log-viewer">
            <div className="log-viewer-header">
              <span className="material-symbols-outlined">terminal</span>
              <h3>Application Logs</h3>
              <div className="log-status">
                <span className={`status-indicator status-${resource.status}`}></span>
                <span>{resource.status}</span>
              </div>
            </div>
            <div className="logs-content">
              <pre>
                {logs.map((log, idx) => {
                  const logLevel = log.match(/\[(\w+)\]/)?.[1]?.toLowerCase() || 'info';
                  return (
                    <div key={idx} className={`log-line log-${logLevel}`}>
                      <span className="log-timestamp">{new Date().toLocaleTimeString()}</span>
                      <span className="log-message">{log}</span>
                    </div>
                  );
                })}
                <div ref={logsEndRef} />
              </pre>
            </div>
          </div>

          {/* AI 분석 패널 */}
          <div className="ai-analysis-panel">
            <div className="ai-panel-header">
              <span className="material-symbols-outlined">auto_awesome</span>
              <h3>AI Analysis</h3>
            </div>
            <div className="ai-panel-content">
              {aiAnalysis ? (
                <div className="ai-analysis-result">
                  <p>{aiAnalysis}</p>
                </div>
              ) : (
                <div className="ai-analysis-loading">
                  <span className="material-symbols-outlined spin">sync</span>
                  <p>Analyzing logs...</p>
                </div>
              )}
              
              {/* 액션 버튼 */}
              <div className="ai-actions">
                <button className="ai-action-btn">
                  <span className="material-symbols-outlined">build</span>
                  Apply Fix
                </button>
                <button className="ai-action-btn">
                  <span className="material-symbols-outlined">tune</span>
                  Optimize
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DeployLogPage;

