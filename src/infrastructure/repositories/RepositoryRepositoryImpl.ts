import type { RepositoryRepository } from '../../domain/repositories/RepositoryRepository';
import type { Repository } from '../../domain/entities/Repository';
import { apiClient } from '../api/ApiClient';
import type {
  ListRepositoriesRequest,
  ListRepositoriesResponse,
  RepositoryDTO,
  SaveRepositoryToS3Request,
  SaveRepositoryToS3Response,
} from '../../application/dto/RepositoryDTO';
import type { RepositoryContent } from '../../domain/repositories/RepositoryRepository';
import type { AgentAnalysisRequest, AgentAnalysisResponse } from '../../application/dto/AgentDTO';
import type { DeploymentRequest, DeploymentResponse, DeploymentApiResponse } from '../../application/dto/DeploymentDTO';

export class RepositoryRepositoryImpl implements RepositoryRepository {
  async listRepositories(request?: ListRepositoriesRequest): Promise<{
    repositories: Repository[];
    page: number;
    total: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (request?.page) {
        params.append('page', String(request.page));
      }
      if (request?.per_page) {
        params.append('per_page', String(request.per_page));
      }

      const queryString = params.toString();
      const url = `api/repos/list${queryString ? `?${queryString}` : ''}`;

      // ApiClient가 이미 응답의 data 필드를 추출하므로, response는 { items, page, per_page, total } 형식입니다
      const response = await apiClient.get<ListRepositoriesResponse>(url);
      
      return {
        repositories: response.items.map((repo) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || '',
          htmlUrl: repo.html_url,
          language: repo.language || null,
          private: repo.private,
          updatedAt: new Date(repo.updated_at),
        })),
        page: response.page,
        total: response.total,
      };
    } catch (error: any) {
      console.error('Failed to list repositories:', error);
      throw new Error(error.message || 'Failed to list repositories');
    }
  }

  async saveRepositoryToS3(request: SaveRepositoryToS3Request): Promise<SaveRepositoryToS3Response> {
    try {
      const url = `api/github/s3`;
      
      // ApiClient가 이미 응답의 data 필드를 추출하므로, response는 { url: string } 형식입니다
      const response = await apiClient.post<SaveRepositoryToS3Response>(url, request);
      
      return response;
    } catch (error: any) {
      console.error('Failed to save repository to S3:', error);
      throw new Error(error.message || 'Failed to save repository to S3');
    }
  }

  async listBranches(owner: string, repo: string): Promise<string[]> {
    try {
      const url = `api/repos/${owner}/${repo}/branches`;
      
      // ApiClient가 이미 응답의 data 필드를 추출하므로, response는 바로 배열입니다
      const response = await apiClient.get<string[]>(url);
      
      // response가 배열인지 확인 (배열이 아닐 수도 있으므로 안전하게 처리)
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      console.error('Failed to list branches:', error);
      throw new Error(error.message || 'Failed to list branches');
    }
  }

  async getRepositoryContents(owner: string, repo: string, path?: string, ref?: string): Promise<RepositoryContent[]> {
    try {
      const params = new URLSearchParams();
      if (path) {
        params.append('path', path);
      }
      if (ref) {
        params.append('ref', ref);
      }
      
      const queryString = params.toString();
      const url = `api/repos/${owner}/${repo}/contents${queryString ? `?${queryString}` : ''}`;
      
      // ApiClient가 이미 응답의 data 필드를 추출하므로, response는 바로 배열입니다
      const response = await apiClient.get<RepositoryContent[]>(url);
      
      // response가 배열인지 확인 (배열이 아닐 수도 있으므로 안전하게 처리)
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      console.error('Failed to get repository contents:', error);
      throw new Error(error.message || 'Failed to get repository contents');
    }
  }

  async analyzeProjectWithAI(request: AgentAnalysisRequest): Promise<AgentAnalysisResponse> {
    try {
      // AI 에이전트 API URL (환경 변수에서 가져오거나 기본값 사용)
      const agentApiUrl = import.meta.env.VITE_AGENT_API_URL || 'https://abc123def456.execute-api.ap-northeast-2.amazonaws.com/dev/agent';
      
      // 직접 fetch 사용 (다른 base URL이므로 ApiClient 사용 안 함)
      const response = await fetch(agentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI Agent API error: ${response.status} ${response.statusText}`);
      }

      const data: AgentAnalysisResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error('Failed to analyze project with AI:', error);
      throw new Error(error.message || 'Failed to analyze project with AI');
    }
  }

  async determineDeploymentType(request: DeploymentRequest): Promise<DeploymentResponse> {
    try {
      // Deployment API URL (환경 변수에서 가져오거나 기본값 사용)
      const deploymentApiUrl = import.meta.env.VITE_DEPLOYMENT_API_URL || 'https://ax1iakl8t8.execute-api.ap-northeast-2.amazonaws.com/prod/deployment';
      
      // 직접 fetch 사용 (다른 base URL이므로 ApiClient 사용 안 함)
      const response = await fetch(deploymentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Deployment API error: ${response.status} ${response.statusText}`);
      }

      const apiResponse: DeploymentApiResponse = await response.json();
      
      // body가 문자열인 경우 JSON 파싱
      const body = typeof apiResponse.body === 'string' 
        ? JSON.parse(apiResponse.body) 
        : apiResponse.body;
      
      // 응답 정규화
      const normalizedData: DeploymentResponse = {
        service_type: body.service_type,
      };
      
      // Static 배포인 경우
      if (body.service_type === 'static') {
        normalizedData.build_commands = body.build_commands;
        normalizedData.build_output_dir = body.build_output_dir;
        normalizedData.node_version = body.node_version;
      }
      
      // Dynamic 배포인 경우
      if (body.service_type === 'dynamic') {
        normalizedData.runtime = body.runtime;
        normalizedData.start_command = body.start_command;
        normalizedData.cpu = body.cpu;
        normalizedData.memory = body.memory;
        normalizedData.port = body.port;
      }
      
      return normalizedData;
    } catch (error: any) {
      console.error('Failed to determine deployment type:', error);
      throw new Error(error.message || 'Failed to determine deployment type');
    }
  }
}



