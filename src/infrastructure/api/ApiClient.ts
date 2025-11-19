import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { TokenStorage } from '../storage/TokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// API 응답 형식 정의
export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error_code: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not set');
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = TokenStorage.get();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        const data = response.data;

        if (data && typeof data === 'object' && 'success' in data) {
          if (data.success === false) {
            const errorResponse = data as ApiErrorResponse;
            const error = new Error(errorResponse.message);
            (error as any).error_code = errorResponse.error_code;
            (error as any).response = response;
            
            // 401 에러인 경우 토큰 제거 및 로그인 페이지로 리다이렉트
            if (errorResponse.error_code === 'HTTP_ERROR' && response.status === 401) {
              TokenStorage.remove();
              window.location.href = '/login';
            }
            
            return Promise.reject(error);
          }
          
          // 성공 응답인 경우 data 필드만 반환
          return {
            ...response,
            data: (data as ApiSuccessResponse).data,
          };
        }
        
        // 기존 형식 지원 (success 필드가 없는 경우)
        return response;
      },
      (error) => {
        if (error.response) {
          const responseData = error.response.data;

          if (responseData && typeof responseData === 'object' && 'success' in responseData && responseData.success === false) {
            const errorResponse = responseData as ApiErrorResponse;
            const apiError = new Error(errorResponse.message);
            (apiError as any).error_code = errorResponse.error_code;
            (apiError as any).response = error.response;
            
            if (error.response.status === 401) {
              TokenStorage.remove();
              window.location.href = '/login';
            }
            
            return Promise.reject(apiError);
          }
          
          if (error.response.status === 401) {
            TokenStorage.remove();
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

