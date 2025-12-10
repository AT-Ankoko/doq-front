<template>
  <v-container class="pa-6" fluid style="min-height: 100vh; background-color: #F2F7FB;">
    <v-card rounded="xl" elevation="0" class="mb-4 pa-4" style="background-color: #FFFFFF;">
      <div class="d-flex align-center">
        <v-btn icon="mdi-chevron-left" variant="text" @click="goBack" class="mr-2" color="grey-darken-2"></v-btn>
        <div>
          <h1 class="text-h5 font-weight-bold text-grey-darken-3 mb-1">
            {{ contractName || '세션 상세 정보' }}
          </h1>
          <p class="text-caption text-grey ma-0">{{ sessionId }}</p>
        </div>
        <v-spacer></v-spacer>
        <v-btn 
          color="primary" 
          variant="flat" 
          class="font-weight-bold"
          rounded="lg"
          @click="fetchSessionDetail"
          :loading="isLoading"
        >
          <v-icon class="mr-1" size="18">mdi-refresh</v-icon>
          새로고침
        </v-btn>
      </div>
    </v-card>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4"></v-progress-linear>
    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <v-row v-if="sessionData" class="match-height">
      <v-col cols="12" md="8" class="d-flex flex-column gap-4">
        
        <v-card rounded="xl" elevation="0" style="background-color: #FFFFFF">
          <div class="d-flex align-center justify-space-between px-6 py-4 border-b">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-account-details-outline</v-icon>
              <span class="text-h6 font-weight-bold text-grey-darken-3">세션 정보</span>
            </div>
            <v-chip color="grey-darken-3" size="small" label variant="flat" class="font-weight-bold">
              {{ getStepLabel(sessionData.state?.current_step) }}
            </v-chip>
          </div>
          <v-card-text class="pa-6">
            <div class="mb-6">
              <div class="d-flex justify-space-between mb-2">
                <span class="text-caption font-weight-bold text-grey-darken-1">진행률</span>
                <span class="text-caption font-weight-bold text-primary">{{ sessionData.state?.progress_percentage || 0 }}%</span>
              </div>
              <v-progress-linear
                :model-value="sessionData.state?.progress_percentage || 0"
                color="primary"
                height="8"
                rounded
                bg-color="grey-lighten-3"
              ></v-progress-linear>
            </div>
            <v-row>
              <v-col cols="6" md="4">
                <span class="text-caption text-grey mb-2 d-block">시작일</span>
                <p class="text-caption text-grey-darken-3 ma-0 font-weight-medium">{{ formatDate(sessionData.state?.created_at) }}</p>
              </v-col>
              <v-col cols="6" md="4">
                <span class="text-caption text-grey mb-2  d-block">수정일</span>
                <p class="text-caption text-grey-darken-3 ma-0 font-weight-medium">{{ formatDate(sessionData.state?.updated_at) }}</p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card rounded="xl" elevation="0" class="d-flex flex-column" style="min-height: 400px; max-height: 600px; background-color: #FFFFFF">
          <div class="d-flex align-center px-6 py-4 border-b">
            <v-icon color="primary" class="mr-2">mdi-message-text-outline</v-icon>
            <span class="text-h6 font-weight-bold text-grey-darken-3">채팅 내역</span>
          </div>

          <v-card-text class="flex-grow-1 overflow-y-auto pa-6 bg-grey-lighten-5" style="min-height: 0;">
            <div v-if="sessionData.chat_history?.length > 0">
              <template v-for="(chat, index) in sessionData.chat_history" :key="chat.id || index">
                
                <!-- AI 메시지 -->
                <article v-if="chat.participant === 'assistant'" class="d-flex flex-column align-start mb-6">
                  <div class="d-flex align-center mb-1">
                    <span class="font-weight-bold text-caption text-grey-darken-2 pl-1">AI DoQ</span>
                    <span class="text-caption text-grey ml-2">{{ formatDateSimple(chat.created_at) }}</span>
                  </div>
                  <div 
                    class="pa-4 rounded-lg rounded-tl-0 text-body-2 text-grey-darken-3 elevation-0"
                    style="max-width: 85%; white-space: pre-wrap; line-height: 1.6; background-color: #E8E8E8;"
                  >
                    {{ getChatText(chat) }}
                  </div>
                </article>

                <!-- 의뢰인 (Client) 메시지 - 항상 오른쪽 -->
                <article v-else-if="chat.participant === 'client'" class="d-flex flex-column align-end mb-6">
                  <div class="d-flex align-center mb-1">
                    <span class="text-caption text-grey mr-2">{{ formatDateSimple(chat.created_at) }}</span>
                    <span class="font-weight-bold text-caption text-primary pl-1">의뢰인</span>
                  </div>
                  <div 
                    class="pa-4 rounded-lg rounded-tr-0 text-grey-darken-3 text-body-2 elevation-0"
                    style="max-width: 80%; white-space: pre-wrap; line-height: 1.6; background-color: #E3F2FD;"
                  >
                    {{ getChatText(chat) }}
                  </div>
                </article>

                <!-- 용역자 (Provider) 메시지 - 항상 오른쪽 -->
                <article v-else-if="chat.participant === 'provider'" class="d-flex flex-column align-end mb-6">
                  <div class="d-flex align-center mb-1">
                    <span class="text-caption text-grey mr-2">{{ formatDateSimple(chat.created_at) }}</span>
                    <span class="font-weight-bold text-caption text-grey-darken-2 pl-1">용역자</span>
                  </div>
                  <div 
                    class="pa-4 bg-primary rounded-lg rounded-tr-0 text-white text-body-2 elevation-0"
                    style="max-width: 80%; white-space: pre-wrap; line-height: 1.6;"
                  >
                    {{ getChatText(chat) }}
                  </div>
                </article>

              </template>
            </div>
            <div v-else class="d-flex align-center justify-center h-100 text-grey">
              내역 없음
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="d-flex flex-column gap-4">
        
        <v-card rounded="xl" elevation="0" style="background-color: #FFFFFF">
          <div class="d-flex align-center px-6 py-4 border-b">
            <v-icon color="primary" class="mr-2">mdi-file-document-check-outline</v-icon>
            <span class="text-h6 font-weight-bold text-grey-darken-3">수집된 계약 데이터</span>
          </div>
          <v-card-text class="pa-4">
            <v-row dense>
              <v-col cols="6" v-for="(value, key) in filteredCollectedData" :key="key">
                <div class="pa-3 rounded-lg h-100" style="background-color: #FAFAFA">
                  <span class="text-caption text-grey font-weight-bold d-block mb-1">{{ getDataLabel(key) }}</span>
                  <p class="text-body-2 font-weight-bold text-grey-darken-3 ma-0 text-truncate">
                    {{ formatDataValue(value) }}
                  </p>
                </div>
              </v-col>
            </v-row>
            <div v-if="!sessionData.state?.collected_data" class="text-center pa-4 text-grey">
              데이터 없음
            </div>
          </v-card-text>
        </v-card>

        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          height="48"
          class="font-weight-bold"
          @click="showContractDialog = true"
          :disabled="!lastContractDraft"
        >
          <v-icon class="mr-2">mdi-file-document-outline</v-icon>
          계약서 초안 보기
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="showContractDialog" max-width="800" scrollable>
      <v-card rounded="xl" style="background-color: #FFFFFF">
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon class="mr-2">mdi-file-document</v-icon>
          계약서 초안
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showContractDialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6" style="max-height: 70vh; overflow-y: auto;">
          <div 
            class="contract-content mx-auto" 
            style="max-width: 680px;" 
            v-html="renderedContractDraft"
          ></div>
        </v-card-text>

        <v-card-actions class="pa-4 border-t">
          <v-btn variant="outlined" size="small" @click="copyContractDraft">
            <v-icon class="mr-1" size="18">mdi-content-copy</v-icon>
            복사
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showContractDialog = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
// ----- 선언부 (Imports, Props, Emits, Router) ----- //
import { onMounted, ref, computed, defineEmits } from "vue";
import { useRouter, useRoute } from "vue-router";
import markdownit from 'markdown-it';

