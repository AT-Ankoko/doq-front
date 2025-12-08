<template>
  <v-container
    class="pa-1"
    fluid
    style="height: 100vh; display: flex; box-sizing: border-box; overflow: hidden;"
  >
    <v-row
      class="h-100"
      style="flex: 1 1 auto; height: 100%; min-height: 0; margin: 0; gap: 12px; overflow: hidden; flex-wrap: nowrap;"
    >
      <!-- 왼쪽: 채팅 영역 -->
      <v-col
        cols="12"
        md="6"
        class="d-flex flex-column"
        style="min-height: 0; height: 100%; overflow: hidden;"
      >
        <v-card
          class="w-100 h-100 d-flex flex-column"
          rounded="xl"
          style="min-height: 0; overflow: hidden;"
        >
          <v-toolbar color="white" density="compact" class="px-4 border-b">
            <span class="font-weight-bold">채팅</span>
            <v-spacer></v-spacer>
            <v-chip size="small" :color="isConnected ? 'green' : 'red'" class="font-weight-bold">
              {{ isConnected ? '연결됨' : '연결 끊김' }}
            </v-chip>
          </v-toolbar>

          <!-- 채팅 내용 스크롤 영역 -->
          <v-card-text
            ref="chatArea"
            class="flex-grow-1 overflow-y-auto bg-grey-lighten-4"
            style="min-height: 0;"
          >
            <article
              v-for="(msg, index) in messages"
              :key="index"
              class="d-flex mb-4"
              :class="getMessageClass(msg)"
            >
              <v-avatar v-if="msg.role === 'llm'" color="teal" size="32" class="mr-2">
                AI
              </v-avatar>

              <div
                class="d-flex flex-column"
                :class="msg.role === currentRole ? 'align-end' : 'align-start'"
              >
                <span class="text-caption text-grey mb-1 px-1">{{ msg.role }}</span>

                <v-chip
                  :color="getBubbleColor(msg.role)"
                  class="px-4 py-2 h-auto"
                  style="white-space: pre-wrap; max-width: 300px;"
                  label
                >
                  {{ msg.text }}
                </v-chip>
              </div>
            </article>
          </v-card-text>

          <!-- 입력 영역(높이 고정) -->
          <v-card-actions class="pa-4 bg-white">
            <div class="d-flex flex-column w-100" style="gap: 8px;">
              <div class="d-flex align-center" style="gap: 8px;">
                <v-btn-toggle v-model="currentRole" mandatory density="compact" color="primary">
                  <v-btn value="갑">고예경 (갑)</v-btn>
                  <v-btn value="을">김영지 (을)</v-btn>
                </v-btn-toggle>
                <v-chip size="small" :color="isConnected ? 'green' : 'red'" class="font-weight-bold">
                  {{ isConnected ? '연결됨' : '연결 끊김' }}
                </v-chip>
              </div>
              <v-text-field
                v-model="inputText"
                placeholder="메시지를 입력하세요..."
                variant="outlined"
                hide-details
                density="compact"
                rounded="pill"
                @keyup.enter="sendMessage"
              >
                <template #append-inner>
                  <v-btn icon="mdi-send" color="primary" variant="text" @click="sendMessage"></v-btn>
                </template>
              </v-text-field>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 오른쪽: 계약서 초안 영역 -->
      <v-col
        cols="12"
        md="6"
        class="d-flex flex-column"
        style="min-height: 0; height: 100%; overflow: hidden;"
      >
        <v-card
          class="w-100 h-100 d-flex flex-column"
          rounded="xl"
          style="min-height: 0; overflow: hidden;"
        >
          <v-toolbar color="white" density="compact" class="px-4 border-b">
            <v-icon class="mr-2">mdi-file-document</v-icon>
            <span class="font-weight-bold">계약서 초안</span>

            <v-spacer></v-spacer>

            <v-chip size="small" :color="currentStep ? 'blue' : 'grey'">
              {{ getStepLabel(currentStep) }}
            </v-chip>
          </v-toolbar>

          <!-- 진행률바 -->
          <div class="px-4 pt-3 pb-2">
            <div class="d-flex align-center justify-between mb-2">
              <span class="text-caption font-weight-bold">진행률</span>
              <span class="text-caption text-grey">{{ progressPercentage }}%</span>
            </div>
            <v-progress-linear
              :value="progressPercentage"
              color="primary"
              height="8"
              rounded
            ></v-progress-linear>
          </div>

          <!-- Meta 정보 패널 -->
          <v-expand-transition>
            <div v-if="metaInfo && showMetaPanel" class="px-4 pb-2">
              <v-card variant="tonal" color="grey-lighten-3" class="pa-3" rounded="lg">
                <div class="d-flex align-center justify-between mb-2">
                  <span class="text-caption font-weight-bold">
                    <v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
                    AI 분석 정보
                  </span>
                  <v-btn icon="mdi-close" size="x-small" variant="text" @click="showMetaPanel = false"></v-btn>
                </div>
                
                <!-- step_advance 정보 -->
                <div v-if="metaInfo.step_advance" class="mb-2">
                  <div class="d-flex align-center mb-1">
                    <v-icon 
                      size="14" 
                      :color="metaInfo.step_advance.advance ? 'success' : 'warning'"
                      class="mr-1"
                    >
                      {{ metaInfo.step_advance.advance ? 'mdi-check-circle' : 'mdi-clock-outline' }}
                    </v-icon>
                    <span class="text-caption font-weight-medium">
                      {{ metaInfo.step_advance.advance ? '단계 진행됨' : '단계 대기 중' }}
                    </span>
                    <v-chip 
                      v-if="metaInfo.step_advance.source" 
                      size="x-small" 
                      class="ml-2"
                      color="blue-grey"
                      variant="flat"
                    >
                      {{ metaInfo.step_advance.source }}
                    </v-chip>
                  </div>
                  <p v-if="metaInfo.step_advance.reason" class="text-caption text-grey-darken-1 ma-0" style="line-height: 1.4;">
                    {{ metaInfo.step_advance.reason }}
                  </p>
                </div>

                <!-- question_answered 정보 -->
                <div v-if="metaInfo.question_answered !== undefined" class="d-flex align-center">
                  <v-icon 
                    size="14" 
                    :color="metaInfo.question_answered ? 'success' : 'grey'"
                    class="mr-1"
                  >
                    {{ metaInfo.question_answered ? 'mdi-check' : 'mdi-help-circle-outline' }}
                  </v-icon>
                  <span class="text-caption">
                    질문 응답: {{ metaInfo.question_answered ? '완료' : '미완료' }}
                  </span>
                </div>
              </v-card>
            </div>
          </v-expand-transition>

          <!-- Meta 패널 토글 버튼 (닫혀있을 때) -->
          <div v-if="metaInfo && !showMetaPanel" class="px-4 pb-2">
            <v-btn 
              size="x-small" 
              variant="text" 
              color="grey" 
              @click="showMetaPanel = true"
              class="text-caption"
            >
              <v-icon size="14" class="mr-1">mdi-information-outline</v-icon>
              AI 분석 정보 보기
            </v-btn>
          </div>

          <!-- 계약서 내용 스크롤 영역 -->
          <v-card-text
            class="flex-grow-1 overflow-y-auto pa-6"
            style="min-height: 0;"
          >
            <div
              v-if="contractDraft"
              class="contract-content"
              style="line-height: 1.6;"
            >
              <div v-html="renderedContract"></div>
            </div>
            <div v-else class="d-flex align-center justify-center h-100">
              <v-card-text class="text-center text-grey">
                <v-icon size="48" class="mb-2">mdi-file-document-outline</v-icon>
                <p class="mb-0">계약서 초안이 표시됩니다.</p>
                <p class="text-caption">메시지를 입력하면 실시간으로 업데이트됩니다.</p>
              </v-card-text>
            </div>
          </v-card-text>

          <v-card-actions class="pa-4 bg-white border-t">
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              @click="copyContractDraft"
              :disabled="!contractDraft"
            >
              <v-icon class="mr-2">mdi-content-copy</v-icon>
              복사
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              variant="outlined"
              size="small"
              @click="downloadContractDraft"
              :disabled="!contractDraft"
            >
              <v-icon class="mr-2">mdi-download</v-icon>
              다운로드
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';

