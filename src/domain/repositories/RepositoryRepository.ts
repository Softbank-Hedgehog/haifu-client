import type { Repository } from '../entities/Repository';
import type { ListRepositoriesRequest, SaveRepositoryToS3Request, SaveRepositoryToS3Response } from '../../application/dto/RepositoryDTO';

export interface RepositoryRepository {
  listRepositories(request?: ListRepositoriesRequest): Promise<{
    repositories: Repository[];
    page: number;
    total: number;
  }>;
  saveRepositoryToS3(owner: string, projectId: string, request: SaveRepositoryToS3Request): Promise<SaveRepositoryToS3Response>;
}





