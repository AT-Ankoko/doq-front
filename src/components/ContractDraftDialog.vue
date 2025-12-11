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
        <div class="doc-wrapper py-12 d-flex flex-column align-center">
          
          <div id="print-area" class="print-container">
            <div 
              v-for="(pageHtml, index) in pages" 
              :key="index"
              class="a4-page elevation-4 mb-8"
            >
              <div class="page-header">
                <img 
                  src="@/assets/main-logo-white.svg" 
                  alt="Company Logo" 
                  class="header-logo"
                />
              </div>

              <div class="page-body">
                <div class="page-content" v-html="pageHtml"></div>
              </div>
              
              <div class="page-footer text-grey text-caption text-center">
                - {{ index + 1 }} -
              </div>
            </div>
          </div>

        </div>

        <div class="a4-page calculation-mode" ref="hiddenPageRef">
          <div class="page-body">
            <div class="page-content" ref="hiddenContentRef"></div>
          </div>
        </div>

      </v-card-text>

      <v-card-actions class="pa-4 border-t bg-white">
        <v-spacer></v-spacer>
        <v-btn variant="flat" color="primary" @click="handlePrint">
          <v-icon start>mdi-printer</v-icon>
          인쇄
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

// Markdown 설정
const md = markdownit({ 
  html: true, 
  breaks: true,
  typographer: true 
});

const pages = ref([]); 

const hiddenPageRef = ref(null);
const hiddenContentRef = ref(null);

const PAGE_CONTENT_HEIGHT_PX = 964; 

watch(() => [props.contractDraft, props.modelValue], async ([newDraft, isOpen]) => {
  if (isOpen && newDraft) {
    await nextTick();
    paginateContent(newDraft);
  }
}, { immediate: true });

// 페이지 분할 로직
const paginateContent = (markdownText) => {
  if (!hiddenContentRef.value) return;

  let fullHtml = md.render(markdownText);
  fullHtml = fullHtml.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const hiddenEl = hiddenContentRef.value;
  hiddenEl.innerHTML = '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, 'text/html');
  const children = Array.from(doc.body.children);

  let currentPages = [];
  let currentPageNodes = [];

  children.forEach((child) => {
    const clone = child.cloneNode(true);
    hiddenEl.appendChild(clone);
    const currentHeight = hiddenEl.scrollHeight;

    if (currentHeight > PAGE_CONTENT_HEIGHT_PX) {
      hiddenEl.removeChild(clone);

      if (currentPageNodes.length > 0) {
        const pageHtml = currentPageNodes.map(node => node.outerHTML).join('');
        currentPages.push(pageHtml);
      }

      hiddenEl.innerHTML = '';
      hiddenEl.appendChild(child.cloneNode(true));
      currentPageNodes = [child];
    } else {
      currentPageNodes.push(child);
    }
  });

  if (currentPageNodes.length > 0) {
    const pageHtml = currentPageNodes.map(node => node.outerHTML).join('');
    currentPages.push(pageHtml);
  }

  pages.value = currentPages;
};

