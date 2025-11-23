// Deployment API DTOs (정적/동적 배포 판단)

export interface DeploymentRequest {
  s3_snapshot: {
    bucket: string;
    s3_prefix: string;
  };
}

export interface DeploymentResponse {
  service_type?: 'static' | 'dynamic';
  recommendation?: string;
  detected_framework?: string;
}

