import type { ProjectRepository } from '../../domain/repositories/ProjectRepository';
import type { Project } from '../../domain/entities/Project';
import { apiClient } from '../api/ApiClient';
import type { CreateProjectRequest, UpdateProjectRequest } from '../../application/dto/ProjectDTO';

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
      // ApiClient가 이미 응답의 data 필드를 반환하므로, response는 바로 배열입니다
      const response = await apiClient.get<ServerProjectResponse[]>('api/projects');
      
      // response가 배열인지 확인 (배열이 아닐 수도 있으므로 안전하게 처리)
      const projects = Array.isArray(response) ? response : [];
      
      return projects.map((p) => ({
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

  async updateProject(id: string, request: UpdateProjectRequest): Promise<Project> {
    try {
      const response = await apiClient.put<ServerProjectResponse>(`api/projects/${id}`, {
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
      console.error('Failed to update project:', error);
      throw new Error(error.message || 'Failed to update project');
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await apiClient.delete(`api/projects/${id}`);
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      throw new Error(error.message || 'Failed to delete project');
    }
  }
}

