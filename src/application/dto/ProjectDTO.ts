import type { Project } from '../../domain/entities/Project';

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface ListProjectsResponse {
  projects: Project[];
}

export interface GetProjectResponse {
  project: Project;
}

