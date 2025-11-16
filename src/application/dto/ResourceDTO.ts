import type { Resource } from '../../domain/entities/Resource';
import type { Deployment, Pipeline } from '../../domain/entities/Deployment';
import type { ServerSpec } from '../../domain/valueObjects/ServerSpec';
import type { TechStack } from '../../domain/valueObjects/TechStack';
import type { GitHubRepository } from '../../domain/valueObjects/GitHubRepository';

export interface CreateResourceRequest {
  projectId: string;
  type: 'service' | 'database';
  name: string;
  config: ServiceDeploymentConfig | DatabaseConfig;
}

export interface ServiceDeploymentConfig {
  repository: GitHubRepository;
  techStack?: TechStack;
  serverSpec: ServerSpec;
  buildMode: 'auto' | 'manual';
  environmentVariables?: Record<string, string>;
}

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb';
  version: string;
  serverSpec: ServerSpec;
  environmentVariables?: Record<string, string>;
}

export interface ListResourcesResponse {
  resources: Resource[];
}

export interface GetResourceResponse {
  resource: Resource;
  deployments: Deployment[];
  pipelines: Pipeline[];
}