const emit = defineEmits(['set-side-nav', 'set-top-nav']);

const router = useRouter();
const route = useRoute();

const md = markdownit({
  html: true,
  breaks: true,
});

// ----- 상태 변수 (State & Refs) ----- //
const isLoading = ref(false);
const errorMessage = ref('');
const sessionData = ref(null);
const sessionId = ref('');
const roleTab = ref('client');
const showContractDialog = ref(false);

const API_BASE_URL = 'http://localhost:9571';

const stepLabels = {
  introduction: '소개',
  work_scope: '작업 범위',
  work_period: '작업 기간',
  budget: '대금/지급',
  revisions: '수정 정책',
  copyright: '저작권',
  confidentiality: '기밀 유지',
  conflict_resolution: '갈등 중재',
  finalization: '최종 확인',
  completed: '완료'
};

const dataLabels = {
  client_name: '의뢰인 이름',
  client_company: '의뢰인 회사',
  provider_name: '용역자 이름',
  provider_company: '용역자 회사',
  category: '카테고리',
  work_scope: '작업 범위',
  work_period: '작업 기간',
  start_date: '시작일',
  end_date: '종료일',
  budget: '예산',
  revision_count: '수정 횟수',
  copyright_owner: '저작권자',
  confidentiality_terms: '기밀유지 조건',
  special_conditions: '특별 조건'
};

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
onMounted(() => {
  emit('set-side-nav', false);
  emit('set-top-nav', true);
  sessionId.value = route.params.sid;
  if (sessionId.value) fetchSessionDetail();
  else errorMessage.value = '세션 ID가 없습니다.';
});

