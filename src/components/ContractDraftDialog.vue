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
                
                <!-- <img 
                  v-if="qrCodeDataUrl" 
                  :src="qrCodeDataUrl" 
                  alt="QR Code" 
                  class="header-qrcode"
                /> -->
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
import QRCode from 'qrcode'; // [추가됨] npm install qrcode 필요

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  contractDraft: { type: String, default: '' },
  documentUrl: { type: String, default: '' } 
});

const emit = defineEmits(['update:modelValue']);

const md = markdownit({ 
  html: true, 
  breaks: true,
  typographer: true 
});

const pages = ref([]); 
const qrCodeDataUrl = ref(''); 

const hiddenPageRef = ref(null);
const hiddenContentRef = ref(null);

const PAGE_CONTENT_HEIGHT_PX = 964; 

watch(() => [props.contractDraft, props.modelValue], async ([newDraft, isOpen]) => {
  if (isOpen && newDraft) {
    await generateQrCode(); 
    await nextTick();
    paginateContent(newDraft);
  }
}, { immediate: true });

const generateQrCode = async () => {
  try {
    const targetUrl = props.documentUrl || window.location.href;
    qrCodeDataUrl.value = await QRCode.toDataURL(targetUrl, {
      margin: 0,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
  } catch (err) {
    console.error('QR Code generation failed', err);
  }
};

const paginateContent = (markdownText) => {
  if (!hiddenContentRef.value) return;

  let fullHtml = md.render(markdownText);
  fullHtml = fullHtml.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const hiddenEl = hiddenContentRef.value;
  hiddenEl.innerHTML = '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, 'text/html');

  // -----------------------------------------------------------
  // [수정됨] '(인)' 테이블 셀 디자인 커스텀 로직
  // -----------------------------------------------------------
  const tdElements = doc.querySelectorAll('td');
  
  tdElements.forEach(td => {
    if (td.textContent.includes('(인)')) {
      // 1. TD 자체 설정 (공간 확보 및 정렬)
      td.style.height = '100px'; 
      td.style.verticalAlign = 'middle'; // 세로 중앙 정렬
      
      // 2. 내부 서명 박스 생성
      const signBox = document.createElement('div');
      signBox.textContent = '(인)';
      
      // 3. 서명 박스 스타일 적용
      Object.assign(signBox.style, {
        width: '60px',
        height: '60px',               // 정사각형
        border: '2px solid #E0E0E0',  // 테두리 컬러 및 두께
        borderRadius: '6px',          // 라운드
        color: '#999999',             // 텍스트 컬러
        fontSize: '11px',             // 폰트 사이즈
        fontWeight: 'normal',
        margin: '0 auto',             // TD 내부 가로 중앙 정렬
        
        // 박스 내부 텍스트 정중앙 정렬 (Flex)
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box'
      });

      // 4. 기존 텍스트를 지우고 박스로 교체
      td.innerHTML = ''; 
      td.appendChild(signBox);
    }
  });
  // -----------------------------------------------------------

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
    margin: 0, 
    filename: `계약서_${new Date().toISOString().slice(0,10)}.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      scrollY: 0,
      windowWidth: 794,
      height: undefined
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: 'avoid-all' } 
  };
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

.print-container {
  width: 210mm;
  padding: 0;
  margin: 0;
  background-color: transparent;
  display: flex;
  flex-direction: column;
}

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
}

.mb-8 { margin-bottom: 32px !important; }

.print-container.printing-mode .a4-page {
  box-shadow: none !important;
  margin-bottom: 0 !important;
  border: none !important;
  height: 296.8mm !important;       
  min-height: 296.8mm !important;
  max-height: 296.8mm !important;
  overflow: hidden;
}

.print-container.printing-mode .a4-page:last-child {
  margin-bottom: 0 !important;
}

.calculation-mode {
  position: absolute;
  top: 0;
  left: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: -1;
}

/* --- 페이지 헤더 스타일 --- */
.page-header {
  width: 100%;
  height: 64px;               
  background-color: #000000;  
  padding: 16px 8px 16px 40px;         
  display: flex;
  align-items: center;  
  justify-content: space-between;     
  flex-shrink: 0;
}

.header-logo {
  width: 80px;
  height: 22px;
  object-fit: contain;        
  display: block;
}

.header-qrcode {
  height: 48px; 
  width: 48px;  
  background-color: white; 
  padding: 2px; 
  object-fit: contain;
}

.page-body {
  flex-grow: 1;
  padding: 28px 36px 60px 36px; 
}

.page-content { 
  width: 100%; 
  height: 964px;
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

@media print {
  @page { margin: 0 !important; size: A4; }
  body, html { margin: 0 !important; padding: 0 !important; }
  .doc-wrapper { padding: 0 !important; }
  .a4-page { margin: 0 !important; padding: 0 !important; box-shadow: none; border: none; page-break-after: always; }
  .page-header, .page-body { padding: 0 !important; }
  .page-content { border: none !important; background: none !important; height: auto !important; }
  .calculation-mode { display: none !important; }
}

.a4-page :deep(strong),
.a4-page :deep(b) {
  font-weight: 700 !important;
  color: #000000; 
}

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