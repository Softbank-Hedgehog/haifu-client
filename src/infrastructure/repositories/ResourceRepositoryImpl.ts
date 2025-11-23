import type { ResourceRepository } from '../../domain/repositories/ResourceRepository';
import type { Resource } from '../../domain/entities/Resource';
import type { Deployment, Pipeline } from '../../domain/entities/Deployment';
import { apiClient } from '../api/ApiClient';
import type { CreateResourceRequest, UpdateResourceRequest } from '../../application/dto/ResourceDTO';
import type { CreateServiceRequest, CreateServiceResponse } from '../../application/dto/ServiceDTO';

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
  build_command: string[] | null;
  start_command: string | null;
  environment_variables: Record<string, string> | null;
  status: string;
  deployment_url: string | null;
  created_at: string;
  updated_at: string;
}

export class ResourceRepositoryImpl implements ResourceRepository {
  async createResource(request: CreateResourceRequest, userId?: string): Promise<Resource> {
    try {
      if (request.type !== 'service') {
        throw new Error('Only service type is supported');
      }

      const config = request.config as any;
      const repository = config.repository;
      const serverSpec = config.serverSpec;

      // CPU와 Memory를 숫자로 변환 (MB 단위로)
      const cpuValue = serverSpec?.cpu || 1;
      const memoryValue = serverSpec?.memory || 2;
      // CPU를 MB로 변환 (1 vCPU = 1024 MB)
      const cpuInMB = cpuValue * 1024;
      // Memory를 MB로 변환 (1 GB = 1024 MB)
      const memoryInMB = memoryValue * 1024;

      // Runtime 변환 (buildConfig.runtime 형식을 API 형식으로)
      let runtime = 'nodejs18'; // 기본값
      
      if (config.runtime) {
        const runtimeValue = config.runtime.toLowerCase();
        // 이미 올바른 형식이면 그대로 사용
        if (runtimeValue.match(/^(nodejs18|nodejs20|python3\.11|python311|java17|go1\.21)$/)) {
          // python311 -> python3.11로 변환
          if (runtimeValue === 'python311') {
            runtime = 'python3.11';
          } else {
            runtime = runtimeValue;
          }
        } else if (runtimeValue.includes('nodejs18') || runtimeValue.includes('node18')) {
          runtime = 'nodejs18';
        } else if (runtimeValue.includes('nodejs20') || runtimeValue.includes('node20')) {
          runtime = 'nodejs20';
        } else if (runtimeValue.includes('python311') || runtimeValue.includes('python3.11')) {
          runtime = 'python3.11';
        } else if (runtimeValue.includes('python310') || runtimeValue.includes('python3.10')) {
          runtime = 'python3.11'; // 기본값
        } else if (runtimeValue.includes('python39') || runtimeValue.includes('python3.9')) {
          runtime = 'python3.11'; // 기본값
        } else if (runtimeValue.includes('java17')) {
          runtime = 'java17';
        } else if (runtimeValue.includes('java11')) {
          runtime = 'java17'; // 기본값
        } else if (runtimeValue.includes('go1.21') || runtimeValue.includes('go')) {
          runtime = 'go1.21';
        } else if (runtimeValue.includes('python')) {
          runtime = 'python3.11';
        } else if (runtimeValue.includes('java')) {
          runtime = 'java17';
        } else if (runtimeValue.includes('nodejs') || runtimeValue.includes('node')) {
          runtime = 'nodejs18';
        }
      }

      // buildCommand를 build_commands 배열로 변환
      let buildCommands: string[] | undefined;
      if (config.buildCommands && config.buildCommands.length > 0) {
        buildCommands = config.buildCommands;
      } else if (config.buildCommand) {
        // 단일 buildCommand를 배열로 변환 (&&로 분리)
        buildCommands = config.buildCommand.split('&&').map((cmd: string) => cmd.trim()).filter((cmd: string) => cmd.length > 0);
      }

      // Node version 추출 (runtime에서)
      let nodeVersion: string | undefined;
      if (runtime.includes('nodejs18')) {
        nodeVersion = '18';
      } else if (runtime.includes('nodejs20')) {
        nodeVersion = '20';
      }

      // Port 추출 (serverSpec 또는 config에서)
      const port = serverSpec?.port || config.containerPort || 80;

      // 새로운 API 형식으로 요청 생성 (user_id, project_id 제거)
      const createServiceRequest: CreateServiceRequest = {
        service_type: config.serviceType || 'dynamic',
        build_commands: buildCommands,
        build_output_dir: config.buildOutputDir,
        node_version: nodeVersion,
        runtime: runtime,
        start_command: config.startCommand,
        dockerfile: config.dockerfile,
        cpu: cpuInMB,
        memory: memoryInMB,
        port: port,
      };

      // 새로운 엔드포인트로 요청 (service 단수형)
      const response = await apiClient.post<CreateServiceResponse>(
        `api/projects/${request.projectId}/service`,
        createServiceRequest
      );

      return {
        id: response.id,
        projectId: response.project_id,
        type: 'service' as const,
        name: response.name || request.name,
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
      // ApiClient가 이미 응답의 data 필드를 반환하므로, response는 바로 배열입니다
      const response = await apiClient.get<ServerServiceResponse[]>(
        `api/projects/${projectId}/services`
      );

      // response가 배열인지 확인 (배열이 아닐 수도 있으므로 안전하게 처리)
      const resources = Array.isArray(response) ? response : [];

      return resources.map((s) => ({
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
        if (config.buildCommand || config.buildCommands) {
          // buildCommand를 배열로 변환
          if (config.buildCommands && config.buildCommands.length > 0) {
            updatePayload.build_command = config.buildCommands;
          } else if (config.buildCommand) {
            // 단일 buildCommand를 배열로 변환 (&&로 분리)
            updatePayload.build_command = config.buildCommand.split('&&').map((cmd: string) => cmd.trim()).filter((cmd: string) => cmd.length > 0);
          }
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

  async deploy(serviceId: string): Promise<void> {
    try {
      await apiClient.post(`api/deploy/${serviceId}`, {});
    } catch (error: any) {
      console.error('Failed to deploy service:', error);
      throw new Error(error.message || 'Failed to deploy service');
    }
  }
}

