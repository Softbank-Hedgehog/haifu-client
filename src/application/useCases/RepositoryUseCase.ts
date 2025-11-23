import type { RepositoryRepository } from '../../domain/repositories/RepositoryRepository';
import type { Repository } from '../../domain/entities/Repository';
import type { RepositoryContent } from '../../domain/repositories/RepositoryRepository';
import type { ListRepositoriesRequest, SaveRepositoryToS3Request, SaveRepositoryToS3Response } from '../dto/RepositoryDTO';
import type { AgentAnalysisRequest, AgentAnalysisResponse } from '../dto/AgentDTO';
import type { DeploymentRequest, DeploymentResponse } from '../dto/DeploymentDTO';

export class RepositoryUseCase {
  constructor(private repositoryRepository: RepositoryRepository) {}

  async listRepositories(request?: ListRepositoriesRequest): Promise<{
    repositories: Repository[];
    page: number;
    total: number;
  }> {
    return await this.repositoryRepository.listRepositories(request);
  }

  async saveRepositoryToS3(request: SaveRepositoryToS3Request): Promise<SaveRepositoryToS3Response> {
    return await this.repositoryRepository.saveRepositoryToS3(request);
  }

  async listBranches(owner: string, repo: string): Promise<string[]> {
    return await this.repositoryRepository.listBranches(owner, repo);
  }

  async getRepositoryContents(owner: string, repo: string, path?: string, ref?: string): Promise<RepositoryContent[]> {
    return await this.repositoryRepository.getRepositoryContents(owner, repo, path, ref);
  }

  async analyzeProjectWithAI(request: AgentAnalysisRequest): Promise<AgentAnalysisResponse> {
    return await this.repositoryRepository.analyzeProjectWithAI(request);
  }

  async determineDeploymentType(request: DeploymentRequest): Promise<DeploymentResponse> {
    return await this.repositoryRepository.determineDeploymentType(request);
  }
}







