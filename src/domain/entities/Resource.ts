export type ResourceType = 'service' | 'database';

export interface Resource {
  id: string;
  projectId: string;
  type: ResourceType;
  name: string;
  status: DeploymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const DeploymentStatus = {
  PENDING: 'pending',
  BUILDING: 'building',
  DEPLOYING: 'deploying',
  RUNNING: 'running',
  FAILED: 'failed',
  STOPPED: 'stopped',
} as const;

export type DeploymentStatus = typeof DeploymentStatus[keyof typeof DeploymentStatus];

