import type { RepositoryRepository } from '../../domain/repositories/RepositoryRepository';
import type { Repository } from '../../domain/entities/Repository';
import type { ListRepositoriesRequest } from '../dto/RepositoryDTO';

export class RepositoryUseCase {
  constructor(private repositoryRepository: RepositoryRepository) {}

  async listRepositories(request?: ListRepositoriesRequest): Promise<{
    repositories: Repository[];
    page: number;
    total: number;
  }> {
    return await this.repositoryRepository.listRepositories(request);
  }
}


