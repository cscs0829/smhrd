# EP 자동 삭제/추가 시스템

이 프로젝트는 Next.js와 Supabase를 사용하여 EP 데이터를 자동으로 처리하는 시스템입니다.

## 주요 기능

- 📊 **데이터 처리**: CSV 파일을 업로드하여 EP 데이터를 자동으로 처리
- 🤖 **AI 통합**: OpenAI와 Google Gemini API를 통한 자동화된 데이터 처리
- 🔑 **API 키 관리**: 안전한 API 키 저장 및 관리
- 🗄️ **데이터베이스**: Supabase를 통한 데이터 저장 및 관리
- 📈 **실시간 모니터링**: 데이터베이스 상태 및 연결 상태 실시간 확인

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS, Radix UI
- **AI**: OpenAI API, Google Gemini API

## 설치 및 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd ep_auto_delete_add
npm install
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 API 키 확인:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI 모델 설정 (선택사항)
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 4. 데이터베이스 마이그레이션

Supabase SQL Editor에서 다음 마이그레이션 파일들을 순서대로 실행:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_ep_data_extra_columns.sql`
3. `supabase/migrations/003_add_city_to_titles.sql`

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## Vercel 배포

### 1. Vercel CLI 설치

```bash
npm i -g vercel
```

### 2. Vercel에 로그인 및 프로젝트 연결

```bash
vercel login
vercel link
```

### 3. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (선택사항)
- `GOOGLE_AI_API_KEY` (선택사항)

### 4. 배포

```bash
vercel --prod
```

## 사용 방법

### 1. 데이터 처리

1. **처리** 탭에서 CSV 파일 업로드
2. AI 모델 선택 및 설정
3. **처리 시작** 버튼 클릭
4. 처리 완료 후 결과 파일 다운로드

### 2. API 키 관리

1. **설정** 탭에서 API 키 관리
2. **API 키 추가** 버튼으로 새 키 추가
3. 기존 키 수정, 삭제, 활성화/비활성화

### 3. 데이터베이스 모니터링

1. **데이터베이스** 탭에서 연결 상태 확인
2. 테이블별 데이터 개수 확인
3. 최근 데이터 샘플 조회

## 데이터베이스 스키마

### 주요 테이블

- `ep_data`: EP 상품 데이터
- `city_images`: 도시별 이미지 데이터
- `titles`: 생성된 제목 데이터
- `api_keys`: API 키 관리
- `deleted_items`: 삭제된 항목 백업

## API 엔드포인트

- `GET /api/db-status`: 데이터베이스 상태 확인
- `GET /api/api-keys`: API 키 목록 조회
- `POST /api/api-keys`: API 키 생성
- `PUT /api/api-keys`: API 키 수정
- `DELETE /api/api-keys`: API 키 삭제
- `POST /api/process`: 파일 처리
- `POST /api/init`: 데이터 초기화

## 보안 고려사항

- API 키는 암호화되어 저장됩니다
- Row Level Security (RLS)가 활성화되어 있습니다
- 모든 API 요청에 적절한 인증이 필요합니다

## 문제 해결

### 데이터베이스 연결 오류

1. Supabase 프로젝트 URL과 API 키가 올바른지 확인
2. 네트워크 연결 상태 확인
3. Supabase 프로젝트가 활성화되어 있는지 확인

### API 키 오류

1. API 키 형식이 올바른지 확인 (OpenAI: sk-로 시작, Gemini: AI로 시작)
2. API 키가 유효한지 확인
3. 사용량 한도 확인

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
