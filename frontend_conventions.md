# Frontend Coding Conventions

> **프로젝트**: `doq-web-FE`  
> **용도**: AI 코드 도구(Gemini CLI, Claude Code)가 자동 리팩토링 시 참조하는 규칙  
> **버전**: 1.0  
> **최종 수정**: 2025-01-22

---

## ⚠️ CRITICAL: UI Preservation Policy

**Zero Visual Regression Rule**: 리팩토링 시 기존 UI가 **1픽셀도 변경되어서는 안 됩니다.**

### 필수 원칙
1. **Visual First**: 시맨틱 태그나 유틸리티 클래스 적용 시 디자인이 달라지면 **기존 스타일 유지 우선**
2. **Verification**: 모든 변경 후 렌더링 결과를 확인하여 UI 100% 일치 검증 필수
3. **Safe Migration**: SCSS 제거 시 스타일이 깨질 위험이 있으면 Inline Style 임시 허용

---

## 1. Tech Stack

```yaml
Framework: Vue.js 3 (Composition API)
Script Style: <script setup>
UI Library: Vuetify 3
CSS: Utility-First (Vuetify Classes) + Standard CSS
Markup: Semantic HTML5

PROHIBITED:
  - SCSS (lang="scss")
  - CSS Nesting
  - function keyword
  - Direct flex usage
```

---

## 2. SFC Structure (Mandatory Order)

```vue
<template>
  <!-- 1. Template (최상단) -->
</template>

<script setup>
// 2. Script (중단)
</script>

<style scoped>
/* 3. Style (최하단) - 표준 CSS만 */
</style>
```

**검증 포인트**:
- [ ] `<style scoped lang="scss">` → `<style scoped>` 변경
- [ ] 태그 순서 준수

---

## 3. Script Setup Structure

### 3.1. Section Order (Strict)

```javascript
<script setup>
// ----- 선언부 (Imports, Props, Emits, Router) ----- //
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const props = defineProps({
  // props 정의
});

const emit = defineEmits(['event-name']);

const router = useRouter();
const route = useRoute();

// ----- 상태 변수 (State & Refs) ----- //
const isVisible = ref(false);
const formData = reactive({
  name: '',
  contact: ''
});

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
onMounted(() => {
  // 마운트 로직
});

onUnmounted(() => {
  // 클린업 로직
});

// ----- 함수 정의 (Methods) ----- //
const handleSubmit = () => {
  // 함수 로직
};
</script>
```

**리팩토링 체크리스트**:
- [ ] 섹션 주석 추가: `// ----- 제목 ----- //`
- [ ] 선언 순서 정렬: Imports → Props/Emits → Router → State → Lifecycle → Methods
- [ ] 각 섹션 사이 빈 줄 1개

### 3.2. Function Definition (Critical)

**❌ PROHIBITED**:
```javascript
function saveData() { ... }
```

**✅ REQUIRED**:
```javascript
const saveData = () => { ... };
```

**리팩토링 규칙**:
- 모든 `function` 키워드 → `const` + 화살표 함수로 변경
- 함수명은 camelCase 유지

---

## 4. Template: Semantic Markup

### 4.1. HTML Tag Usage

| 태그 | 용도 | 예시 |
|------|------|------|
| `<main>` | 페이지 메인 컨텐츠 래퍼 | 전체 페이지 감싸기 |
| `<header>` | 페이지 헤더 (제목, 단계 표시) | 상단 타이틀 영역 |
| `<section>` | 논리적 콘텐츠 그룹 | 입력 폼, 리스트 블록 |
| `<article>` | 독립적 아이템 | 카드, 리스트 아이템 |
| `<nav>` | 네비게이션 | 탭, 메뉴 |
| `<footer>` | 하단 액션 버튼 그룹 | 제출/취소 버튼 영역 |

**리팩토링 규칙**:
```vue
<!-- ❌ Before -->
<div class="page-wrapper">
  <div class="page-header">
    <div class="title">페이지 제목</div>
  </div>
  <div class="content-section">
    <!-- 콘텐츠 -->
  </div>
  <div class="action-buttons">
    <v-btn>제출</v-btn>
  </div>
</div>

<!-- ✅ After -->
<main class="page-wrapper">
  <header class="page-header">
    <h1 class="title">페이지 제목</h1>
  </header>
  <section class="content-section">
    <!-- 콘텐츠 -->
  </section>
  <footer class="action-buttons">
    <v-btn>제출</v-btn>
  </footer>
</main>
```

**⚠️ 주의**: Vuetify 컴포넌트 레이아웃이 우선. UI가 깨지면 `<div>` 유지

