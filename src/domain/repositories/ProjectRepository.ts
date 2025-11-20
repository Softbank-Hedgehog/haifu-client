import type { Project } from '../entities/Project';
import type { CreateProjectRequest, UpdateProjectRequest } from '../../application/dto/ProjectDTO';

export interface ProjectRepository {
  createProject(request: CreateProjectRequest): Promise<Project>;
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project>;
  updateProject(id: string, request: UpdateProjectRequest): Promise<Project>;
  deleteProject(id: string): Promise<void>;
}

