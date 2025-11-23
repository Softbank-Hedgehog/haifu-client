// 일반 챗봇 API DTOs

export interface ChatRequest {
  message: string;
}

// Chat API 응답 (Lambda 응답 형식)
export interface ChatApiResponse {
  statusCode: number;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
  };
  body: {
    reply: string;
  };
}

// 정규화된 Chat 응답
export interface ChatResponse {
  reply: string;
}

