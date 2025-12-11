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
        <v-btn variant="outlined" color="secondary" class="mr-2" @click="handlePrint">
          <v-icon start>mdi-printer</v-icon>
          인쇄
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
        currentPages.push(currentPageNodes.map(node => node.outerHTML).join(''));
      }
      hiddenEl.innerHTML = '';
      hiddenEl.appendChild(child.cloneNode(true));
      currentPageNodes = [child];
    } else {
      currentPageNodes.push(child);
    }
  });

  if (currentPageNodes.length > 0) {
    currentPages.push(currentPageNodes.map(node => node.outerHTML).join(''));
  }

  pages.value = currentPages;
};

// --- PDF 설정 ---
const getPdfOptions = () => {
  return {
    margin: 0, // PDF 자체 마진 제거
    filename: `계약서_${new Date().toISOString().slice(0,10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      scrollY: 0,
      // [수정 4] 캡처 시 창 너비를 A4 너비에 맞게 고정하여 레이아웃 깨짐 방지
      windowWidth: 794 // 약 210mm in pixels (96dpi 기준)
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] } // [수정 5] 페이지 나눔 모드 명시
  };
};

const saveAsPdf = () => {
  // [수정 6] PDF 생성 전 화면상의 마진/그림자 임시 제거 (필요시)
  const element = document.getElementById('print-area');
  
  // PDF 생성 시에는 화면의 갭을 없애기 위해 클래스 조작이 필요할 수 있음
  element.classList.add('printing-mode');
  
  html2pdf()
    .set(getPdfOptions())
    .from(element)
    .save()
    .then(() => {
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
.doc-scroll-area {
  height: 75vh;
  overflow-y: auto;
  position: relative; 
}

/* [수정 7] print-container 스타일 추가 */
.print-container {
  width: 210mm; /* A4 너비 고정 */
  padding: 0;
  margin: 0;
  background-color: transparent;
}

/* A4 페이지 공통 스타일 */
.a4-page {
  width: 210mm;
  height: 297mm;
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
  /* 페이지 구분을 위한 그림자 (PDF 캡처시 제거됨) */
}

/* [수정 8] PDF 캡처 중(.printing-mode)일 때 스타일 강제 적용 */
/* 중요: html2canvas는 현재 화면의 스타일을 그대로 찍기 때문에 
   캡처 순간에 마진과 그림자를 없애야 합니다. */
.print-container.printing-mode .a4-page {
  box-shadow: none !important;
  margin-bottom: 0 !important; /* 페이지 사이 갭 제거 */
  border: none !important;
}

/* 미리보기 화면에서의 페이지 간격 (PDF 캡처시는 위 코드로 무시됨) */
.mb-8 {
  margin-bottom: 32px !important;
}

.calculation-mode {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: -1;
}

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
  border: 2px dashed #1976d2;
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

/* @media print는 브라우저 인쇄(Ctrl+P)용이며 html2pdf에는 영향을 덜 주지만 유지 */
@media print {
  @page { margin: 0 !important; size: A4; }
  body, html { margin: 0 !important; padding: 0 !important; }
  .doc-wrapper { padding: 0 !important; }
  .a4-page { margin: 0 !important; padding: 0 !important; box-shadow: none; border: none; page-break-after: always; }
  .page-header, .page-body { padding: 0 !important; } /* 필요시 조절 */
}

.a4-page :deep(strong), .a4-page :deep(b) { font-weight: 700 !important; color: #000000; }
.a4-page :deep(hr) { display: none !important; }
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