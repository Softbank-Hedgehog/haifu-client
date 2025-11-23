import type { Repository } from '../entities/Repository';
import type { ListRepositoriesRequest, SaveRepositoryToS3Request, SaveRepositoryToS3Response } from '../../application/dto/RepositoryDTO';
import type { AgentAnalysisRequest, AgentAnalysisResponse } from '../../application/dto/AgentDTO';
import type { DeploymentRequest, DeploymentResponse } from '../../application/dto/DeploymentDTO';
import type { ChatRequest, ChatResponse } from '../../application/dto/ChatDTO';

export interface RepositoryContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha?: string;
  url?: string;
  html_url?: string;
  download_url?: string;
  content?: string; // Base64 인코딩된 파일 내용
}

export interface RepositoryRepository {
  listRepositories(request?: ListRepositoriesRequest): Promise<{
    repositories: Repository[];
    page: number;
    total: number;
  }>;
  saveRepositoryToS3(request: SaveRepositoryToS3Request): Promise<SaveRepositoryToS3Response>;
  listBranches(owner: string, repo: string): Promise<string[]>;
  getRepositoryContents(owner: string, repo: string, path?: string, ref?: string): Promise<RepositoryContent[]>;
  analyzeProjectWithAI(request: AgentAnalysisRequest): Promise<AgentAnalysisResponse>;
  determineDeploymentType(request: DeploymentRequest): Promise<DeploymentResponse>;
  sendChatMessage(request: ChatRequest): Promise<ChatResponse>;
}





