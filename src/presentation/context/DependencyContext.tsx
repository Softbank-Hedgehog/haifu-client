import React, { createContext, useContext, type ReactNode } from 'react';
import { AuthRepositoryImpl } from '../../infrastructure/repositories/AuthRepositoryImpl';
import { ProjectRepositoryImpl } from '../../infrastructure/repositories/ProjectRepositoryImpl';
import { MockProjectRepository } from '../../infrastructure/repositories/MockProjectRepository';
import { ResourceRepositoryImpl } from '../../infrastructure/repositories/ResourceRepositoryImpl';
import { RepositoryRepositoryImpl } from '../../infrastructure/repositories/RepositoryRepositoryImpl';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository';
import type { ResourceRepository } from '../../domain/repositories/ResourceRepository';
import type { RepositoryRepository } from '../../domain/repositories/RepositoryRepository';

interface DependencyContextType {
  authRepository: AuthRepository;
  projectRepository: ProjectRepository;
  resourceRepository: ResourceRepository;
  repositoryRepository: RepositoryRepository;
}

const DependencyContext = createContext<DependencyContextType | undefined>(undefined);

// Mock 데이터 사용 여부 설정
// true로 설정하면 Mock 데이터를 사용하고, false로 설정하면 실제 API를 호출합니다.
// 환경 변수 VITE_USE_MOCK_DATA를 'true'로 설정하거나, 아래 값을 직접 변경하세요.
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

export const DependencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authRepository = new AuthRepositoryImpl();
  // Mock 데이터 사용 여부에 따라 프로젝트 리포지토리 선택
  const projectRepository = USE_MOCK_DATA 
    ? new MockProjectRepository() 
    : new ProjectRepositoryImpl();
  const resourceRepository = new ResourceRepositoryImpl();
  const repositoryRepository = new RepositoryRepositoryImpl();

  return (
    <DependencyContext.Provider
      value={{
        authRepository,
        projectRepository,
        resourceRepository,
        repositoryRepository,
      }}
    >
      {children}
    </DependencyContext.Provider>
  );
};

export const useDependencies = (): DependencyContextType => {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }
  return context;
};

