import type { Resource } from '../../domain/entities/Resource';
import type { Deployment, Pipeline } from '../../domain/entities/Deployment';
import type { ResourceRepository } from '../../domain/repositories/ResourceRepository';
import type { CreateResourceRequest } from '../dto/ResourceDTO';

export class ResourceUseCase {
  private resourceRepository: ResourceRepository;

  constructor(resourceRepository: ResourceRepository) {
    this.resourceRepository = resourceRepository;
  }

  async createResource(request: CreateResourceRequest): Promise<Resource> {
    return this.resourceRepository.createResource(request);
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
}

