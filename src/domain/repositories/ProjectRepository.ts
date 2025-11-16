import type { Project } from '../entities/Project';
import type { CreateProjectRequest } from '../../application/dto/ProjectDTO';

export interface ProjectRepository {
  createProject(request: CreateProjectRequest): Promise<Project>;
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project>;
}

