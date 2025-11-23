// 새로운 서비스 생성 API DTOs

export interface CreateServiceRequest {
  service_type: 'static' | 'dynamic';
  build_commands?: string[];
  build_output_dir?: string;
  node_version?: string;
  runtime: string;
  start_command?: string;
  dockerfile?: string;
  cpu: number;
  memory: number;
  port: number;
}

export interface CreateServiceResponse {
  id: string;
  project_id: string;
  name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