// ----- 함수 정의 (Methods) ----- //
const filteredCollectedData = computed(() => {
  const data = sessionData.value?.state?.collected_data;
  if (!data) return {};
  return Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== null));
});

const lastContractDraft = computed(() => {
  const history = sessionData.value?.chat_history;
  if (!history) return null;
  for (let i = history.length - 1; i >= 0; i--) {
    const draft = history[i]?.message?.bd?.contract_draft;
    if (draft) return draft;
  }
  return null;
});

const contractName = computed(() => {
  const category = sessionData.value?.state?.collected_data?.category;
  if (category && category !== '{{category}}') {
    return category.includes('용역') ? category : `${category} 용역`;
  }
  const name = sessionData.value?.state?.user_info?.user_name;
  return name ? `${name}님의 계약서` : '계약서 상세';
});

const currentRoleInputs = computed(() => {
  if (!sessionData.value?.state?.role_inputs) return [];
  return sessionData.value.state.role_inputs[roleTab.value] || [];
});

const renderedContractDraft = computed(() => {
  const draft = lastContractDraft.value || '';
  return md.render(draft);
});

const fetchSessionDetail = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/v1/archive/session/${sessionId.value}`);
    const result = await response.json();
    if (result.state?.code === 'S0000' || result.state === 'SUCCESS') {
      sessionData.value = result.data;
    } else {
      errorMessage.value = result.state?.msg || '로드 실패';
    }
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => router.push('/archive');
const getStepLabel = (s) => stepLabels[s] || s || '-';
const getChatText = (c) => c.message?.bd?.text || '';
const getDataLabel = (k) => dataLabels[k] || k;
const formatDataValue = (v) => (typeof v === 'string' && v.length > 30 ? v.substring(0,30)+'...' : v);

const formatDate = (d) => {
  if(!d) return '-';
  return new Date(d).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'});
};

const formatDateSimple = (d) => {
  if(!d) return '';
  return new Date(d).toLocaleTimeString('ko-KR', { hour: '2-digit', minute:'2-digit'});
};

const copyContractDraft = () => {
  navigator.clipboard.writeText(lastContractDraft.value).then(() => alert('복사완료'));
};

</script>

<style scoped>
.gap-4 { gap: 16px; }
.text-body-2 { word-break: break-word; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 3px; }

.contract-content :deep(h1),
.contract-content :deep(h2),
.contract-content :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 700;
  line-height: 1.4;
}

.contract-content :deep(h1) { font-size: 1.8em; }
.contract-content :deep(h2) { font-size: 1.5em; }
.contract-content :deep(h3) { font-size: 1.2em; }

.contract-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5em;
  margin-bottom: 1.5em;
  border: 1px solid #ccc;
  font-size: 0.95em;
}

.contract-content :deep(th),
.contract-content :deep(td) {
  border: 1px solid #ccc;
  padding: 12px 15px;
  text-align: left;
}

.contract-content :deep(th) {
  background-color: #f5f5f5;
  font-weight: 600;
}

.contract-content :deep(tr:nth-child(even)) {
  background-color: #fafafa;
}
</style>