const emit = defineEmits(['set-side-nav', 'set-top-nav']);

// ----- 상태 변수 ----- //
const socket = ref(null);
const isConnected = ref(false);
const messages = ref([]);
const inputText = ref('');
const chatArea = ref(null);
const currentRole = ref('갑');
const contractDraft = ref('');
const currentStep = ref('');
const sessionId = ref('');
const isLoading = ref(false);
const progressPercentage = ref(0);
const progressStatus = ref('대기 중...');
const metaInfo = ref(null);
const showMetaPanel = ref(true);

// markdown 렌더링 (경량 변환)
const escapeHtml = (str = '') =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const renderMarkdown = (md = '') => {
  let html = escapeHtml(md);
  // 헤더
  html = html.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#\s+(.+)$/gm, '<h2>$1</h2>');
  // 볼드/이탤릭
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // 리스트
  html = html.replace(/^(?:-\s+.+\n?)+/gm, (block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((li) => li.replace(/^-\s+/, ''));
    return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  });
  // 줄바꿈
  html = html.replace(/\n/g, '<br />');
  return html;
};

const renderedContract = computed(() => renderMarkdown(contractDraft.value));

const API_URL = 'http://localhost:9571/v1/session/connect';
const WS_BASE_URL = 'ws://localhost:9571/v1/session/chat';

