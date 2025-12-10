<template>
  <v-container class="pa-6">
    <div class="mb-6">
      <div class="d-flex align-center mb-4">
        <h1 class="text-h4 font-weight-bold mr-3">세션 아카이브</h1>
        <v-btn
          icon="mdi-refresh"
          color="primary"
          variant="flat"
          size="x-small"
          rounded="lg"
          @click="fetchSessions"
          :loading="isLoading"
        ></v-btn>
      </div>
      <p class="text-body-2 text-grey">저장된 계약 세션 목록을 확인하세요.</p>
    </div>

    <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mb-4"></v-progress-linear>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <v-card rounded="xl" elevation="0" border>
      <v-card-text class="pa-0">
        <v-data-table
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          :headers="tableHeaders"
          :items="sessions"
          :loading="isLoading"
          hover
          must-sort
          class="session-table"
          item-value="sid"
          hide-default-footer
        >
          <template #item.title="{ item }">
            <div class="d-flex flex-column py-2">
              <span 
                class="font-weight-medium text-primary cursor-pointer text-decoration-underline" 
                @click="viewSession(item.sid)"
              >
                {{ getSessionTitle(item) }}
              </span>
              <span class="text-caption text-grey">{{ truncateSid(item.sid) }}</span>
            </div>
          </template>

          <template #item.user_name="{ item }">
            <v-chip size="small" color="blue-grey-darken-1" variant="flat" label class="font-weight-medium">
              {{ item.user_name || '미지정' }}
            </v-chip>
          </template>

          <template #item.current_step="{ item }">
            <v-chip 
              size="small" 
              color="grey-darken-3"
              variant="flat"
              label
            >
              {{ getStepLabel(item.current_step) }}
            </v-chip>
          </template>

          <template #item.progress="{ item }">
            <div class="d-flex align-center" style="min-width: 120px;">
              <v-progress-linear
                :model-value="item.progress || 0"
                color="primary"
                height="6"
                rounded
                class="mr-3"
              ></v-progress-linear>
              <span class="text-caption font-weight-bold text-grey-darken-1">{{ item.progress || 0 }}%</span>
            </div>
          </template>

          <template #item.updated_at="{ item }">
            <span class="text-caption text-grey-darken-1">{{ formatDate(item.updated_at) }}</span>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              variant="outlined"
              color="grey-lighten-1"
              size="small"
              class="text-grey-darken-1"
              rounded="pill"
              @click="viewSession(item.sid)"
              style="border-color: #E0E0E0;"
            >
              <v-icon start size="small" class="mr-1">mdi-eye-outline</v-icon>
              상세보기
            </v-btn>
          </template>

          <template #no-data>
            <div class="text-center pa-10">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-archive-off-outline</v-icon>
              <p class="text-h6 text-grey mb-2">저장된 세션이 없습니다</p>
              <p class="text-body-2 text-grey-lighten-1">새로운 계약 세션을 시작해보세요.</p>
            </div>
          </template>

          <template #bottom>
            <div class="d-flex align-center justify-space-between pa-4 border-t">
              <div class="d-flex align-center">
                <span class="text-caption text-grey mr-3">Items per page:</span>
                <v-text-field
                  v-model.number="itemsPerPage"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  min="1"
                  style="width: 80px;"
                  class="compact-select text-caption"
                ></v-text-field>
              </div>

              <div class="d-flex align-center">
                <span class="text-caption text-grey mr-4">
                  {{ pageStart }}-{{ pageEnd }} of {{ sessions.length }}
                </span>
                <div class="d-flex">
                  <v-btn 
                    icon="mdi-chevron-left" 
                    variant="text" 
                    density="comfortable"
                    color="grey"
                    :disabled="page === 1"
                    @click="page--"
                  ></v-btn>
                  <v-btn 
                    icon="mdi-chevron-right" 
                    variant="text" 
                    density="comfortable"
                    color="grey"
                    :disabled="page >= pageCount"
                    @click="page++"
                  ></v-btn>
                </div>
              </div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useRouter } from "vue-router";

const emit = defineEmits(['set-side-nav', 'set-top-nav']);
const router = useRouter();

// ----- 상태 변수 ----- //
const isLoading = ref(false);
const errorMessage = ref('');
const sessions = ref([]);
const page = ref(1);
const itemsPerPage = ref(10); // 기본값 10

const API_BASE_URL = 'http://localhost:9571';

const tableHeaders = [
  { title: '제목', key: 'title', sortable: true, width: '25%' },
  { title: '사용자', key: 'user_name', sortable: true, width: '10%' },
  { title: '현재 단계', key: 'current_step', sortable: true, width: '15%' },
  { title: '진행률', key: 'progress', sortable: true, width: '20%' },
  { title: '수정일시', key: 'updated_at', sortable: true, width: '15%' },
  { title: '', key: 'actions', sortable: false, align: 'end', width: '15%' }
];

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

// ----- Computed (페이지네이션 계산) ----- //
const pageCount = computed(() => Math.ceil(sessions.value.length / itemsPerPage.value));
const pageStart = computed(() => (page.value - 1) * itemsPerPage.value + 1);
const pageEnd = computed(() => Math.min(page.value * itemsPerPage.value, sessions.value.length));

// ----- 라이프 사이클 ----- //
onMounted(() => {
  emit('set-side-nav', false);
  emit('set-top-nav', true);
  fetchSessions();
});

// ----- 함수 정의 ----- //
const fetchSessions = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await fetch(`${API_BASE_URL}/v1/archive/sessions`);
    const result = await response.json();
    if (result.state?.code === 'S0000' || result.state === 'SUCCESS') {
      sessions.value = result.data || [];
    } else {
      errorMessage.value = result.state?.msg || result.detail || '실패했습니다.';
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = `서버 연결 실패: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

const viewSession = (sid) => {
  router.push(`/archive/${sid}`);
};

const getStepLabel = (step) => stepLabels[step] || step || '대기 중';

const getSessionTitle = (item) => {
  if (item.category && item.category !== '{{category}}') {
    return item.category.includes('용역') ? item.category : `${item.category} 용역`;
  }
  if (item.work_scope && item.work_scope !== '{{category}}') {
    return item.work_scope;
  }
  const userName = item.user_name || '익명';
  return `${userName}님의 계약서`;
};

const truncateSid = (sid) => {
  if (!sid) return '-';
  if (sid.length <= 12) return sid;
  return sid.substring(0, 12) + '...';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return dateString; }
};
</script>

<style scoped>
.session-table {
  background-color: transparent;
}

/* 테이블 헤더 스타일 조정 */
:deep(.v-data-table-header__content) {
  font-weight: bold;
  color: #424242;
  font-size: 0.875rem;
}

/* 정렬 아이콘 크기 조정 */
:deep(.v-data-table-header__sort .v-icon) {
  font-size: 1rem !important;
}

/* 셀렉트 박스 스타일 강제 조정 (작게 만들기) */
:deep(.compact-select .v-field__input) {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  min-height: 32px !important;
  font-size: 0.8rem;
}
:deep(.compact-select .v-field__append-inner) {
  padding-top: 4px !important;
}
:deep(.compact-select .v-field__outline) {
  --v-field-border-opacity: 0.2;
}
</style>