### 4.2. Attribute Order (Mandatory)

```vue
<v-btn
  is="button"                    <!-- 1. Definition -->
  v-for="item in items"          <!-- 2. List Rendering -->
  :key="item.id"
  v-if="isVisible"               <!-- 3. Conditionals -->
  v-model="selectedValue"
  id="submit-btn"                <!-- 4. Attributes -->
  class="mt-4 text-primary"
  name="submitButton"
  type="submit"
  color="primary"
  variant="elevated"
  @click="handleSubmit"          <!-- 5. Events -->
  @change="handleChange"
>
  제출
</v-btn>
```

**속성 순서**:
1. Definition (`is`)
2. List Rendering (`v-for`, `:key`)
3. Conditionals (`v-if`, `v-else-if`, `v-else`, `v-show`, `v-model`)
4. Attributes (`id`, `class`, `name`, `type`, Vuetify props)
5. Events (`@click`, `@change`, `@submit`)

---

## 5. Layout & Styling

### 5.1. Grid System (Required)

**❌ PROHIBITED**:
```vue
<div style="display: flex; gap: 16px;">
  <div style="flex: 1;">콘텐츠 1</div>
  <div style="flex: 1;">콘텐츠 2</div>
</div>
```

**✅ REQUIRED**:
```vue
<v-container>
  <v-row>
    <v-col cols="12" md="6">콘텐츠 1</v-col>
    <v-col cols="12" md="6">콘텐츠 2</v-col>
  </v-row>
</v-container>
```

**리팩토링 규칙**:
- `display: flex` → Vuetify Grid로 변경
- `gap`, `justify-content` 등 → Vuetify props 사용 (`justify="space-between"`)

### 5.2. Styling Strategy

**우선순위**:
1. **Vuetify Utility Classes** (최우선)
2. **Scoped CSS** (유틸리티로 불가능한 경우만)
3. **Inline Style** (임시, UI 보존 목적만)

**Vuetify Utility Classes 예시**:
```vue
<!-- 색상 -->
<div class="text-primary bg-surface">

<!-- 여백 -->
<div class="mt-4 mb-2 pa-3">

<!-- 타이포그래피 -->
<div class="text-h5 font-weight-bold">

<!-- 레이아웃 -->
<div class="d-flex align-center justify-space-between">
```

**리팩토링 규칙**:
```vue
<!-- ❌ Before -->
<div style="color: #1976D2; margin-top: 16px; font-weight: bold;">
  텍스트
</div>

<!-- ✅ After -->
<div class="text-primary mt-4 font-weight-bold">
  텍스트
</div>
```

### 5.3. CSS Rules

**❌ PROHIBITED**:
```css
/* SCSS 문법 */
.parent {
  .child {
    color: red;
  }
}

/* CSS 중첩 */
.parent {
  & .child {
    color: red;
  }
}
```

**✅ REQUIRED**:
```css
/* 표준 CSS - 중첩 없음 */
.parent {
  color: blue;
}

.parent .child {
  color: red;
}
```

---

## 6. Data Handling (Backend Communication)

### 6.1. Payload Creation (Critical)

**❌ PROHIBITED**:
```javascript
const submitForm = () => {
  api.post('/endpoint', formData); // 직접 전송 금지
};
```

**✅ REQUIRED**:
```javascript
const submitForm = () => {
  const payload = {
    ...formData,
    contact: formData.contact.replace(/-/g, ''),           // 하이픈 제거
    businessNumber: formData.businessNumber.replace(/-/g, ''),
    registrationNumber: formData.registrationNumber.replace(/-/g, '')
  };
  
  api.post('/endpoint', payload);
};
```

### 6.2. Formatting Rules

**필수 처리 항목**:
- 전화번호: `010-1234-5678` → `01012345678`
- 사업자번호: `123-45-67890` → `1234567890`
- 주민번호: `123456-1234567` → `1234561234567`

**리팩토링 체크리스트**:
- [ ] formData 직접 전송 → payload 객체 생성
- [ ] 하이픈(-) 제거 로직 추가
- [ ] 전송 전 데이터 검증 추가

---

## 7. Refactoring Checklist

AI 도구가 파일 리팩토링 시 순차적으로 확인할 항목:

### Phase 1: Structure
- [ ] SFC 태그 순서: `<template>` → `<script setup>` → `<style scoped>`
- [ ] `<style scoped lang="scss">` → `<style scoped>` 변경

