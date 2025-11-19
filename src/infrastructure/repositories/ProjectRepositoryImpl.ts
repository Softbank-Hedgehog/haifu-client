import type { ProjectRepository } from '../../domain/repositories/ProjectRepository';
import type { Project } from '../../domain/entities/Project';
import { apiClient } from '../api/ApiClient';
import type {
  CreateProjectRequest,
  ListProjectsResponse,
  GetProjectResponse,
} from '../../application/dto/ProjectDTO';

export class ProjectRepositoryImpl implements ProjectRepository {
  async createProject(request: CreateProjectRequest): Promise<Project> {
    try {
      // ApiClient가 이미 data 필드를 추출하여 반환하므로, response는 data의 내용입니다
      // 서버 응답: { success: true, data: { project: {...} } }
      // ApiClient 반환: { project: {...} }
      const response = await apiClient.post<{ project: Project }>('api/projects', request);
      return {
        ...response.project,
        createdAt: new Date(response.project.createdAt),
        updatedAt: new Date(response.project.updatedAt),
      };
    } catch (error: any) {
      console.error('Failed to create project:', error);
      throw new Error(error.message || 'Failed to create project');
    }
  }

  async listProjects(): Promise<Project[]> {
    try {
      // 서버 응답: { success: true, data: { projects: [...] } }
      // ApiClient 반환: { projects: [...] }
      const response = await apiClient.get<ListProjectsResponse>('api/projects');
      return response.projects.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    } catch (error: any) {
      console.error('Failed to list projects:', error);
      throw new Error(error.message || 'Failed to list projects');
    }
  }

  async getProject(id: string): Promise<Project> {
    try {
      // 서버 응답: { success: true, data: { project: {...} } }
      // ApiClient 반환: { project: {...} }
      const response = await apiClient.get<GetProjectResponse>(`api/projects/${id}`);
      return {
        ...response.project,
        createdAt: new Date(response.project.createdAt),
        updatedAt: new Date(response.project.updatedAt),
      };
    } catch (error: any) {
      console.error('Failed to get project:', error);
      throw new Error(error.message || 'Failed to get project');
    }
  }
}

