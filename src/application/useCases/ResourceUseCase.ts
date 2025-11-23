import type { Resource } from '../../domain/entities/Resource';
import type { Deployment, Pipeline } from '../../domain/entities/Deployment';
import type { ResourceRepository } from '../../domain/repositories/ResourceRepository';
import type { CreateResourceRequest, UpdateResourceRequest } from '../dto/ResourceDTO';

export class ResourceUseCase {
  private resourceRepository: ResourceRepository;

  constructor(resourceRepository: ResourceRepository) {
    this.resourceRepository = resourceRepository;
  }

  async createResource(request: CreateResourceRequest, userId?: string): Promise<Resource> {
    const impl = this.resourceRepository as any;
    return impl.createResource(request, userId);
  }

  async listResources(projectId: string): Promise<Resource[]> {
    return this.resourceRepository.listResources(projectId);
  }

  async getResource(id: string, projectId: string): Promise<{
    resource: Resource;
    deployments: Deployment[];
    pipelines: Pipeline[];
  }> {
    return this.resourceRepository.getResource(id, projectId);
  }

  async updateResource(id: string, projectId: string, request: UpdateResourceRequest): Promise<Resource> {
    return this.resourceRepository.updateResource(id, projectId, request);
  }

  async deleteResource(id: string, projectId: string): Promise<void> {
    return this.resourceRepository.deleteResource(id, projectId);
  }
}

