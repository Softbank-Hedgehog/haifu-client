import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDependencies } from '../context/DependencyContext';
import { ResourceUseCase } from '../../application/useCases/ResourceUseCase';
import type { Pipeline, PipelineStage } from '../../domain/entities/Deployment';
import { PipelineStage as PipelineStageEnum, PipelineStatus } from '../../domain/entities/Deployment';
import MainLayout from '../components/Layout/MainLayout';

const PipelineStatusPage: React.FC = () => {
  const { projectId, resourceId } = useParams<{ projectId: string; resourceId: string }>();
  const navigate = useNavigate();
  const { resourceRepository } = useDependencies();
  const resourceUseCase = new ResourceUseCase(resourceRepository);
  
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'progress' | 'logs' | 'ai-summary'>('progress');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resourceId) {
      loadPipelines();
      simulateLogStream();
    }
  }, [resourceId]);

  const loadPipelines = async () => {
    if (!resourceId) return;
    try {
      setLoading(true);
      const data = await resourceUseCase.getResource(resourceId);
      setPipelines(data.pipelines);
    } catch (error) {
      console.error('Failed to load pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateLogStream = () => {
    // TODO: 실제 로그 스트리밍 API 연결
    const mockLogs = [
      '[Pipeline] Starting build stage...',
      '[Build] Installing dependencies...',
      '[Build] Running tests...',
      '[Build] Building application...',
    ];
    setLogs(mockLogs);
  };

  const getStageOrder = (stage: PipelineStage): number => {
    const order: Record<PipelineStage, number> = {
      [PipelineStageEnum.BUILD]: 1,
      [PipelineStageEnum.TEST]: 2,
      [PipelineStageEnum.DEPLOY]: 3,
    };
    return order[stage] || 0;
  };

  const sortedPipelines = [...pipelines].sort((a, b) => 
    getStageOrder(a.stage) - getStageOrder(b.stage)
  );

  const getStageStatus = (stage: PipelineStage): PipelineStatus => {
    const pipeline = pipelines.find(p => p.stage === stage);
    return pipeline?.status || PipelineStatus.PENDING;
  };

  const allStages = [
    { stage: PipelineStageEnum.BUILD, label: 'Build' },
    { stage: PipelineStageEnum.TEST, label: 'Test' },
    { stage: PipelineStageEnum.DEPLOY, label: 'Deploy' },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="loading">Loading pipeline status...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pipeline-status-page">
        <div className="page-header">
          <button onClick={() => navigate(`/projects/${projectId}/resources/${resourceId}`)} className="back-btn">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="page-title-section">
            <h1>Pipeline Status</h1>
            <p className="page-subtitle">Deployment pipeline progress and logs</p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="pipeline-tabs">
          <button
            className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <span className="material-symbols-outlined">timeline</span>
            Progress
          </button>
          <button
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <span className="material-symbols-outlined">description</span>
            Build Logs
          </button>
          <button
            className={`tab-btn ${activeTab === 'ai-summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-summary')}
          >
            <span className="material-symbols-outlined">auto_awesome</span>
            AI Summary
          </button>
        </div>

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="pipeline-progress">
            <div className="pipeline-stages">
              {allStages.map(({ stage, label }, index) => {
                const status = getStageStatus(stage);
                const pipeline = pipelines.find(p => p.stage === stage);
                const isCompleted = status === PipelineStatus.SUCCESS;
                const isRunning = status === PipelineStatus.RUNNING;
                const isFailed = status === PipelineStatus.FAILED;
                const isPending = status === PipelineStatus.PENDING;

                return (
                  <React.Fragment key={stage}>
                    <div className={`pipeline-stage ${isCompleted ? 'completed' : ''} ${isRunning ? 'running' : ''} ${isFailed ? 'failed' : ''} ${isPending ? 'pending' : ''}`}>
                      <div className="stage-icon">
                        {isCompleted && <span className="material-symbols-outlined">check_circle</span>}
                        {isRunning && <span className="material-symbols-outlined spin">sync</span>}
                        {isFailed && <span className="material-symbols-outlined">error</span>}
                        {isPending && <span className="material-symbols-outlined">radio_button_unchecked</span>}
                      </div>
                      <div className="stage-content">
                        <h3>{label}</h3>
                        <p className="stage-status">{status}</p>
                        {pipeline && (
                          <p className="stage-time">
                            {pipeline.completedAt 
                              ? `Completed: ${new Date(pipeline.completedAt).toLocaleString()}`
                              : `Started: ${new Date(pipeline.startedAt).toLocaleString()}`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    {index < allStages.length - 1 && (
                      <div className={`pipeline-connector ${isCompleted ? 'completed' : ''} ${isRunning ? 'running' : ''}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* AI 메시지 */}
            <div className="ai-messages">
              <div className="ai-message">
                <span className="material-symbols-outlined">auto_awesome</span>
                <p>Pipeline is running smoothly. Build stage completed successfully.</p>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="pipeline-logs">
            <div className="logs-viewer">
              <pre className="logs-content">
                {logs.map((log, idx) => (
                  <div key={idx} className="log-line">{log}</div>
                ))}
              </pre>
            </div>
          </div>
        )}

        {/* AI Summary Tab */}
        {activeTab === 'ai-summary' && (
          <div className="ai-summary">
            <div className="ai-summary-card">
              <h3>Pipeline Analysis</h3>
              <p>AI analysis will appear here once the pipeline completes.</p>
              {/* TODO: AI 분석 결과 표시 */}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PipelineStatusPage;

