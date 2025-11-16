import type { Resource } from '../entities/Resource';
import type { Deployment, Pipeline } from '../entities/Deployment';
import type { CreateResourceRequest } from '../../application/dto/ResourceDTO';

export interface ResourceRepository {
  createResource(request: CreateResourceRequest): Promise<Resource>;
  listResources(projectId: string): Promise<Resource[]>;
  getResource(id: string): Promise<{
    resource: Resource;
    deployments: Deployment[];
    pipelines: Pipeline[];
  }>;
}