// 단계별 라벨 매핑
const stepLabels = {
  introduction: '소개 및 초기 정보 수집',
  work_scope: '작업 범위/내용',
  work_period: '작업 기간',
  budget: '대금/지급 조건',
  revisions: '수정 정책',
  copyright: '저작권 귀속',
  confidentiality: '기밀 유지',
  conflict_resolution: '갈등 중재',
  finalization: '최종 확인',
  completed: '계약 완료'
};

// 역할별 사용자 정보 매핑
// '갑' = client(의뢰인), '을' = provider(용역자)
const userProfiles = {
  갑: {
    name: '고예경',
    role: 'client',
    contractDate: '2025-12-07'
  },
  을: {
    name: '김영지',
    role: 'provider',
    contractDate: '2025-12-07'
  }
};


// ----- 라이프 사이클 ----- //
onMounted(() => {
  initializeSession();
  emit('set-top-nav', false);
  emit('set-side-nav', true);
});

onUnmounted(() => {
  if (socket.value) socket.value.close();
});

// ----- 함수 정의 ----- //

/**
 * REST API를 통해 세션 생성
 * POST /v1/session/connect
 * 요청: userId, client_name, provider_name, contract_date
 * 응답: sid
 */
const initializeSession = async () => {
  isLoading.value = true;
  try {
    const payload = {
      userId: 'user123',
      client_name: userProfiles['갑'].name,
      provider_name: userProfiles['을'].name,
      contract_date: userProfiles['갑'].contractDate
    };

    console.log('세션 생성 요청:', payload);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    sessionId.value = data.sid;

    console.log('세션 ID 획득:', sessionId.value);

    // 세션 ID를 받은 후 WebSocket 연결
    connectWebSocket();
  } catch (error) {
    console.error('세션 생성 실패:', error);
    alert(`세션 생성 실패: ${error.message}`);
  } finally {
    isLoading.value = false;
  }
};

