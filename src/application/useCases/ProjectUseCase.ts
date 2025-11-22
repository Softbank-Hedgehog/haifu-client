import type { Project } from '../../domain/entities/Project';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository';
import type { CreateProjectRequest, UpdateProjectRequest } from '../dto/ProjectDTO';

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

  async updateProject(id: string, request: UpdateProjectRequest): Promise<Project> {
    return this.projectRepository.updateProject(id, request);
  }

  async deleteProject(id: string): Promise<void> {
    return this.projectRepository.deleteProject(id);
  }
}

