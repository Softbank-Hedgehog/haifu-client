import type { Project } from '../../domain/entities/Project';

export interface CreateProjectRequest {
  name: string;
  description: string;
}

// 서버 응답 형식: { success: true, data: { items: ProjectDTO[], page: number, per_page: number, total: number } }
// ApiClient가 data 필드를 추출하므로, 실제로 받는 타입은 아래와 같음
export interface ListProjectsResponse {
  items: any[]; // ProjectDTO 형식 (snake_case)
  page: number;
  per_page: number;
  total: number;
}

export interface GetProjectResponse {
  project: Project;
}

