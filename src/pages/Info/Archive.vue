<template>
  <v-container class="pa-6">
    <!-- 헤더 -->
    <div class="d-flex align-center justify-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">세션 아카이브</h1>
        <p class="text-body-2 text-grey">저장된 계약 세션 목록을 확인하세요.</p>
      </div>
      <v-btn 
        color="primary" 
        variant="outlined" 
        @click="fetchSessions"
        :loading="isLoading"
      >
        <v-icon class="mr-2">mdi-refresh</v-icon>
        새로고침
      </v-btn>
    </div>

    <!-- 로딩 상태 -->
    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4"></v-progress-linear>

    <!-- 에러 메시지 -->
    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <!-- 세션 목록 테이블 -->
    <v-card rounded="xl">
      <v-card-text class="pa-0">
        <v-data-table
          :headers="tableHeaders"
          :items="sessions"
          :loading="isLoading"
          hover
          class="session-table"
          item-value="sid"
          :items-per-page="10"
        >
          <!-- 제목 -->
          <template #item.title="{ item }">
            <div class="d-flex flex-column">
              <span 
                class="font-weight-medium text-primary cursor-pointer" 
                style="text-decoration: underline; text-underline-offset: 2px;"
                @click="viewSession(item.sid)"
              >
                {{ getSessionTitle(item) }}
              </span>
              <span class="text-caption text-grey">{{ truncateSid(item.sid) }}</span>
            </div>
          </template>

          <!-- 사용자 이름 -->
          <template #item.user_name="{ item }">
            <v-chip size="small" color="blue-grey" variant="flat">
              {{ item.user_name || '미지정' }}
            </v-chip>
          </template>

          <!-- 현재 단계 -->
          <template #item.current_step="{ item }">
            <v-chip 
              size="small" 
              :color="getStepColor(item.current_step)"
              variant="flat"
            >
              {{ getStepLabel(item.current_step) }}
            </v-chip>
          </template>

          <!-- 진행률 -->
          <template #item.progress="{ item }">
            <div class="d-flex align-center" style="min-width: 120px;">
              <v-progress-linear
                :model-value="item.progress || 0"
                color="primary"
                height="6"
                rounded
                class="mr-2"
              ></v-progress-linear>
              <span class="text-caption">{{ item.progress || 0 }}%</span>
            </div>
          </template>

          <!-- 수정일시 -->
          <template #item.updated_at="{ item }">
            <span class="text-caption text-grey">{{ formatDate(item.updated_at) }}</span>
          </template>

          <!-- 액션 -->
          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="primary"
              @click="viewSession(item.sid)"
            ></v-btn>
          </template>

          <!-- 빈 상태 -->
          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-archive-off-outline</v-icon>
              <p class="text-h6 text-grey mb-2">저장된 세션이 없습니다</p>
              <p class="text-body-2 text-grey-lighten-1">새로운 계약 세션을 시작해보세요.</p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
// ----- 선언부 (Imports, Props, Emits, Router) ----- //
import { onMounted, onUnmounted, ref, defineEmits } from "vue";
import { useRouter, useRoute } from "vue-router";

const emit = defineEmits(['set-side-nav', 'set-top-nav']);
const router = useRouter();
const route = useRoute();

// ----- 상태 변수 (State & Refs) ----- //
const isLoading = ref(false);
const errorMessage = ref('');
const sessions = ref([]);

const API_BASE_URL = 'http://localhost:9571';

// 테이블 헤더
const tableHeaders = [
  { title: '제목', key: 'title', sortable: true },
  { title: '사용자', key: 'user_name', sortable: true },
  { title: '현재 단계', key: 'current_step', sortable: true },
  { title: '진행률', key: 'progress', sortable: true },
  { title: '수정일시', key: 'updated_at', sortable: true },
  { title: '', key: 'actions', sortable: false, width: '60px' }
];

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

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
onMounted(() => {
  emit('set-side-nav', false);
  emit('set-top-nav', true);
  fetchSessions();
});

onUnmounted(() => {});

// ----- 함수 정의 (Methods) ----- //

// 세션 목록 조회
const fetchSessions = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await fetch(`${API_BASE_URL}/v1/archive/sessions`);
    const result = await response.json();
    
    // state가 객체인 경우 (code로 성공 여부 확인)
    if (result.state?.code === 'S0000' || result.state === 'SUCCESS') {
      sessions.value = result.data || [];
    } else {
      errorMessage.value = result.state?.msg || result.detail || '세션 목록을 불러오는데 실패했습니다.';
    }
  } catch (error) {
    console.error('세션 목록 조회 실패:', error);
    errorMessage.value = `서버 연결 실패: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

// 세션 상세 페이지로 이동
const viewSession = (sid) => {
  router.push(`/archive/${sid}`);
};

// 단계 라벨 반환
const getStepLabel = (step) => {
  return stepLabels[step] || step || '대기 중';
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

// 세션 제목 생성
const getSessionTitle = (item) => {
  // 사용자 이름 + 계약 상태 조합
  const userName = item.user_name || '익명';
  const step = getStepLabel(item.current_step);
  return `${userName}님의 계약서`;
};

// 세션 ID 축약
const truncateSid = (sid) => {
  if (!sid) return '-';
  if (sid.length <= 12) return sid;
  return sid.substring(0, 12) + '...';
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
</script> 

<style scoped>
.session-table {
  border-radius: 16px;
}

.gap-4 {
  gap: 16px;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
}
</style>