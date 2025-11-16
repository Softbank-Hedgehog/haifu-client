import type { ProjectRepository } from '../../domain/repositories/ProjectRepository';
import type { Project } from '../../domain/entities/Project';
import type { CreateProjectRequest } from '../../application/dto/ProjectDTO';

export class MockProjectRepository implements ProjectRepository {
  private mockProjects: Project[] = [
    {
      id: '1',
      name: 'My Awesome Web App',
      description: 'A modern web application built with React and TypeScript',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    },
    {
      id: '2',
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with payment integration',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-10'),
    },
    {
      id: '3',
      name: 'Mobile API Backend',
      description: 'RESTful API for mobile applications',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-18'),
    },
    {
      id: '4',
      name: 'Analytics Dashboard',
      description: 'Real-time analytics and data visualization platform',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-05'),
    },
    {
      id: '5',
      name: 'Blog CMS',
      description: 'Content management system for blogging platform',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-12'),
    },
  ];

  async createProject(request: CreateProjectRequest): Promise<Project> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newProject: Project = {
      id: String(Date.now()),
      name: request.name,
      description: request.description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockProjects.push(newProject);
    return newProject;
  }

  async listProjects(): Promise<Project[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...this.mockProjects];
  }

  async getProject(id: string): Promise<Project> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const project = this.mockProjects.find((p) => p.id === id);
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }
    return { ...project };
  }
}


