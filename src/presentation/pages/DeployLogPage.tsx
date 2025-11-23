import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDependencies } from '../context/DependencyContext';
import { ResourceUseCase } from '../../application/useCases/ResourceUseCase';
import type { Resource } from '../../domain/entities/Resource';
import { WebSocketClient, type WebSocketMessage, type LogMessage } from '../../infrastructure/services/WebSocketClient';
import MainLayout from '../components/Layout/MainLayout';

interface DeploymentLog {
  id: string;
  stage: string;
  message: string;
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
}

type PipelineStage = 'initialize' | 'build' | 'deploy';
type StageStatus = 'pending' | 'running' | 'completed' | 'failed';

const DeployLogPage: React.FC = () => {
  const { projectId, resourceId } = useParams<{ projectId: string; resourceId: string }>();
  const navigate = useNavigate();
  const { resourceRepository } = useDependencies();
  const resourceUseCase = new ResourceUseCase(resourceRepository);
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const wsClientRef = useRef<WebSocketClient | null>(null);
  
  // Pipeline 상태 계산
  const getPipelineStatus = (): Record<PipelineStage, StageStatus> => {
    const hasLog = (stages: string[]): boolean => {
      return logs.some(log => stages.some(s => log.stage.toUpperCase().includes(s)));
    };
    
    const hasError = (stages: string[]): boolean => {
      return logs.some(log => 
        log.level === 'ERROR' && stages.some(s => log.stage.toUpperCase().includes(s))
      );
    };
    
    const hasSuccess = (stages: string[]): boolean => {
      return logs.some(log => 
        (log.level === 'SUCCESS' || log.message.toLowerCase().includes('completed')) &&
        stages.some(s => log.stage.toUpperCase().includes(s))
      );
    };
    
    const initStatus: StageStatus = hasError(['INIT', 'INITIALIZE']) ? 'failed' :
      hasSuccess(['INIT', 'INITIALIZE']) ? 'completed' :
      hasLog(['INIT', 'INITIALIZE']) ? 'running' : 'pending';
    
    const buildStatus: StageStatus = hasError(['BUILD']) ? 'failed' :
      hasSuccess(['BUILD']) ? 'completed' :
      hasLog(['BUILD']) ? 'running' : 
      initStatus === 'completed' ? 'pending' : 'pending';
    
    const deployStatus: StageStatus = hasError(['DEPLOY']) ? 'failed' :
      hasSuccess(['DEPLOY']) ? 'completed' :
      hasLog(['DEPLOY']) ? 'running' :
      buildStatus === 'completed' ? 'pending' : 'pending';
    
    return {
      initialize: initStatus,
      build: buildStatus,
      deploy: deployStatus,
    };
  };
  
  const pipelineStatus = getPipelineStatus();

  useEffect(() => {
    if (resourceId && projectId) {
      loadResource();
      startWebSocketConnection();
    }
    return () => {
      // WebSocket 연결 정리
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
        wsClientRef.current = null;
      }
    };
  }, [resourceId, projectId]);

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

  const startWebSocketConnection = () => {
    if (!resourceId || !projectId) return;

    // WebSocket 클라이언트 생성 및 연결
    const wsClient = new WebSocketClient(resourceId, projectId);
    wsClientRef.current = wsClient;

    wsClient.connect()
      .then(() => {
        setWsConnected(true);
        console.log('WebSocket connected successfully');
      })
      .catch((error) => {
        console.error('Failed to connect WebSocket:', error);
        setWsConnected(false);
        // WebSocket 연결 실패 시 Mock 로그 사용
        startMockLogStream();
      });

    // 메시지 핸들러 등록
    wsClient.onMessage((message: WebSocketMessage) => {
      if (message.type === 'log') {
        const logMessage = message.data as LogMessage;
        const log: DeploymentLog = {
          id: `${Date.now()}-${Math.random()}`,
          stage: logMessage.stage || 'INFO',
          message: logMessage.message,
          timestamp: new Date(logMessage.timestamp || Date.now()),
          level: logMessage.level || 'INFO',
        };
        setLogs((prev) => [...prev, log]);
      } else if (message.type === 'status') {
        // 상태 업데이트 처리
        console.log('Status update:', message.data);
      } else if (message.type === 'error') {
        const errorLog: DeploymentLog = {
          id: `${Date.now()}-${Math.random()}`,
          stage: 'ERROR',
          message: message.data?.message || 'An error occurred',
          timestamp: new Date(),
          level: 'ERROR',
        };
        setLogs((prev) => [...prev, errorLog]);
      } else if (message.type === 'complete') {
        setAiAnalysis(message.data?.analysis || 'Deployment completed successfully.');
      }
    });

    // 에러 핸들러
    wsClient.onError((error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    });

    // 연결 종료 핸들러
    wsClient.onClose(() => {
      console.log('WebSocket connection closed');
      setWsConnected(false);
    });
  };

  const startMockLogStream = () => {
    // Mock 로그 스트림 (WebSocket 연결 실패 시 사용)
    const mockLogs: DeploymentLog[] = [
      {
        id: '1',
        stage: 'INIT',
        message: 'Initializing deployment...',
        timestamp: new Date(),
        level: 'INFO',
      },
      {
        id: '2',
        stage: 'INIT',
        message: 'Repository cloned successfully',
        timestamp: new Date(Date.now() + 500),
        level: 'SUCCESS',
      },
      {
        id: '3',
        stage: 'BUILD',
        message: 'Installing dependencies...',
        timestamp: new Date(Date.now() + 1000),
        level: 'INFO',
      },
      {
        id: '4',
        stage: 'BUILD',
        message: 'Installed 1152 packages in 12.3s',
        timestamp: new Date(Date.now() + 13000),
        level: 'SUCCESS',
      },
      {
        id: '5',
        stage: 'BUILD',
        message: 'Building application...',
        timestamp: new Date(Date.now() + 14000),
        level: 'INFO',
      },
      {
        id: '6',
        stage: 'BUILD',
        message: 'Build completed in 21.8s',
        timestamp: new Date(Date.now() + 35800),
        level: 'SUCCESS',
      },
      {
        id: '7',
        stage: 'TEST',
        message: 'Running tests...',
        timestamp: new Date(Date.now() + 36000),
        level: 'INFO',
      },
      {
        id: '8',
        stage: 'TEST',
        message: 'All tests passed (1 test, 1 suite)',
        timestamp: new Date(Date.now() + 39680),
        level: 'SUCCESS',
      },
      {
        id: '9',
        stage: 'DEPLOY',
        message: 'Creating Elastic Beanstalk environment...',
        timestamp: new Date(Date.now() + 40000),
        level: 'INFO',
      },
      {
        id: '10',
        stage: 'DEPLOY',
        message: 'Waiting for environment to be healthy...',
        timestamp: new Date(Date.now() + 45000),
        level: 'INFO',
      },
    ];

    mockLogs.forEach((log, idx) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, log]);
      }, idx * 500);
    });

    // AI 분석 시뮬레이션
    setTimeout(() => {
      setAiAnalysis('Deployment completed successfully. All services are running normally.');
    }, mockLogs.length * 500);
  };

  const handleRedeploy = async () => {
    if (!resourceId) return;

    try {
      setLoading(true);
      await resourceUseCase.deploy(resourceId);
      
      // 배포 시작 후 로그 페이지 새로고침
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to redeploy service:', error);
      alert(error.message || 'Failed to redeploy service. Please try again.');
      setLoading(false);
    }
  };

  const handleGetAiSummary = async () => {
    if (!resourceId || !projectId) return;
    
    setLoadingAiSummary(true);
    try {
      // TODO: 실제 AI Summary API 호출
      // 현재는 Mock 데이터 반환
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const summary = `Deployment completed successfully. All services are running normally. The initialization phase completed in 2.3 seconds. The build process installed 1152 packages in 12.3 seconds and compiled the application in 21.8 seconds. All tests passed successfully. The deployment to AWS Elastic Beanstalk was completed without errors. The service is now available at the configured endpoint.`;
      
      setAiAnalysis(summary);
    } catch (error) {
      console.error('Failed to get AI summary:', error);
      alert('Failed to get AI summary. Please try again.');
    } finally {
      setLoadingAiSummary(false);
    }
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
            <h1>Pipeline Logs</h1>
            <p className="page-subtitle">{resource.name} - Real-time deployment logs</p>
          </div>
          <button 
            onClick={handleRedeploy} 
            className="btn btn-primary"
            disabled={loading}
          >
            <span className={`material-symbols-outlined ${loading ? 'spin' : ''}`}>
              {loading ? 'sync' : 'refresh'}
            </span>
            {loading ? 'Deploying...' : 'Re-deploy'}
          </button>
        </div>

        {/* Simplified Pipeline Status */}
        <div className="deploy-pipeline-status">
          <div className="pipeline-stages-simple">
            {[
              { key: 'initialize' as PipelineStage, label: 'Initialize' },
              { key: 'build' as PipelineStage, label: 'Build' },
              { key: 'deploy' as PipelineStage, label: 'Deploy' },
            ].map(({ key, label }, index) => {
              const status = pipelineStatus[key];
              const isCompleted = status === 'completed';
              const isRunning = status === 'running';
              const isFailed = status === 'failed';
              
              return (
                <React.Fragment key={key}>
                  <div className={`pipeline-stage-simple ${status}`}>
                    <div className="stage-icon-simple">
                      {isCompleted && <span className="material-symbols-outlined">check_circle</span>}
                      {isRunning && <span className="material-symbols-outlined spin">sync</span>}
                      {isFailed && <span className="material-symbols-outlined">error</span>}
                      {status === 'pending' && <span className="material-symbols-outlined">radio_button_unchecked</span>}
                    </div>
                    <div className="stage-content-simple">
                      <h3>{label}</h3>
                      <p className="stage-status-simple">{status}</p>
                    </div>
                  </div>
                  {index < 2 && (
                    <div className={`pipeline-connector-simple ${isCompleted ? 'completed' : ''} ${isRunning ? 'running' : ''}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          
          {/* AI Summary Section */}
          <div className="ai-summary-section">
            <button 
              onClick={handleGetAiSummary} 
              className="btn-ai-summary"
              disabled={loadingAiSummary}
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              {loadingAiSummary ? 'Generating Summary...' : 'Get AI Summary'}
            </button>
            
            {aiAnalysis && (
              <div className="ai-summary-content">
                <div className="ai-summary-header">
                  <span className="material-symbols-outlined">psychology</span>
                  <h3>AI Summary</h3>
                </div>
                <div className="ai-summary-text">
                  <p>{aiAnalysis}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="log-viewer-container">
          {/* 로그 뷰어 */}
          <div className="log-viewer">
            <div className="log-viewer-header">
              <span className="material-symbols-outlined">terminal</span>
              <h3>Deployment Logs</h3>
              <div className="log-status">
                <span className={`ws-status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}></span>
                <span className="ws-status-text">{wsConnected ? 'Connected' : 'Disconnected'}</span>
                <span className={`status-indicator status-${resource.status}`}></span>
                <span>{resource.status}</span>
              </div>
            </div>
            <div className="logs-content">
              <div className="logs-wrapper">
                {logs.length === 0 ? (
                  <div className="log-empty">Waiting for logs...</div>
                ) : (
                  logs.map((log) => {
                    const isError = log.level === 'ERROR' || log.stage === 'ERROR';
                    const stageTag = `[${log.stage}]`;
                    
                    return (
                      <div key={log.id} className={`log-line log-${log.level?.toLowerCase() || 'info'} ${isError ? 'log-error' : ''}`}>
                        <span className="log-stage-tag">{stageTag}</span>
                        <span className="log-message">{log.message}</span>
                      </div>
                    );
                  })
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DeployLogPage;

