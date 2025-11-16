import type { Project } from '../../domain/entities/Project';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository';
import type { CreateProjectRequest } from '../dto/ProjectDTO';

export class ProjectUseCase {
  private projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async createProject(request: CreateProjectRequest): Promise<Project> {
    return this.projectRepository.createProject(request);
  }

  async listProjects(): Promise<Project[]> {
    return this.projectRepository.listProjects();
  }

  async getProject(id: string): Promise<Project> {
    return this.projectRepository.getProject(id);
  }
}