const connectWebSocket = () => {
  if (!sessionId.value) {
    console.error('sessionId가 없습니다');
    return;
  }

  const wsUrl = `${WS_BASE_URL}?sid=${sessionId.value}`;
  console.log('WebSocket 연결 시도:', wsUrl);

  socket.value = new WebSocket(wsUrl);

  socket.value.onopen = () => {
    console.log('WebSocket 연결 성공:', sessionId.value);
    isConnected.value = true;
  };

  socket.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('수신 메시지:', data);

      if (data.hd?.event === 'llm.response') {
        // 메시지 추가
        messages.value.push({
          role: 'llm',
          text: data.bd?.text || '응답 없음',
          timestamp: new Date()
        });

        // 계약서 초안 업데이트
        if (data.bd?.contract_draft) {
          contractDraft.value = data.bd.contract_draft;
        }

        // 현재 진행 단계 업데이트
        if (data.hd?.step) {
          currentStep.value = data.hd.step;
        }

        // 진행률 업데이트
        if (data.bd?.progress_percentage !== undefined) {
          progressPercentage.value = data.bd.progress_percentage;
          console.log('진행률 업데이트:', progressPercentage.value);
        }

        // meta 정보 업데이트
        if (data.bd?.meta) {
          metaInfo.value = data.bd.meta;
          console.log('메타 정보 업데이트:', metaInfo.value);
        }

        scrollToBottom();
      }
    } catch (e) {
      console.error('JSON 파싱 오류:', e);
    }
  };

  socket.value.onclose = () => {
    console.log('WebSocket 연결 종료');
    isConnected.value = false;
  };

  socket.value.onerror = (error) => {
    console.error('WebSocket 오류:', error);
    alert('WebSocket 연결 오류가 발생했습니다');
  };
};

const sendMessage = () => {
  if (!inputText.value.trim() || !isConnected.value) {
    console.warn('메시지 전송 조건 불만족:', {
      inputText: inputText.value.trim(),
      isConnected: isConnected.value
    });
    return;
  }

  // 현재 선택된 역할(currentRole)에 맞는 프로필 가져오기
  const currentUser = userProfiles[currentRole.value];

  if (!currentUser) {
    console.error('사용자 프로필을 찾을 수 없습니다:', currentRole.value);
    return;
  }

  // 화면 표시용 메시지 추가
  messages.value.push({
    role: currentUser.name,
    text: inputText.value,
    timestamp: new Date()
  });

  // Payload 구성
  const payload = {
    hd: {
      sid: sessionId.value,
      event: 'llm.invoke',
      role: currentUser.role, // "client" or "provider"
      user_name: currentUser.name // "고예경" or "김영지"
    },
    bd: {
      text: inputText.value
    }
  };

  console.log('메시지 전송:', payload);
  try {
    socket.value.send(JSON.stringify(payload));
    inputText.value = '';
    scrollToBottom();
  } catch (error) {
    console.error('메시지 전송 실패:', error);
    alert('메시지 전송에 실패했습니다. WebSocket 연결을 확인하세요.');
  }
};

const getMessageClass = (msg) => {
  const currentUserName = userProfiles[currentRole.value]?.name;
  return msg.role === currentUserName || msg.role === currentRole.value
    ? 'justify-end'
    : 'justify-start';
};

const getBubbleColor = (role) => {
  if (role === 'llm') return 'grey-lighten-3';
  const currentUserName = userProfiles[currentRole.value]?.name;
  if (role === currentUserName || role === currentRole.value) return 'primary';
  return 'secondary';
};

const getStepLabel = (step) => {
  return stepLabels[step] || '대기 중...';
};

const copyContractDraft = () => {
  if (contractDraft.value) {
    navigator.clipboard
      .writeText(contractDraft.value)
      .then(() => {
        alert('계약서 초안이 클립보드에 복사되었습니다.');
      })
      .catch(() => {
        alert('복사 실패. 다시 시도해주세요.');
      });
  }
};

const downloadContractDraft = () => {
  if (contractDraft.value) {
    const element = document.createElement('a');
    const file = new Blob([contractDraft.value], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `contract_${sessionId.value}_${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatArea.value) {
      const el = chatArea.value.$el ?? chatArea.value;
      el.scrollTop = el.scrollHeight;
    }
  });
};
</script>
