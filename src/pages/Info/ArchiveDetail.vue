<template>
  <v-container class="pa-6" fluid>
    <!-- 헤더 -->
    <div class="d-flex align-center mb-6">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="mr-2"></v-btn>
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">세션 상세 정보</h1>
        <p class="text-body-2 text-grey ma-0">{{ sessionId }}</p>
      </div>
      <v-spacer></v-spacer>
      <v-btn 
        color="primary" 
        variant="outlined" 
        @click="fetchSessionDetail"
        :loading="isLoading"
        size="small"
      >
        <v-icon class="mr-1" size="18">mdi-refresh</v-icon>
        새로고침
      </v-btn>
    </div>

    <!-- 로딩 상태 -->
    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4"></v-progress-linear>

    <!-- 에러 메시지 -->
    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <v-row v-if="sessionData" class="h-100" style="min-height: calc(100vh - 200px);">
      <!-- 왼쪽: 세션 정보 + 채팅 내역 -->
      <v-col cols="12" md="6" class="d-flex flex-column" style="height: 100%;">
        <!-- 세션 상태 카드 -->
        <v-card rounded="xl" class="mb-4">
          <v-toolbar color="white" density="compact" class="px-4 border-b">
            <v-icon class="mr-2" size="20">mdi-information-outline</v-icon>
            <span class="font-weight-bold">세션 정보</span>
            <v-spacer></v-spacer>
            <v-chip size="small" :color="getStepColor(sessionData.state?.current_step)">
              {{ getStepLabel(sessionData.state?.current_step) }}
            </v-chip>
          </v-toolbar>

          <v-card-text class="pa-4">
            <!-- 진행률 -->
            <div class="mb-4">
              <div class="d-flex align-center justify-between mb-2">
                <span class="text-caption font-weight-bold">진행률</span>
                <span class="text-caption text-grey">{{ sessionData.state?.progress_percentage || 0 }}%</span>
              </div>
              <v-progress-linear
                :model-value="sessionData.state?.progress_percentage || 0"
                color="primary"
                height="8"
                rounded
              ></v-progress-linear>
            </div>

            <!-- 기본 정보 그리드 -->
            <v-row dense>
              <v-col cols="6">
                <div class="info-item">
                  <span class="text-caption text-grey">사용자</span>
                  <p class="font-weight-medium ma-0">{{ sessionData.state?.user_info?.user_name || '-' }}</p>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-item">
                  <span class="text-caption text-grey">역할</span>
                  <v-chip size="x-small" :color="sessionData.state?.user_info?.role === 'client' ? 'blue' : 'orange'" variant="flat">
                    {{ sessionData.state?.user_info?.role === 'client' ? '의뢰인(갑)' : '용역자(을)' }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-item">
                  <span class="text-caption text-grey">생성일</span>
                  <p class="text-body-2 ma-0">{{ formatDate(sessionData.state?.created_at) }}</p>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="info-item">
                  <span class="text-caption text-grey">수정일</span>
                  <p class="text-body-2 ma-0">{{ formatDate(sessionData.state?.updated_at) }}</p>
                </div>
              </v-col>
            </v-row>

            <!-- 단계 히스토리 -->
            <div class="mt-4" v-if="sessionData.state?.step_history?.length > 0">
              <span class="text-caption text-grey d-block mb-2">진행 단계</span>
              <div class="d-flex flex-wrap" style="gap: 6px;">
                <v-chip 
                  v-for="(step, index) in sessionData.state.step_history" 
                  :key="index"
                  size="x-small"
                  :color="getStepColor(step)"
                  variant="flat"
                >
                  {{ getStepLabel(step) }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 채팅 내역 카드 -->
        <v-card rounded="xl" class="flex-grow-1 d-flex flex-column" style="min-height: 400px; max-height: 600px;">
          <v-toolbar color="white" density="compact" class="px-4 border-b">
            <v-icon class="mr-2" size="20">mdi-chat-outline</v-icon>
            <span class="font-weight-bold">채팅 내역</span>
            <v-spacer></v-spacer>
            <v-chip size="x-small" color="grey" variant="flat">
              {{ sessionData.chat_history?.length || 0 }}개 메시지
            </v-chip>
          </v-toolbar>

          <v-card-text class="flex-grow-1 overflow-y-auto pa-4 bg-grey-lighten-4" style="min-height: 0;">
            <div v-if="sessionData.chat_history?.length > 0">
              <article
                v-for="(chat, index) in sessionData.chat_history"
                :key="chat.id || index"
                class="d-flex mb-4"
                :class="getChatAlignment(chat.participant)"
              >
                <!-- AI 아바타 -->
                <v-avatar 
                  v-if="chat.participant === 'assistant'" 
                  color="teal" 
                  size="32" 
                  class="mr-2"
                >
                  <span class="text-caption font-weight-bold">AI</span>
                </v-avatar>

                <div
                  class="d-flex flex-column"
                  :class="chat.participant !== 'assistant' ? 'align-end' : 'align-start'"
                  style="max-width: 80%;"
                >
                  <!-- 발신자 정보 -->
                  <div class="d-flex align-center mb-1" style="gap: 6px;">
                    <v-chip 
                      size="x-small" 
                      :color="getParticipantColor(chat.participant)"
                      variant="flat"
                    >
                      {{ getParticipantLabel(chat) }}
                    </v-chip>
                    <span class="text-caption text-grey">
                      {{ chat.message?.hd?.step ? getStepLabel(chat.message.hd.step) : '' }}
                    </span>
                  </div>

                  <!-- 메시지 버블 -->
                  <v-card
                    :color="getBubbleColor(chat.participant)"
                    class="pa-3"
                    rounded="lg"
                    flat
                  >
                    <p class="text-body-2 ma-0" style="white-space: pre-wrap; line-height: 1.6;">
                      {{ getChatText(chat) }}
                    </p>
                  </v-card>
                </div>
              </article>
            </div>
            <div v-else class="d-flex align-center justify-center h-100">
              <div class="text-center text-grey">
                <v-icon size="48" class="mb-2">mdi-chat-remove-outline</v-icon>
                <p class="mb-0">채팅 내역이 없습니다.</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 오른쪽: 수집된 데이터 + 역할별 입력 -->
      <v-col cols="12" md="6" class="d-flex flex-column" style="height: 100%;">
        <!-- 수집된 데이터 카드 -->
        <v-card rounded="xl" class="mb-4">
          <v-toolbar color="white" density="compact" class="px-4 border-b">
            <v-icon class="mr-2" size="20">mdi-database-outline</v-icon>
            <span class="font-weight-bold">수집된 계약 데이터</span>
          </v-toolbar>

          <v-card-text class="pa-4">
            <v-row dense v-if="sessionData.state?.collected_data">
              <v-col 
                cols="6" 
                v-for="(value, key) in filteredCollectedData" 
                :key="key"
              >
                <div class="info-item">
                  <span class="text-caption text-grey">{{ getDataLabel(key) }}</span>
                  <p class="text-body-2 ma-0" :class="value ? '' : 'text-grey-lighten-1'">
                    {{ formatDataValue(value) }}
                  </p>
                </div>
              </v-col>
            </v-row>
            <div v-else class="text-center text-grey pa-4">
              수집된 데이터가 없습니다.
            </div>
          </v-card-text>
        </v-card>

        <!-- 역할별 입력 내역 -->
        <v-card rounded="xl" class="flex-grow-1 d-flex flex-column" style="min-height: 300px; max-height: 500px;">
          <v-toolbar color="white" density="compact" class="px-4 border-b">
            <v-icon class="mr-2" size="20">mdi-account-group-outline</v-icon>
            <span class="font-weight-bold">역할별 입력 내역</span>
          </v-toolbar>

          <v-card-text class="pa-0 flex-grow-1 overflow-hidden" style="min-height: 0;">
            <v-tabs v-model="roleTab" bg-color="grey-lighten-4" density="compact">
              <v-tab value="client">
                <v-icon size="16" class="mr-1">mdi-account</v-icon>
                의뢰인(갑)
                <v-chip size="x-small" class="ml-2" color="blue" variant="flat">
                  {{ sessionData.state?.role_inputs?.client?.length || 0 }}
                </v-chip>
              </v-tab>
              <v-tab value="provider">
                <v-icon size="16" class="mr-1">mdi-account-tie</v-icon>
                용역자(을)
                <v-chip size="x-small" class="ml-2" color="orange" variant="flat">
                  {{ sessionData.state?.role_inputs?.provider?.length || 0 }}
                </v-chip>
              </v-tab>
            </v-tabs>

            <v-tabs-window v-model="roleTab" class="h-100">
              <v-tabs-window-item value="client" class="h-100 overflow-y-auto pa-3">
                <div v-if="sessionData.state?.role_inputs?.client?.length > 0">
                  <div 
                    v-for="(input, index) in sessionData.state.role_inputs.client" 
                    :key="index"
                    class="mb-3 pa-3 bg-blue-lighten-5 rounded-lg"
                  >
                    <div class="d-flex align-center justify-between mb-1">
                      <v-chip size="x-small" :color="getStepColor(input.step)" variant="flat">
                        {{ getStepLabel(input.step) }}
                      </v-chip>
                      <span class="text-caption text-grey">{{ formatDate(input.timestamp) }}</span>
                    </div>
                    <p class="text-body-2 ma-0" style="line-height: 1.5;">{{ input.text }}</p>
                  </div>
                </div>
                <div v-else class="text-center text-grey pa-4">
                  입력 내역이 없습니다.
                </div>
              </v-tabs-window-item>

              <v-tabs-window-item value="provider" class="h-100 overflow-y-auto pa-3">
                <div v-if="sessionData.state?.role_inputs?.provider?.length > 0">
                  <div 
                    v-for="(input, index) in sessionData.state.role_inputs.provider" 
                    :key="index"
                    class="mb-3 pa-3 bg-orange-lighten-5 rounded-lg"
                  >
                    <div class="d-flex align-center justify-between mb-1">
                      <v-chip size="x-small" :color="getStepColor(input.step)" variant="flat">
                        {{ getStepLabel(input.step) }}
                      </v-chip>
                      <span class="text-caption text-grey">{{ formatDate(input.timestamp) }}</span>
                    </div>
                    <p class="text-body-2 ma-0" style="line-height: 1.5;">{{ input.text }}</p>
                  </div>
                </div>
                <div v-else class="text-center text-grey pa-4">
                  입력 내역이 없습니다.
                </div>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>

        <!-- 계약서 초안 보기 버튼 -->
        <v-btn
          v-if="lastContractDraft"
          color="primary"
          variant="flat"
          block
          class="mt-4"
          rounded="lg"
          @click="showContractDialog = true"
        >
          <v-icon class="mr-2">mdi-file-document-outline</v-icon>
          계약서 초안 보기
        </v-btn>
      </v-col>
    </v-row>

    <!-- 데이터 없음 -->
    <div v-if="!isLoading && !sessionData" class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-file-document-remove-outline</v-icon>
      <p class="text-h6 text-grey mb-2">세션 정보를 찾을 수 없습니다</p>
      <v-btn color="primary" variant="outlined" @click="goBack">목록으로 돌아가기</v-btn>
    </div>

    <!-- 계약서 초안 다이얼로그 -->
    <v-dialog v-model="showContractDialog" max-width="800" scrollable>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon class="mr-2">mdi-file-document</v-icon>
          계약서 초안
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showContractDialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6" style="max-height: 70vh; overflow-y: auto;">
          <div class="contract-content" v-html="renderedContractDraft"></div>
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
import { onMounted, ref, computed, defineEmits } from "vue";
import { useRouter, useRoute } from "vue-router";

const emit = defineEmits(['set-side-nav', 'set-top-nav']);
const router = useRouter();
const route = useRoute();

// ----- 상태 변수 ----- //
const isLoading = ref(false);
const errorMessage = ref('');
const sessionData = ref(null);
const sessionId = ref('');
const roleTab = ref('client');
const showContractDialog = ref(false);

const API_BASE_URL = 'http://localhost:9571';

// 단계별 라벨 매핑
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

// 데이터 필드 라벨 매핑
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

// ----- 라이프 사이클 ----- //
onMounted(() => {
  emit('set-side-nav', false);
  emit('set-top-nav', true);
  
  sessionId.value = route.params.sid;
  if (sessionId.value) {
    fetchSessionDetail();
  } else {
    errorMessage.value = '세션 ID가 없습니다.';
  }
});

// ----- Computed ----- //

// 수집된 데이터 필터링 (null이 아닌 값만)
const filteredCollectedData = computed(() => {
  const data = sessionData.value?.state?.collected_data;
  if (!data) return {};
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== null)
  );
});

