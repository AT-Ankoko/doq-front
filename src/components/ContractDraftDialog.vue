<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)" 
    max-width="1000" 
    scrollable
  >
    <v-card rounded="xl" class="preview-card">
      <v-card-title class="d-flex align-center pa-4 border-b bg-white">
        <v-icon class="mr-2">mdi-file-document-outline</v-icon>
        <span class="text-h6 font-weight-bold">계약서 미리보기 ({{ pages.length }}페이지)</span>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-0 bg-grey-lighten-3 doc-scroll-area">
        <div class="doc-wrapper pa-8 d-flex flex-column align-center" id="print-area">
          
          <div 
            v-for="(pageHtml, index) in pages" 
            :key="index"
            class="a4-page elevation-3 mb-8"
            v-html="pageHtml"
          ></div>

          <div ref="hiddenContainer" class="a4-page-hidden"></div>

        </div>
      </v-card-text>

      <v-card-actions class="pa-4 border-t bg-white">
        <v-btn variant="tonal" color="secondary" class="mr-2" @click="handlePrint">
          <v-icon start>mdi-printer</v-icon>
          인쇄
        </v-btn>
        <v-btn variant="flat" color="primary" @click="saveAsPdf">
          <v-icon start>mdi-file-pdf-box</v-icon>
          PDF 저장
        </v-btn>
        
        <v-spacer></v-spacer>
        
        <v-btn variant="text" @click="$emit('update:modelValue', false)">닫기</v-btn>
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

// A4 콘텐츠 영역 높이 (약 1123px - 여백)
const PAGE_CONTENT_HEIGHT_PX = 980; 

watch(() => [props.contractDraft, props.modelValue], async ([newDraft, isOpen]) => {
  if (isOpen && newDraft) {
    await nextTick();
    paginateContent(newDraft);
  }
}, { immediate: true });

const paginateContent = (markdownText) => {
  if (!hiddenContainer.value) return;

  const fullHtml = md.render(markdownText);
  hiddenContainer.value.innerHTML = fullHtml;

  const children = Array.from(hiddenContainer.value.children);
  let currentPages = [];
  let currentPageContent = [];
  let currentHeight = 0;

  children.forEach((child) => {
    const childHeight = child.offsetHeight;
    
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

// --- 기능 함수들 ---

const handlePrint = () => {
  window.print();
};

const saveAsPdf = () => {
  const element = document.getElementById('print-area');
  
  const opt = {
    margin:       0,
    filename:     '용역계약서.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: 'css', after: '.a4-page' }
  };

  html2pdf().set(opt).from(element).save();
};
</script>

<style scoped>
.doc-scroll-area {
  height: 75vh;
  overflow-y: auto;
}

.a4-page {
  width: 210mm;
  min-height: 297mm;
  padding: 25mm;
  background-color: white;
  box-sizing: border-box;
  color: #333;
  font-family: "Pretendard", "Malgun Gothic", sans-serif;
  line-height: 1.6;
  font-size: 11pt;
  overflow: hidden; 
}

.a4-page-hidden {
  position: absolute;
  visibility: hidden;
  width: 210mm;
  padding: 25mm;
  font-family: "Pretendard", "Malgun Gothic", sans-serif;
  line-height: 1.6;
  font-size: 11pt;
  top: -9999px;
  left: -9999px;
}

/* 마크다운 스타일 */
.a4-page :deep(h1) { font-size: 24pt; font-weight: 800; margin-bottom: 24px; border-bottom: 2px solid #000; padding-bottom: 12px; }
.a4-page :deep(h2) { font-size: 14pt; font-weight: 700; margin-top: 30px; margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
.a4-page :deep(table) { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10pt; }
.a4-page :deep(th), .a4-page :deep(td) { border: 1px solid #d0d0d0; padding: 8px 12px; }
.a4-page :deep(th) { background-color: #f7f7f7; font-weight: 600; }

@media print {
  body * { visibility: hidden; }
  #print-area, #print-area * { visibility: visible; }
  #print-area { position: absolute; left: 0; top: 0; width: 100%; }
  .a4-page { margin: 0; border: none !important; box-shadow: none !important; page-break-after: always; }
  .a4-page:last-child { page-break-after: auto; }
  .a4-page-hidden { display: none; }
}
</style>