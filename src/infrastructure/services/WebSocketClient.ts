import { TokenStorage } from '../storage/TokenStorage';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || import.meta.env.VITE_API_BASE_URL?.replace('http', 'ws') || 'ws://localhost:8000';

export interface LogMessage {
  stage: string;
  message: string;
  timestamp: string;
  level?: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
}

export interface WebSocketMessage {
  type: 'log' | 'status' | 'error' | 'complete';
  data: LogMessage | any;
}

type MessageHandler = (message: WebSocketMessage) => void;
type ErrorHandler = (error: Event) => void;
type CloseHandler = () => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isManualClose = false;
  private messageHandlers: MessageHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private closeHandlers: CloseHandler[] = [];

  constructor(resourceId: string, projectId?: string) {
    const token = TokenStorage.get();
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
    const projectParam = projectId ? `${tokenParam ? '&' : '?'}projectId=${projectId}` : '';
    this.url = `${WS_BASE_URL}/ws/deployment/${resourceId}${tokenParam}${projectParam}`;
  }

  /**
   * WebSocket 연결 시작
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.errorHandlers.forEach(handler => handler(error));
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.closeHandlers.forEach(handler => handler());
          
          // 자동 재연결 (수동 종료가 아닌 경우)
          if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
              this.connect().catch(console.error);
            }, delay);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * WebSocket 연결 종료
   */
  disconnect(): void {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers = [];
    this.errorHandlers = [];
    this.closeHandlers = [];
  }

  /**
   * 메시지 수신 핸들러 등록
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    // 해제 함수 반환
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 에러 핸들러 등록
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 연결 종료 핸들러 등록
   */
  onClose(handler: CloseHandler): () => void {
    this.closeHandlers.push(handler);
    return () => {
      const index = this.closeHandlers.indexOf(handler);
      if (index > -1) {
        this.closeHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 연결 상태 확인
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 메시지 전송 (필요한 경우)
   */
  send(message: any): void {
    if (this.isConnected() && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }
}

