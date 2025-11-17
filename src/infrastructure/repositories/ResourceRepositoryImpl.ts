import type { ResourceRepository } from '../../domain/repositories/ResourceRepository';
import type { Resource } from '../../domain/entities/Resource';
import type { Deployment, Pipeline } from '../../domain/entities/Deployment';
import { apiClient } from '../api/ApiClient';
import type {
  CreateResourceRequest,
  ListResourcesResponse,
  GetResourceResponse,
} from '../../application/dto/ResourceDTO';

export class ResourceRepositoryImpl implements ResourceRepository {
  async createResource(request: CreateResourceRequest): Promise<Resource> {
    const response = await apiClient.post<{ resource: Resource }>('api/resources', request);
    return {
      ...response.resource,
      createdAt: new Date(response.resource.createdAt),
      updatedAt: new Date(response.resource.updatedAt),
    };
  }

  async listResources(projectId: string): Promise<Resource[]> {
    const response = await apiClient.get<ListResourcesResponse>(
      `api/resources?projectId=${projectId}`
    );
    return response.resources.map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
    }));
  }

  async getResource(id: string): Promise<{
    resource: Resource;
    deployments: Deployment[];
    pipelines: Pipeline[];
  }> {
    const response = await apiClient.get<GetResourceResponse>(`api/resources/${id}`);
    return {
      resource: {
        ...response.resource,
        createdAt: new Date(response.resource.createdAt),
        updatedAt: new Date(response.resource.updatedAt),
      },
      deployments: response.deployments.map((d) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        completedAt: d.completedAt ? new Date(d.completedAt) : undefined,
      })),
      pipelines: response.pipelines.map((p) => ({
        ...p,
        startedAt: new Date(p.startedAt),
        completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
      })),
    };
  }
}

