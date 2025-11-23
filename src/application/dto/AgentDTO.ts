// AI Agent API DTOs

export interface AgentAnalysisRequest {
  message: string;
  project_files: Array<{
    path: string;
    content: string;
  }>;
  user_id: string;
  project_id: string;
  context: {
    github_repo: string;
    framework?: string;
  };
}

export interface AgentRecommendation {
  service_type: 'static' | 'dynamic';
  runtime: string;
  build_commands: string[];
  build_output_dir?: string;
  reasoning?: string;
}

export interface AgentAnalysis {
  framework_detected?: string;
  dependencies?: string[];
  build_tool?: string;
}

export interface AgentAnalysisResponse {
  statusCode: number;
  body: {
    recommendation: AgentRecommendation;
    analysis?: AgentAnalysis;
  };
}

