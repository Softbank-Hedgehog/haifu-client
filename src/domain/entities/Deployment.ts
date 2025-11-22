import { DeploymentStatus } from './Resource';

export interface Deployment {
  id: string;
  resourceId: string;
  version: string;
  status: DeploymentStatus;
  createdAt: Date;
  completedAt?: Date;
  buildLogs?: string[];
}

export interface Pipeline {
  id: string;
  deploymentId: string;
  stage: PipelineStage;
  status: PipelineStatus;
  startedAt: Date;
  completedAt?: Date;
}

export const PipelineStage = {
  BUILD: 'build',
  TEST: 'test',
  DEPLOY: 'deploy',
} as const;

export type PipelineStage = typeof PipelineStage[keyof typeof PipelineStage];

export const PipelineStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export type PipelineStatus = typeof PipelineStatus[keyof typeof PipelineStatus];

