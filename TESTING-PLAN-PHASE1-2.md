# Jest + React Testing Library Test Plan (Phase 1 & 2)

## 1. 목적
- Phase 1, 2에서 완성된 기능을 자동화 테스트로 보강하여 회귀 위험을 줄인다.
- 앱 라우터 기반 Next.js 15 프로젝트에서 UI, 비즈니스 로직, API 레이어를 사용자 시나리오에 맞춰 검증한다.
- 이후 Phase 3+ 기능 확장 시 재사용 가능한 테스트 스캐폴드를 마련한다.

## 2. 적용 범위 및 우선순위
- **Phase 1**: 메타데이터 최소 폼, Editor.js 기본 블록(Paragraph, Header), 작성 → 저장 → 조회 플로우 (`IMPLEMENTATION-PHASE1.md`).
- **Phase 2**: 추가 블록(Image, List, Embed), 8개 메타데이터 필드, 이미지 업로드 API, TagInput, ProjectViewer 확장 (`PHASE2-COMPLETION.md`).
- 자동 저장, undo/redo, DOMPurify 등 Phase 3+ 항목은 범위 외.

## 3. 테스트 스택
- **Runner/Assertion**: Jest 29 (`next/jest` 프리셋).
- **Component Testing**: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.
- **Mocking**: `msw`(REST 핸들러로 `/api/upload-image` 대응), `whatwg-fetch` 폴리필.
- **API 테스트**: Next 라우트용 `next/jest` + `supertest` (Node 환경), 필요 시 `msw` 재사용.
- **유틸**: TypeScript 지원을 위해 `ts-jest` 구성 또는 `swc/jest` preset 유지.

## 4. 폴더 구조 제안
```
tests/
  setup/
    jest.setup.ts        # RTL, jest-dom, fetch, msw server 초기화
    msw.server.ts
  fixtures/
    editorOutput.ts      # Paragraph/Header/Image/List/Embed 샘플 blocks
    metadata.ts          # 메타데이터 기본 입력/에러 케이스
  unit/
    schemas/
      projectFormSchema.spec.ts
    utils/
      sanitizeBasic.spec.ts
    components/
      TagInput.spec.tsx
  integration/
    components/
      ProjectMetadataForm.spec.tsx
      ProjectViewer.spec.tsx
    pages/
      newProjectPage.spec.tsx
  api/
    uploadImage.route.spec.ts
```

## 5. 테스트 시나리오 세부 계획

### 5.1 유닛 테스트
1. **`projectFormSchema` (`src/schemas/project.schema.ts:23`)**
   - 필수 필드 검증: 제목/요약 누락 시 오류 메시지 확인.
   - 해시태그 10개 초과, 잘못된 URL, editorVersion 누락을 에러로 반환.
   - 정상 데이터는 `parse` 성공.
2. **`sanitizeBasic` (`src/components/viewer/ProjectViewer.tsx:232`)**
   - `<script>` 제거, `onClick` 속성 제거, 허용 태그 유지.
3. **`TagInput` (`src/components/forms/TagInput.tsx`)**
   - 중복 태그 추가 시 오류 메시지.
   - Enter 입력 → 태그 추가 및 clear.
   - Backspace → 마지막 태그 삭제.

### 5.2 컴포넌트 통합 테스트
1. **`ProjectMetadataForm` (`src/components/forms/ProjectMetadataForm.tsx`)**
   - 필수 필드 누락 시 오류 메시지 노출.
   - 썸네일 URL 입력 반영, 체크박스 토글, submit 시 onSubmit 호출 데이터 확인.
2. **`ImageUploadField` (내부 호출)**
   - drag & drop 시 `onChange` 호출, 실패 응답(mock) 시 에러 메시지 표시.
3. **`ProjectViewer` (`src/components/viewer/ProjectViewer.tsx`)**
   - Paragraph/Header/Image/List/Embed blocks 렌더링 및 fallback 메시지.
   - sanitizeBasic 적용이 시각적으로 확인되는지 (`screen.queryByTestId` 등으로 white-list 확인).
4. **`/projects/new` 페이지 (`src/app/projects/new/page.tsx`)**
   - 메타데이터 입력 + Editor mock save를 결합하여 저장 성공 플로우: console log 대신 mock 함수 검증, 라우터 push 호출 확인.
   - Zod 실패 시 alert 호출(모킹)과 저장 중 상태 표시.

### 5.3 API/통합 테스트
1. **`POST /api/upload-image` (`src/app/api/upload-image/route.ts`)**
   - 허용 파일 업로드 후 width/height가 반환되는지.
   - 잘못된 MIME/5MB 초과 시 400 응답.
   - 내부 에러(mock) 시 500 응답.
2. **`GET /api/upload-image`**
   - 상태, 메시지, 허용 타입 정보를 반환하는지 확인.

### 5.4 접근성 및 회귀
- RTL의 `getByRole`, `getByLabelText` 사용으로 필드 레이블이 유지되는지 검증.
- aria-* 속성(`ProjectMetadataForm` 필수 안내) 확인.

## 6. 환경 & 설정 작업
1. **패키지 설치**
   ```
   npm install --save-dev jest @types/jest ts-jest @testing-library/react \
     @testing-library/jest-dom @testing-library/user-event msw whatwg-fetch \
     supertest
   ```
2. **`jest.config.ts`**
   - `next/jest` 기반 preset → testEnvironment `jsdom`, setupFilesAfterEnv 지정.
3. **`tests/setup/jest.setup.ts`**
   - `import '@testing-library/jest-dom';`
   - `import 'whatwg-fetch';`
   - `msw` server lifecycle (listen/reset/close).
4. **`package.json` 스크립트**
   - `"test": "jest"`, `"test:watch": "jest --watch"`, `"test:coverage": "jest --coverage"`.

## 7. 실행/CI 전략
- 로컬: `npm run test:watch`로 TDD, PR 전 `npm run test && npm run lint`.
- CI (GitHub Actions 기준):
  ```
  - uses: actions/setup-node (node 20)
  - npm ci
  - npm run lint
  - npm run test:coverage
  ```
- 커버리지 목표: statements/branches/functions 80% 이상, 특히 `schemas/`, `forms/`, `api/` 디렉토리 우선.

## 8. 단계별 로드맵
1. Week 1: 테스트 환경 구성, fixtures 작성, schema/utility/TagInput 유닛 테스트.
2. Week 2: ProjectMetadataForm, ProjectViewer, ImageUploadField 통합 테스트.
3. Week 3: `/projects/new` 페이지 시나리오, API 라우트 테스트, 커버리지 정리.
4. Week 4: CI 파이프라인 연동, 문서화(README 업데이트), 커버리지 리뷰 및 갭 분석.

## 9. 산출물
- `tests/` 이하 테스트 코드 + fixtures.
- `TESTING-PLAN-PHASE1-2.md` (본 문서).
- README/문서에 테스트 실행 가이드 추가.

## 10. 유지보수 원칙
- 새 기능 추가 시 관련 콤포넌트/라우트에 최소 한 개 이상의 테스트 추가.
- DOMPurify, 자동 저장 등 Phase 3 기능이 들어오면 해당 기능의 happy path·failure path를 추가.
- 주요 회귀를 발견하면 실패 사례를 먼저 테스트로 재현한 뒤 수정.

