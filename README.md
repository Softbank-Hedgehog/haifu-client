# hAIfu Client

hAIfu 플랫폼의 클라이언트 애플리케이션입니다.

## 시작하기

### 1. 환경 변수 설정

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고, `.env.example` 파일의 내용을 참고하여 필요한 환경 변수를 설정하세요.

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 다음 환경 변수들을 설정하세요:

- `VITE_API_BASE_URL`: API 서버의 기본 URL (예: `http://localhost:8080/api`)
- `VITE_USE_MOCK_DATA`: Mock 데이터 사용 여부 (`true` 또는 `false`)

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 시작되면 브라우저에서 `http://localhost:3000` (또는 터미널에 표시된 주소)로 접속할 수 있습니다.

## 사용 가능한 스크립트

- `npm run dev`: 개발 서버를 시작합니다 (Hot Module Replacement 지원) => 개발서버 실행은 이걸로 하면 됩니다.
- `npm run build`: 프로덕션 빌드를 생성합니다
- `npm run preview`: 빌드된 애플리케이션을 미리 볼 수 있습니다
- `npm run lint`: ESLint를 실행하여 코드를 검사합니다

## 기술 스택

- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안정성을 위한 언어
- **Vite**: 빠른 빌드 도구
- **React Router**: 클라이언트 사이드 라우팅
- **Axios**: HTTP 클라이언트

---