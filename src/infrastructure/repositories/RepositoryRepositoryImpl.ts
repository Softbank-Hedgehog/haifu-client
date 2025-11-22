import type { RepositoryRepository } from '../../domain/repositories/RepositoryRepository';
import type { Repository } from '../../domain/entities/Repository';
import { apiClient } from '../api/ApiClient';
import type {
  ListRepositoriesRequest,
  RepositoryDTO,
} from '../../application/dto/RepositoryDTO';

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

      // ApiClient가 이미 응답의 data 필드를 반환하므로, response는 바로 배열입니다
      const response = await apiClient.get<RepositoryDTO[]>(url);
      
      // response가 배열인지 확인 (배열이 아닐 수도 있으므로 안전하게 처리)
      const repositories = Array.isArray(response) ? response : [];
      
      return {
        repositories: repositories.map((repo) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          htmlUrl: repo.html_url,
          language: repo.language,
          private: repo.private,
          updatedAt: new Date(repo.updated_at),
        })),
        page: request?.page || 1,
        total: repositories.length,
      };
    } catch (error: any) {
      console.error('Failed to list repositories:', error);
      throw new Error(error.message || 'Failed to list repositories');
    }
  }
}



