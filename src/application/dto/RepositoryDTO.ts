export interface ListRepositoriesRequest {
  page?: number;
  per_page?: number;
}

export interface RepositoryDTO {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  private: boolean;
  updated_at: string;
}

export interface ListRepositoriesResponse {
  repositories: RepositoryDTO[];
  page: number;
  total: number;
}


