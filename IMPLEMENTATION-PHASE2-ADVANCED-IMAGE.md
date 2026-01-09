# 고급 이미지 블록 (Advanced Image Block) 구현 문서

## 1. 개요

본 문서는 텍스트 에디터를 위한 **고급 이미지 블록**의 구현 내용을 상세히 기술합니다. 이 기능은 기존 Editor.js의 기본 이미지 툴을 대체하며, 사용자에게 유연한 레이아웃 옵션, 리사이징 기능, 그리고 매끄러운 사용자 경험을 제공합니다.

## 2. 주요 기능

### 2.1. 다양한 레이아웃 (Multiple Layouts)

이 블록은 세 가지 주요 레이아웃 카테고리를 지원합니다:

- **전체 너비 (Full Width)**: 에디터 전체 너비를 차지하는 단일 이미지입니다.
- **분할 뷰 (Split View)**: 이미지와 텍스트 영역을 나란히 배치합니다.
  - **왼쪽 분할 (Split Left)**: 이미지가 왼쪽, 텍스트가 오른쪽에 위치합니다.
  - **오른쪽 분할 (Split Right)**: 이미지가 오른쪽, 텍스트가 왼쪽에 위치합니다.
  - **리사이징 가능**: 사용자가 구분선을 드래그하여 이미지와 텍스트 사이의 너비 비율을 조절할 수 있습니다.
- **그리드 뷰 (Grid View)**: 여러 이미지를 격자 패턴으로 표시합니다.
  - 지원되는 그리드: 1x2, 1x3, 2x2, 3x3.

### 2.2. 향상된 이미지 관리

- **업로드**: 드래그 앤 드롭 또는 클릭을 통한 이미지 업로드를 지원합니다.
- **교체 (Replacement)**: 이미 업로드된 이미지를 클릭하면 파일 선택 창이 열려 즉시 교체할 수 있습니다.
- **캡션**: 전체 너비 이미지에 대해 선택적인 캡션 입력을 지원합니다.
- **삭제**: 개별 이미지를 제거하거나 교체할 수 있습니다.

### 2.3. UX 개선

- **컨텍스트 메뉴**: 표준 Editor.js 툴과 크기가 일치하도록 조정된 커스텀 아이콘을 사용합니다.
- **레이아웃 전환**: 플로팅 형태의 "레이아웃 변경" 버튼을 통해 언제든지 레이아웃을 변경할 수 있습니다.
- **텍스트 입력**: 분할 뷰(Split View)에서 텍스트 영역은 `Backspace`와 `Enter` 키 입력을 캡처하여, 실수로 블록이 삭제되거나 새 블록이 생성되는 것을 방지하고 자연스러운 줄바꿈과 텍스트 편집을 지원합니다.
- **UI 개선**: Editor.js의 "+" 버튼에 흰색 배경과 테두리를 추가하여 가시성을 높였습니다.

## 3. 코드 구조

구현은 `src/components/editor/tools/advanced-image` 디렉토리 내의 React 컴포넌트들로 모듈화되어 있습니다.

### 3.1. 디렉토리 구조

```
src/components/editor/tools/
├── AdvancedImageTool.tsx       # 메인 Editor.js Block Tool 클래스
└── advanced-image/
    ├── BlockWrapper.tsx        # 메인 React 컨테이너 컴포넌트
    ├── LayoutSelector.tsx      # 레이아웃 선택 UI
    ├── ImageUploader.tsx       # 재사용 가능한 이미지 업로드 컴포넌트
    ├── FullWidthLayout.tsx     # 전체 너비 레이아웃 구현
    ├── SplitLayout.tsx         # 분할 뷰 레이아웃 구현
    ├── GridLayout.tsx          # 그리드 뷰 레이아웃 구현
    └── types.ts                # TypeScript 타입 정의
```

### 3.2. 컴포넌트 역할

- **`AdvancedImageTool.tsx`**:

  - Editor.js (Vanilla JS)와 React 사이의 브리지 역할을 합니다.
  - 블록의 생명주기(`render`, `save`, `validate`)를 처리합니다.
  - React Root를 관리하여 효율적인 렌더링을 보장하고 중복 생성 버그를 방지합니다.
  - **주요 수정**: 초기화 중 Editor.js가 블록을 삭제하는 것을 방지하기 위해 `validate`가 항상 `true`를 반환하도록 구현했습니다.

- **`BlockWrapper.tsx`**:

  - 툴에 의해 렌더링되는 최상위 React 컴포넌트입니다.
  - 선택된 레이아웃과 이미지 데이터의 상태를 관리합니다.
  - `layout` 상태에 따라 적절한 레이아웃 컴포넌트를 렌더링합니다.

- **`LayoutSelector.tsx`**:

  - 사용 가능한 레이아웃 옵션들을 그리드 형태로 표시합니다.
  - 블록이 비어있거나 "레이아웃 변경" 버튼을 클릭했을 때 사용됩니다.

- **`SplitLayout.tsx`**:

  - 리사이징 가능한 분할 뷰의 복잡한 로직을 처리합니다.
  - 마우스 이벤트 리스너를 사용하여 `splitRatio`를 계산하고 업데이트합니다.
  - 텍스트 영역에 대한 키보드 이벤트(`stopPropagation`)를 격리합니다.

- **`GridLayout.tsx`**:
  - 선택된 구성(열/행)에 따라 그리드 슬롯을 동적으로 렌더링합니다.
  - 이미지 배열을 관리합니다.

### 3.3. 유틸리티

- **`src/utils/imageUpload.ts`**:
  - 이미지 교체 기능 등 여러 레이아웃 컴포넌트에서 재사용할 수 있도록 추출된 `uploadImage` 함수를 포함합니다.

## 4. 기술적 상세 및 결정 사항

### 4.1. React 통합

`react-dom/client`의 `createRoot`를 사용하여 Editor.js가 제공하는 DOM 요소 내부에 React 컴포넌트 트리를 렌더링합니다.

- **최적화**: `AdvancedImageTool`의 `render` 메서드는 메모리 누수와 리렌더링 시 React 경고를 방지하기 위해, 새 Root를 생성하기 전에 `this.root`가 이미 존재하는지 확인합니다.

### 4.2. 데이터 포맷

블록은 다음과 같은 형식(`AdvancedImageData`)으로 데이터를 저장합니다:

```typescript
interface AdvancedImageData {
  layout: 'empty' | 'full' | 'split-left' | 'split-right' | 'grid-1x2' | ...;
  images: Array<{
    url: string;
    caption?: string;
    width?: number;
    height?: number;
  }>;
  text?: string;        // 분할 뷰용
  splitRatio?: number;  // 분할 뷰용 (0.0 ~ 1.0)
}
```

### 4.3. 전역 스타일

Editor.js 툴바 버튼의 가시성을 개선하기 위해 `src/app/globals.css`가 업데이트되었습니다:

```css
.ce-toolbar__plus,
.ce-toolbar__settings-btn {
  background-color: white;
  border: 1px solid #e5e7eb;
}
```

## 5. 향후 고려 사항

- **이미지 최적화**: 현재는 표준 `<img>` 태그를 사용하고 있습니다. `next/image`로의 마이그레이션이 가능하지만, Editor.js의 동적 렌더링 환경을 고려한 세심한 처리가 필요합니다.
- **모바일 반응형**: 분할 뷰는 현재 모바일에서 CSS flex-wrap 동작을 통해 세로로 쌓이도록 처리되어 있으나, 작은 화면에서의 그리드 뷰에 대한 추가적인 개선이 고려될 수 있습니다.