// --- PDF 설정 ---
const getPdfOptions = () => {
  return {
    margin: 0, // 기본 마진 제거
    filename: `계약서_${new Date().toISOString().slice(0,10)}.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      scrollY: 0,
      windowWidth: 794, // A4 pixel width (96dpi) 고정
      // height: undefined // 높이는 html2pdf 자동 계산에 맡김
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    // [중요] 자동 페이지 나눔을 방지하고 우리가 나눈 페이지 그대로 사용
    pagebreak: { mode: 'avoid-all' } 
  };
};

const saveAsPdf = () => {
  const element = document.getElementById('print-area');
  
  // PDF 변환 중 스타일 변경 (여백 제거, 높이 조정 등)
  element.classList.add('printing-mode');
  
  html2pdf()
    .set(getPdfOptions())
    .from(element)
    .save()
    .then(() => {
      // 변환 후 스타일 복구
      element.classList.remove('printing-mode');
    });
};

const handlePrint = () => {
  const element = document.getElementById('print-area');
  element.classList.add('printing-mode');
  
  html2pdf()
    .set(getPdfOptions())
    .from(element)
    .toPdf()
    .get('pdf')
    .then((pdf) => {
      element.classList.remove('printing-mode');
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');
    });
};
</script>

<style scoped>
/* 화면 스크롤 영역 */
.doc-scroll-area {
  height: 75vh;
  overflow-y: auto;
  position: relative; 
}

/* [Print Container]
  PDF 캡처 대상 컨테이너.
  Flex Column을 사용하여 div 사이의 공백(Whitespace) 제거 
*/
.print-container {
  width: 210mm;
  padding: 0;
  margin: 0;
  background-color: transparent;
  display: flex;
  flex-direction: column;
}

/* A4 페이지 공통 스타일 */
.a4-page {
  width: 210mm;
  height: 297mm; /* 화면에서는 정사이즈 */
  padding: 0; 
  background-color: white;
  box-sizing: border-box;
  
  color: #333333;           
  font-size: 11px;          
  font-family: "Pretendard", "Malgun Gothic", sans-serif;
  line-height: 1.6;
  
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 화면 미리보기용: 페이지 사이 간격과 그림자 */
.mb-8 { margin-bottom: 32px !important; }

/* [Printing Mode]
  PDF 생성 시 강제 적용되는 스타일 
*/
.print-container.printing-mode .a4-page {
  box-shadow: none !important;      /* 그림자 제거 */
  margin-bottom: 0 !important;      /* 마진 제거 */
  border: none !important;          /* 테두리 제거 */
  
  /* [핵심] 렌더링 오차로 인한 빈 페이지 생성 방지 (0.2mm 축소) */
  height: 296.8mm !important;       
  min-height: 296.8mm !important;
  max-height: 296.8mm !important;
  overflow: hidden;
}

/* 마지막 페이지도 마진 없이 딱 붙게 처리 */
.print-container.printing-mode .a4-page:last-child {
  margin-bottom: 0 !important;
}

/* 높이 계산용 숨김 영역 */
.calculation-mode {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: -1;
}

/* --- 페이지 내부 레이아웃 --- */
.page-header {
  width: 100%;
  height: 64px;               
  background-color: #000000;  
  padding: 16px 40px;         
  display: flex;
  align-items: center;        
  flex-shrink: 0;
}

.header-logo {
  width: 80px;
  height: 22px;
  object-fit: contain;        
  display: block;
}

.page-body {
  flex-grow: 1;
  padding: 28px 36px 60px 36px; 
}

.page-content { 
  width: 100%; 
  height: 964px;
  /* border: 2px dashed #1976d2; */
  border-radius: 8px;
  box-sizing: border-box;
  overflow: hidden; 
  display: block; 
}

.page-footer {
  position: absolute;
  bottom: 36px; 
  left: 0;
  width: 100%;
}

/* 브라우저 기본 인쇄(Ctrl+P) 대응 */
@media print {
  @page { margin: 0 !important; size: A4; }
  body, html { margin: 0 !important; padding: 0 !important; }
  .doc-wrapper { padding: 0 !important; }
  .a4-page { margin: 0 !important; padding: 0 !important; box-shadow: none; border: none; page-break-after: always; }
  .page-header, .page-body { padding: 0 !important; }
  .page-content { border: none !important; background: none !important; height: auto !important; }
  .calculation-mode { display: none !important; }
}

/* --- Markdown 컨텐츠 스타일 --- */
.a4-page :deep(strong),
.a4-page :deep(b) {
  font-weight: 700 !important;
  color: #000000; 
}

/* 불필요한 요소 제거 */
.a4-page :deep(hr) {
  display: none !important;
}

.a4-page :deep(h1) { font-size: 22px; font-weight: 800; margin-bottom: 24px; border-bottom: 2px solid #000; padding-bottom: 10px; line-height: 1.2; }
.a4-page :deep(h2) { font-size: 16px; font-weight: 700; margin-top: 24px; margin-bottom: 8px; color: #07043A; }
.a4-page :deep(h3) { font-size: 14px; color: #07043A; font-weight: 700; margin-top: 20px; margin-bottom: 8px; border-bottom: 2px solid #07043A; padding-bottom: 8px; }
.a4-page :deep(table) { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; }
.a4-page :deep(th), .a4-page :deep(td) { border: 1px solid #E0E0E0; padding: 0 10px; height: 28px; }
.a4-page :deep(th) { background-color: #F8FAFC; color: #666666; font-size: 10px; font-weight: 700; text-align: center; }
.a4-page :deep(p) { margin-bottom: 8px; text-align: justify; word-break: break-all; }
.a4-page :deep(ul), .a4-page :deep(ol) { margin-bottom: 8px; padding-left: 24px; }
.a4-page :deep(li) { margin-bottom: 4px; border-bottom: none !important; }
</style>