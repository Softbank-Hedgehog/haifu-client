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
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  default_branch: string;
  language: string | null;
  private: boolean;
  updated_at: string;
  branch: string;
  'Source Directory': string; // API 스펙에 따르면 공백이 있는 Pascal Case 필드명
}

// S3 저장 응답 (ApiClient가 data 필드를 추출하므로)
export interface SaveRepositoryToS3Response {
  url: string;
}






