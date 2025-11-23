// Deployment API DTOs (정적/동적 배포 판단)

export interface DeploymentRequest {
  s3_snapshot: {
    bucket: string;
    s3_prefix: string;
  };
}

// Static 배포 응답 body
export interface StaticDeploymentBody {
  service_type: 'static';
  build_commands: string[];
  build_output_dir: string;
  node_version: string;
}

// Dynamic 배포 응답 body
export interface DynamicDeploymentBody {
  service_type: 'dynamic';
  runtime: string;
  start_command: string;
  cpu: string;
  memory: string;
  port: number;
}

// Deployment API 응답 (Lambda 응답 형식)
export interface DeploymentApiResponse {
  statusCode: number;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
  };
  body: StaticDeploymentBody | DynamicDeploymentBody;
}

// 정규화된 Deployment 응답
export interface DeploymentResponse {
  service_type: "static" | "dynamic";
  // Static 필드
  build_commands?: string[];
  build_output_dir?: string;
  node_version?: string;
  // Dynamic 필드
  runtime?: string;
  start_command?: string;
  cpu?: string;
  memory?: string;
  port?: number;
}

