import type { ProjectRepository } from '../../domain/repositories/ProjectRepository';
import type { Project } from '../../domain/entities/Project';
import { apiClient } from '../api/ApiClient';
import type { CreateProjectRequest } from '../../application/dto/ProjectDTO';

interface ServerProjectResponse {
  id: string;
  name: string;
  description: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export class ProjectRepositoryImpl implements ProjectRepository {
  async createProject(request: CreateProjectRequest): Promise<Project> {
    try {
      const response = await apiClient.post<ServerProjectResponse>('api/projects', {
        id: '', // 서버에서 자동 생성
        name: request.name,
        description: request.description,
      });
      
      return {
        id: response.id,
        name: response.name,
        description: response.description || '',
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at),
      };
    } catch (error: any) {
      console.error('Failed to create project:', error);
      throw new Error(error.message || 'Failed to create project');
    }
  }

  async listProjects(): Promise<Project[]> {
    try {
      interface ListProjectsData {
        items: ServerProjectResponse[];
        page: number;
        per_page: number;
        total: number;
      }
      const response = await apiClient.get<ListProjectsData>('api/projects');
      
      return response.items.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      }));
    } catch (error: any) {
      console.error('Failed to list projects:', error);
      throw new Error(error.message || 'Failed to list projects');
    }
  }

  async getProject(id: string): Promise<Project> {
    try {
      const response = await apiClient.get<ServerProjectResponse>(`api/projects/${id}`);
      
      return {
        id: response.id,
        name: response.name,
        description: response.description || '',
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at),
      };
    } catch (error: any) {
      console.error('Failed to get project:', error);
      throw new Error(error.message || 'Failed to get project');
    }
  }
}

