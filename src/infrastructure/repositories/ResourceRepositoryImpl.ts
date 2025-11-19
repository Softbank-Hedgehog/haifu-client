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
    try {
      const response = await apiClient.post<{ resource: Resource }>('api/resources', request);
      return {
        ...response.resource,
        createdAt: new Date(response.resource.createdAt),
        updatedAt: new Date(response.resource.updatedAt),
      };
    } catch (error: any) {
      console.error('Failed to create resource:', error);
      throw new Error(error.message || 'Failed to create resource');
    }
  }

  async listResources(projectId: string): Promise<Resource[]> {
    try {
      const response = await apiClient.get<ListResourcesResponse>(
        `api/resources?projectId=${projectId}`
      );
      return response.resources.map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      }));
    } catch (error: any) {
      console.error('Failed to list resources:', error);
      throw new Error(error.message || 'Failed to list resources');
    }
  }

  async getResource(id: string): Promise<{
    resource: Resource;
    deployments: Deployment[];
    pipelines: Pipeline[];
  }> {
    try {
      // 서버 응답: { success: true, data: { resource: {...}, deployments: [...], pipelines: [...] } }
      // ApiClient 반환: { resource: {...}, deployments: [...], pipelines: [...] }
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
    } catch (error: any) {
      console.error('Failed to get resource:', error);
      throw new Error(error.message || 'Failed to get resource');
    }
  }
}

