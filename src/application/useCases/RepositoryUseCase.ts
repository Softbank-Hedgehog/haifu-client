import type { RepositoryRepository } from '../../domain/repositories/RepositoryRepository';
import type { Repository } from '../../domain/entities/Repository';
import type { ListRepositoriesRequest, SaveRepositoryToS3Request, SaveRepositoryToS3Response } from '../dto/RepositoryDTO';

export class RepositoryUseCase {
  constructor(private repositoryRepository: RepositoryRepository) {}

  async listRepositories(request?: ListRepositoriesRequest): Promise<{
    repositories: Repository[];
    page: number;
    total: number;
  }> {
    return await this.repositoryRepository.listRepositories(request);
  }

  async saveRepositoryToS3(owner: string, projectId: string, request: SaveRepositoryToS3Request): Promise<SaveRepositoryToS3Response> {
    return await this.repositoryRepository.saveRepositoryToS3(owner, projectId, request);
  }
}







