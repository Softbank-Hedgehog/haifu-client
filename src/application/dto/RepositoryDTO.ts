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

// 서버 응답 형식: { success: true, data: { items: RepositoryDTO[], page: number, per_page: number, total: number } }
// ApiClient가 data 필드를 추출하므로, 실제로 받는 타입은 아래와 같음
export interface ListRepositoriesResponse {
  items: RepositoryDTO[];
  page: number;
  per_page: number;
  total: number;
}

// S3에 저장할 Repository 요청
export interface SaveRepositoryToS3Request {
  project_id: string;
  tmp_id: number;
  owner: string;
  repo: string;
  branch: string;
  source_path: string;
}

// S3 저장 응답 (ApiClient가 data 필드를 추출하므로)
export interface SaveRepositoryToS3Response {
  url: string;
}






