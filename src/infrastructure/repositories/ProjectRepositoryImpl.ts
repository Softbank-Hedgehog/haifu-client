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
    const response = await apiClient.post<{ project: Project }>('/api/projects', request);
    return {
      ...response.project,
      createdAt: new Date(response.project.createdAt),
      updatedAt: new Date(response.project.updatedAt),
    };
  }

  async listProjects(): Promise<Project[]> {
    const response = await apiClient.get<ListProjectsResponse>('/api/projects');
    return response.projects.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  }

  async getProject(id: string): Promise<Project> {
    const response = await apiClient.get<GetProjectResponse>(`/api/projects/${id}`);
    return {
      ...response.project,
      createdAt: new Date(response.project.createdAt),
      updatedAt: new Date(response.project.updatedAt),
    };
  }
}