// 마지막 계약서 초안 추출
const lastContractDraft = computed(() => {
  const history = sessionData.value?.chat_history;
  if (!history || history.length === 0) return null;
  
  // 채팅 내역을 역순으로 순회하며 contract_draft가 있는 메시지 찾기
  for (let i = history.length - 1; i >= 0; i--) {
    const draft = history[i]?.message?.bd?.contract_draft;
    if (draft) return draft;
  }
  return null;
});

// Markdown 렌더링
const renderedContractDraft = computed(() => {
  return renderMarkdown(lastContractDraft.value || '');
});

// ----- 함수 정의 ----- //

// 세션 상세 조회
const fetchSessionDetail = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await fetch(`${API_BASE_URL}/v1/archive/session/${sessionId.value}`);
    const result = await response.json();
    
    if (result.state?.code === 'S0000' || result.state === 'SUCCESS') {
      sessionData.value = result.data;
    } else {
      errorMessage.value = result.state?.msg || result.detail || '세션 정보를 불러오는데 실패했습니다.';
    }
  } catch (error) {
    console.error('세션 상세 조회 실패:', error);
    errorMessage.value = `서버 연결 실패: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

// 뒤로가기
const goBack = () => {
  router.push('/archive');
};

// 단계 라벨 반환
const getStepLabel = (step) => {
  return stepLabels[step] || step || '-';
};

// 단계별 색상 반환
const getStepColor = (step) => {
  const colors = {
    introduction: 'blue-grey',
    work_scope: 'blue',
    work_period: 'indigo',
    budget: 'purple',
    revisions: 'pink',
    copyright: 'orange',
    confidentiality: 'amber',
    conflict_resolution: 'red',
    finalization: 'teal',
    completed: 'green'
  };
  return colors[step] || 'grey';
};

// 참여자 색상
const getParticipantColor = (participant) => {
  if (participant === 'assistant') return 'teal';
  if (participant === 'client') return 'blue';
  if (participant === 'provider') return 'orange';
  return 'grey';
};

// 참여자 라벨
const getParticipantLabel = (chat) => {
  if (chat.participant === 'assistant') return 'AI';
  if (chat.participant === 'client') {
    return chat.message?.hd?.user_name || '의뢰인';
  }
  if (chat.participant === 'provider') {
    return chat.message?.hd?.user_name || '용역자';
  }
  return chat.participant;
};

// 채팅 정렬
const getChatAlignment = (participant) => {
  if (participant === 'assistant') return 'justify-start';
  return 'justify-end';
};

// 버블 색상
const getBubbleColor = (participant) => {
  if (participant === 'assistant') return 'grey-lighten-3';
  if (participant === 'client') return 'blue-lighten-4';
  if (participant === 'provider') return 'orange-lighten-4';
  return 'grey-lighten-2';
};

// 채팅 텍스트 추출
const getChatText = (chat) => {
  return chat.message?.bd?.text || JSON.stringify(chat.message?.bd || chat.message);
};

// 데이터 라벨
const getDataLabel = (key) => {
  return dataLabels[key] || key;
};

// 데이터 값 포맷팅
const formatDataValue = (value) => {
  if (value === null || value === undefined) return '미입력';
  if (typeof value === 'boolean') return value ? '확인됨' : '미확인';
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...';
  }
  return value;
};

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

// Markdown 렌더링 (경량)
const escapeHtml = (str = '') =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const renderMarkdown = (md = '') => {
  let html = escapeHtml(md);
  // 헤더
  html = html.replace(/^###\s+(.+)$/gm, '<h4 class="text-subtitle-1 font-weight-bold mt-4 mb-2">$1</h4>');
  html = html.replace(/^##\s+(.+)$/gm, '<h3 class="text-h6 font-weight-bold mt-4 mb-2">$1</h3>');
  html = html.replace(/^#\s+(.+)$/gm, '<h2 class="text-h5 font-weight-bold mt-4 mb-2">$1</h2>');
  // 볼드/이탤릭
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // 리스트
  html = html.replace(/^(?:-\s+.+\n?)+/gm, (block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((li) => li.replace(/^-\s+/, ''));
    return `<ul class="ml-4 mb-2">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  });
  // 번호 리스트
  html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="ml-4 mb-1"><strong>$1.</strong> $2</div>');
  // 테이블 (간단 처리)
  html = html.replace(/\|(.+)\|/g, '<div class="table-row">$1</div>');
  // 수평선
  html = html.replace(/^\*\*\*$/gm, '<hr class="my-4" />');
  // 줄바꿈
  html = html.replace(/\n/g, '<br />');
  return html;
};

// 계약서 복사
const copyContractDraft = () => {
  if (lastContractDraft.value) {
    navigator.clipboard
      .writeText(lastContractDraft.value)
      .then(() => {
        alert('계약서 초안이 클립보드에 복사되었습니다.');
      })
      .catch(() => {
        alert('복사 실패. 다시 시도해주세요.');
      });
  }
};
</script>

<style scoped>
.info-item {
  padding: 8px 0;
}

.contract-content {
  font-size: 14px;
  line-height: 1.8;
}

.contract-content h2,
.contract-content h3,
.contract-content h4 {
  margin-top: 16px;
  margin-bottom: 8px;
}

.contract-content ul {
  padding-left: 20px;
}

.contract-content li {
  margin-bottom: 4px;
}

.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