### Phase 2: Script Setup
- [ ] 섹션 주석 추가 및 순서 정렬
- [ ] `function` → `const` + 화살표 함수 변환
- [ ] Import 정리 및 순서 정렬

### Phase 3: Template
- [ ] `<div>` → 시맨틱 태그 변경 (UI 보존 확인)
- [ ] 속성 순서 정렬
- [ ] `v-for`에 `:key` 확인

### Phase 4: Layout
- [ ] `display: flex` → Vuetify Grid 변환
- [ ] 인라인 스타일 → Vuetify 유틸리티 클래스

### Phase 5: Style
- [ ] SCSS 문법 → 표준 CSS
- [ ] CSS 중첩 제거
- [ ] 가능한 스타일 → 유틸리티 클래스로 이동

### Phase 6: Data Handling
- [ ] formData 직접 전송 → payload 생성
- [ ] 하이픈(-) 제거 로직 추가

### Phase 7: Verification
- [ ] UI 렌더링 테스트 (1픽셀도 변경 없어야 함)
- [ ] 기능 동작 확인
- [ ] 콘솔 에러 확인

---

## 8. File Exclusions

**리팩토링 제외 대상**:
- `node_modules/`
- `dist/`, `build/`
- `.env*`
- `*.config.js`, `*.config.ts`
- `package.json`, `package-lock.json`
- 외부 라이브러리 파일

**리팩토링 대상**:
- `src/**/*.vue` (모든 Vue SFC)
- `src/**/*.js`, `src/**/*.ts` (Vue 관련 로직만)

---

## 9. AI Tool Instructions

### For Gemini CLI / Claude Code

**실행 명령 예시**:
```bash
# 프로젝트 전체 리팩토링
gemini code "이 프로젝트의 모든 .vue 파일을 CODING_CONVENTIONS.md 규칙에 맞춰 리팩토링해주세요. UI가 1픽셀도 변경되지 않도록 주의하세요."

# 특정 디렉토리만
claude code "src/views/ 폴더의 Vue 파일들을 CODING_CONVENTIONS.md 규칙대로 리팩토링하되, 기존 UI를 100% 보존하세요."
```

### 리팩토링 우선순위

1. **High Priority** (즉시 적용)
   - `function` → `const` 변환
   - SCSS → 표준 CSS
   - formData 직접 전송 → payload 생성

2. **Medium Priority** (신중히 적용)
   - `display: flex` → Vuetify Grid
   - 인라인 스타일 → 유틸리티 클래스
   - 시맨틱 태그 변경

3. **Low Priority** (선택적 적용)
   - CSS 리팩토링 (UI 깨짐 위험 시 보류)
   - 복잡한 레이아웃 변경

---

## 10. Examples

### Example 1: 전체 파일 리팩토링

**Before**:
```vue
<template>
  <div class="page">
    <div style="display: flex; margin-top: 20px;">
      <div style="flex: 1;">
        <input v-model="name" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

function submitForm() {
  api.post('/user', formData);
}

const formData = ref({ name: '', contact: '' });
</script>

<style scoped lang="scss">
.page {
  .title {
    font-weight: bold;
  }
}
</style>
```

**After**:
```vue
<template>
  <main class="page">
    <v-container>
      <v-row class="mt-5">
        <v-col cols="12">
          <v-text-field v-model="formData.name" />
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<script setup>
// ----- 선언부 (Imports, Props, Emits, Router) ----- //
import { reactive } from "vue";

// ----- 상태 변수 (State & Refs) ----- //
const formData = reactive({ 
  name: '', 
  contact: '' 
});

// ----- 함수 정의 (Methods) ----- //
const submitForm = () => {
  const payload = {
    ...formData,
    contact: formData.contact.replace(/-/g, '')
  };
  
  api.post('/user', payload);
};
</script>

<style scoped>
.page .title {
  font-weight: bold;
}
</style>
```

---

## 11. Troubleshooting

### UI가 깨진 경우
1. 변경 사항 롤백
2. 해당 부분만 기존 스타일 유지 (Inline Style 임시 허용)
3. 주석으로 사유 기록: `<!-- TODO: UI 보존을 위해 임시 유지 -->`

### Vuetify Grid 적용 불가 시
- 기존 `display: flex` 유지
- 주석 추가: `<!-- Note: Vuetify Grid 미적용 (레이아웃 복잡도) -->`

### SCSS 제거 시 스타일 깨짐
- `<style scoped>` 로 변경만 하고 중첩 문법 유지
- 점진적으로 표준 CSS로 전환

---

**마지막 체크**: 모든 리팩토링 후 `npm run dev` 실행하여 UI 확인 필수!