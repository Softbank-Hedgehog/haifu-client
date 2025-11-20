import type { Resource } from '../entities/Resource';
import type { Deployment, Pipeline } from '../entities/Deployment';
import type { CreateResourceRequest, UpdateResourceRequest } from '../../application/dto/ResourceDTO';

export interface ResourceRepository {
  createResource(request: CreateResourceRequest): Promise<Resource>;
  listResources(projectId: string): Promise<Resource[]>;
  getResource(id: string, projectId: string): Promise<{
    resource: Resource;
    deployments: Deployment[];
    pipelines: Pipeline[];
  }>;
  updateResource(id: string, projectId: string, request: UpdateResourceRequest): Promise<Resource>;
  deleteResource(id: string, projectId: string): Promise<void>;
}

