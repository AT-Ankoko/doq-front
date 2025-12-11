<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)" 
    max-width="1100" 
    scrollable
  >
    <v-card rounded="xl" class="preview-card">
      <v-card-title class="d-flex align-center pa-4 border-b bg-white">
        <v-icon class="mr-2">mdi-file-document-outline</v-icon>
        <span class="text-h6 font-weight-bold">계약서 미리보기 ({{ pages.length }}페이지)</span>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-0 bg-blue-grey-lighten-5 doc-scroll-area">
        <div class="doc-wrapper py-12 d-flex flex-column align-center" id="print-area">
          
          <div 
            v-for="(pageHtml, index) in pages" 
            :key="index"
            class="a4-page elevation-4 mb-8"
          >
            <div class="page-content" v-html="pageHtml"></div>
            
            <div class="page-footer text-grey text-caption text-center">
              {{ index + 1 }} / {{ pages.length }}
            </div>
          </div>

          <div ref="hiddenContainer" class="a4-page-hidden"></div>

        </div>
      </v-card-text>

      <v-card-actions class="pa-4 border-t bg-white">
        <v-spacer></v-spacer> <v-btn variant="outlined" color="secondary" class="mr-2" @click="handlePrint">
          <v-icon start>mdi-printer</v-icon>
          PDF 인쇄
        </v-btn>
        <v-btn variant="flat" color="primary" @click="saveAsPdf">
          <v-icon start>mdi-download</v-icon>
          PDF 저장
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import markdownit from 'markdown-it';
import html2pdf from 'html2pdf.js';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  contractDraft: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);

const md = markdownit({ html: true, breaks: true });
const pages = ref([]); 
const hiddenContainer = ref(null); 

// A4 콘텐츠 허용 높이 (px)
// A4 높이(297mm) - 상하패딩(50mm) = 247mm
// 96DPI 기준 약 933px이나, 오차 범위를 위해 보수적으로 900px 설정
const PAGE_CONTENT_HEIGHT_PX = 900; 

watch(() => [props.contractDraft, props.modelValue], async ([newDraft, isOpen]) => {
  if (isOpen && newDraft) {
    await nextTick();
    paginateContent(newDraft);
  }
}, { immediate: true });

// 콘텐츠를 A4 크기로 자르는 로직
const paginateContent = (markdownText) => {
  if (!hiddenContainer.value) return;

  const fullHtml = md.render(markdownText);
  hiddenContainer.value.innerHTML = fullHtml;

  const children = Array.from(hiddenContainer.value.children);
  let currentPages = [];
  let currentPageContent = [];
  let currentHeight = 0;

  children.forEach((child) => {
    // 요소의 높이 계산 (마진 포함)
    const style = window.getComputedStyle(child);
    const marginTop = parseInt(style.marginTop);
    const marginBottom = parseInt(style.marginBottom);
    const childHeight = child.offsetHeight + marginTop + marginBottom;
    
    // 현재 페이지 허용 높이를 초과하면 다음 페이지로
    if (currentHeight + childHeight > PAGE_CONTENT_HEIGHT_PX) {
      if (currentPageContent.length > 0) {
        currentPages.push(currentPageContent.map(el => el.outerHTML).join(''));
      }
      currentPageContent = [child];
      currentHeight = childHeight;
    } else {
      currentPageContent.push(child);
      currentHeight += childHeight;
    }
  });

  if (currentPageContent.length > 0) {
    currentPages.push(currentPageContent.map(el => el.outerHTML).join(''));
  }

  pages.value = currentPages;
};

// --- PDF 옵션 설정 (공통) ---
const getPdfOptions = () => {
  return {
    margin:       0, // CSS에서 이미 A4 여백을 잡고 있으므로 0
    filename:     `계약서_${new Date().toISOString().slice(0,10)}.pdf`,
    image:        { type: 'jpeg', quality: 1.0 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    // .a4-page 클래스 단위로 페이지를 나눔 (화면에 보이는 그대로 저장)
    pagebreak:    { mode: 'css', after: '.a4-page' }
  };
};

// --- 기능 함수들 ---

// 1. PDF 저장
const saveAsPdf = () => {
  const element = document.getElementById('print-area');
  html2pdf().set(getPdfOptions()).from(element).save();
};

// 2. PDF 인쇄 (PDF를 생성한 후 바로 인쇄창 띄우기)
const handlePrint = () => {
  const element = document.getElementById('print-area');
  
  // toPdf()로 생성 후, get('pdf')로 jsPDF 객체를 받아와서 autoPrint 실행
  html2pdf()
    .set(getPdfOptions())
    .from(element)
    .toPdf()
    .get('pdf')
    .then((pdf) => {
      // PDF 자체 인쇄 기능 호출
      pdf.autoPrint();
      // 브라우저 새 탭에서 열기 (팝업 차단 주의)
      window.open(pdf.output('bloburl'), '_blank');
    });
};
</script>

<style scoped>
/* 모달 내부 스크롤 영역 */
.doc-scroll-area {
  height: 75vh;
  overflow-y: auto;
}

/* 실제 A4 용지 스타일 
  - 화면상 미리보기와 PDF 생성 시 공통으로 사용
*/
.a4-page {
  width: 210mm;
  height: 297mm; /* 고정 높이 */
  padding: 25mm; /* 상하좌우 여백 */
  background-color: white;
  box-sizing: border-box;
  color: #000;
  
  /* 폰트 설정 */
  font-family: "Pretendard", "Malgun Gothic", sans-serif;
  line-height: 1.6;
  font-size: 11pt;
  
  position: relative;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex-grow: 1;
  overflow: hidden; /* 내용이 넘치면 자름 (페이지네이션 로직이 처리하므로) */
}

/* 페이지 번호 */
.page-footer {
  position: absolute;
  bottom: 10mm;
  left: 0;
  width: 100%;
}

/* 페이지 계산을 위한 숨김 영역 (화면에 보이지 않음) */
.a4-page-hidden {
  position: absolute;
  visibility: hidden;
  width: 210mm; /* 너비는 동일하게 맞춰야 높이 계산이 정확함 */
  padding: 25mm;
  font-family: "Pretendard", "Malgun Gothic", sans-serif;
  line-height: 1.6;
  font-size: 11pt;
  top: -9999px;
  left: -9999px;
  pointer-events: none;
}

/* 마크다운 내부 요소 스타일링 */
.a4-page :deep(h1) { font-size: 22pt; font-weight: 800; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; line-height: 1.2; }
.a4-page :deep(h2) { font-size: 14pt; font-weight: 700; margin-top: 24px; margin-bottom: 12px; }
.a4-page :deep(h3) { font-size: 12pt; font-weight: 700; margin-top: 16px; margin-bottom: 8px; }
.a4-page :deep(table) { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; }
.a4-page :deep(th), .a4-page :deep(td) { border: 1px solid #000; padding: 6px 10px; }
.a4-page :deep(th) { background-color: #f0f0f0; font-weight: 600; text-align: center; }
.a4-page :deep(p) { margin-bottom: 8px; text-align: justify; word-break: break-all; }
.a4-page :deep(ul), .a4-page :deep(ol) { margin-bottom: 8px; padding-left: 24px; }
.a4-page :deep(li) { margin-bottom: 4px; }

/* 인쇄(PDF 생성) 시 적용되는 스타일 
  html2pdf는 화면에 보이는 CSS를 캡처하므로 
  화면상 스타일(.a4-page)이 가장 중요함.
  아래는 html2pdf 내부 처리용 보조 스타일.
*/
</style>