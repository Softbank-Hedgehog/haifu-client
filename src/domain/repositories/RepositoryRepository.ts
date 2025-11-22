import type { Repository } from '../entities/Repository';
import type { ListRepositoriesRequest, SaveRepositoryToS3Request, SaveRepositoryToS3Response } from '../../application/dto/RepositoryDTO';

export interface RepositoryContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha?: string;
  url?: string;
  html_url?: string;
  download_url?: string;
}

export interface RepositoryRepository {
  listRepositories(request?: ListRepositoriesRequest): Promise<{
    repositories: Repository[];
    page: number;
    total: number;
  }>;
  saveRepositoryToS3(owner: string, projectId: string, request: SaveRepositoryToS3Request): Promise<SaveRepositoryToS3Response>;
  listBranches(owner: string, repo: string): Promise<string[]>;
  getRepositoryContents(owner: string, repo: string, path?: string, ref?: string): Promise<RepositoryContent[]>;
}





