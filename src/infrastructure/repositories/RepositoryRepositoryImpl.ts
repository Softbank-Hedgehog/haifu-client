import type { RepositoryRepository } from '../../domain/repositories/RepositoryRepository';
import type { Repository } from '../../domain/entities/Repository';
import { apiClient } from '../api/ApiClient';
import type {
  ListRepositoriesRequest,
  ListRepositoriesResponse,
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
}



