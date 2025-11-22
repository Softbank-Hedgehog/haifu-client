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

  async saveRepositoryToS3(owner: string, projectId: string, request: SaveRepositoryToS3Request): Promise<SaveRepositoryToS3Response> {
    try {
      const url = `api/github/${owner}/${projectId}`;
      
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
}



