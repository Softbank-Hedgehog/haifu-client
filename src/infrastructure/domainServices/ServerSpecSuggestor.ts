import type { ServerSpec } from '../../domain/valueObjects/ServerSpec';
import type { TechStack } from '../../domain/valueObjects/TechStack';

export class ServerSpecSuggestor {
  static suggest(techStack: TechStack): ServerSpec {
    // 간단한 추천 로직
    // 실제로는 더 복잡한 로직이 필요할 수 있음
    const baseSpec: ServerSpec = {
      cpu: 0.5,
      memory: 1,
    };

    // 프레임워크에 따라 조정
    if (techStack.framework?.toLowerCase().includes('react') || 
        techStack.framework?.toLowerCase().includes('vue')) {
      return { cpu: 0.25, memory: 0.5 };
    }

    if (techStack.framework?.toLowerCase().includes('next') ||
        techStack.framework?.toLowerCase().includes('nuxt')) {
      return { cpu: 1, memory: 2 };
    }

    return baseSpec;
  }
}

