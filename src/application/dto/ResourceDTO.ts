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

// 서버 응답 형식: { success: true, data: { items: ServiceResponse[], page: number, per_page: number, total: number } }
// ApiClient가 data 필드를 추출하므로, 실제로 받는 타입은 아래와 같음
export interface ListResourcesResponse {
  items: any[]; // ServiceResponse 형식 (snake_case)
  page: number;
  per_page: number;
  total: number;
}

export interface GetResourceResponse {
  resource: Resource;
  deployments: Deployment[];
  pipelines: Pipeline[];
}

