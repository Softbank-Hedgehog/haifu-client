import type { ResourceRepository } from '../../domain/repositories/ResourceRepository';
import type { Resource } from '../../domain/entities/Resource';
import type { Deployment, Pipeline } from '../../domain/entities/Deployment';
import { apiClient } from '../api/ApiClient';
import type { CreateResourceRequest, UpdateResourceRequest } from '../../application/dto/ResourceDTO';

interface ServerServiceResponse {
  id: string;
  project_id: string;
  name: string;
  repo_owner: string;
  repo_name: string;
  branch: string;
  runtime: string;
  cpu: string;
  memory: string;
  port: number;
  build_command: string | null;
  start_command: string | null;
  environment_variables: Record<string, string> | null;
  status: string;
  deployment_url: string | null;
  created_at: string;
  updated_at: string;
}

export class ResourceRepositoryImpl implements ResourceRepository {
  async createResource(request: CreateResourceRequest): Promise<Resource> {
    try {
      if (request.type !== 'service') {
        throw new Error('Only service type is supported');
      }

      const config = request.config as any;
      const repository = config.repository;
      const serverSpec = config.serverSpec;

      // ServerSpec의 숫자 값을 서버 형식 문자열로 변환
      const cpuValue = serverSpec?.cpu || 1;
      const memoryValue = serverSpec?.memory || 2;
      const cpuString = `${cpuValue} vCPU`;
      const memoryString = `${memoryValue} GB`;

      // TechStack에서 runtime 추출 (language 기반)
      const runtimeMap: Record<string, string> = {
        'python': 'PYTHON_3',
        'nodejs': 'NODEJS_18',
        'node': 'NODEJS_18',
        'java': 'JAVA_17',
        'go': 'GO_1',
        'php': 'PHP_81',
        'ruby': 'RUBY_31',
      };
      const language = config.techStack?.language?.toLowerCase() || 'nodejs';
      const runtime = runtimeMap[language] || 'NODEJS_18';

      // 서버 응답: { success: true, data: ServiceResponse }
      // ApiClient 반환: ServiceResponse (snake_case)
      const response = await apiClient.post<ServerServiceResponse>(
        `api/projects/${request.projectId}/services`,
        {
          name: request.name,
          repo_owner: repository.owner,
          repo_name: repository.name,
          branch: repository.branch || 'main',
          runtime: runtime,
          cpu: cpuString,
          memory: memoryString,
          port: serverSpec?.port || 8080,
          build_command: config.buildMode === 'manual' ? config.buildCommand : null,
          start_command: config.startCommand || null,
          environment_variables: config.environmentVariables || null,
        }
      );

      return {
        id: response.id,
        projectId: response.project_id,
        type: 'service' as const,
        name: response.name,
        status: response.status as any,
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at),
      };
    } catch (error: any) {
      console.error('Failed to create resource:', error);
      throw new Error(error.message || 'Failed to create resource');
    }
  }

  async listResources(projectId: string): Promise<Resource[]> {
    try {
      interface ListResourcesData {
        items: ServerServiceResponse[];
        page: number;
        per_page: number;
        total: number;
      }
      const response = await apiClient.get<ListResourcesData>(
        `api/projects/${projectId}/services`
      );

      return response.items.map((s) => ({
        id: s.id,
        projectId: s.project_id,
        type: 'service' as const,
        name: s.name,
        status: s.status as any,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
      }));
    } catch (error: any) {
      console.error('Failed to list resources:', error);
      throw new Error(error.message || 'Failed to list resources');
    }
  }

  async getResource(id: string, projectId: string): Promise<{
    resource: Resource;
    deployments: Deployment[];
    pipelines: Pipeline[];
  }> {
    try {
      const response = await apiClient.get<ServerServiceResponse>(
        `api/services/${id}?project_id=${projectId}`
      );

      return {
        resource: {
          id: response.id,
          projectId: response.project_id,
          type: 'service' as const,
          name: response.name,
          status: response.status as any,
          createdAt: new Date(response.created_at),
          updatedAt: new Date(response.updated_at),
        },
        deployments: [], // TODO: 서버에 deployments API가 없음
        pipelines: [], // TODO: 서버에 pipelines API가 없음
      };
    } catch (error: any) {
      console.error('Failed to get resource:', error);
      throw new Error(error.message || 'Failed to get resource');
    }
  }

  async updateResource(id: string, projectId: string, request: UpdateResourceRequest): Promise<Resource> {
    try {
      const updatePayload: any = {};
      
      if (request.name) {
        updatePayload.name = request.name;
      }
      
      if (request.config) {
        const config = request.config as any;
        if (config.repository) {
          updatePayload.repo_owner = config.repository.owner;
          updatePayload.repo_name = config.repository.name;
          updatePayload.branch = config.repository.branch || 'main';
        }
        if (config.serverSpec) {
          const cpuValue = config.serverSpec.cpu || 1;
          const memoryValue = config.serverSpec.memory || 2;
          updatePayload.cpu = `${cpuValue} vCPU`;
          updatePayload.memory = `${memoryValue} GB`;
          updatePayload.port = config.serverSpec.port || 8080;
        }
        if (config.techStack?.language) {
          const runtimeMap: Record<string, string> = {
            'python': 'PYTHON_3',
            'nodejs': 'NODEJS_18',
            'node': 'NODEJS_18',
            'java': 'JAVA_17',
            'go': 'GO_1',
            'php': 'PHP_81',
            'ruby': 'RUBY_31',
          };
          const language = config.techStack.language.toLowerCase();
          updatePayload.runtime = runtimeMap[language] || 'NODEJS_18';
        }
        if ('buildMode' in config) {
          updatePayload.build_command = config.buildMode === 'manual' ? config.buildCommand : null;
        }
        if (config.startCommand) {
          updatePayload.start_command = config.startCommand;
        }
        if (config.environmentVariables) {
          updatePayload.environment_variables = config.environmentVariables;
        }
      }

      const response = await apiClient.put<ServerServiceResponse>(
        `api/services/${id}?project_id=${projectId}`,
        updatePayload
      );

      return {
        id: response.id,
        projectId: response.project_id,
        type: 'service' as const,
        name: response.name,
        status: response.status as any,
        createdAt: new Date(response.created_at),
        updatedAt: new Date(response.updated_at),
      };
    } catch (error: any) {
      console.error('Failed to update resource:', error);
      throw new Error(error.message || 'Failed to update resource');
    }
  }

  async deleteResource(id: string, projectId: string): Promise<void> {
    try {
      await apiClient.delete(`api/services/${id}?project_id=${projectId}`);
    } catch (error: any) {
      console.error('Failed to delete resource:', error);
      throw new Error(error.message || 'Failed to delete resource');
    }
  }
}

