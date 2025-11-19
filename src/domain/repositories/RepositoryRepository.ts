import type { Repository } from '../entities/Repository';
import type { ListRepositoriesRequest } from '../../application/dto/RepositoryDTO';

export interface RepositoryRepository {
  listRepositories(request?: ListRepositoriesRequest): Promise<{
    repositories: Repository[];
    page: number;
    total: number;
  }>;
}





