<template>
  <v-container
    class="pa-4"
    fluid
    style="height: 100vh; display: flex; box-sizing: border-box; overflow: hidden; background-color: #F4F4F4;"
  >
    <v-row
      tag="main"
      class="h-100"
      style="
        flex: 1 1 auto;
        height: 100%;
        min-height: 0;
        margin: 0;
        overflow: hidden;
        flex-wrap: nowrap;
      "
    >
      <v-col
        cols="12"
        md="6"
        class="d-flex flex-column pa-0"
        style="min-height: 0; height: 100%; overflow: hidden"
      >
        <section
          aria-label="AI 채팅 인터페이스"
          class="d-flex flex-column w-100 h-100 bg-white rounded-xl"
          style="overflow: hidden"
        >
          <header
            class="px-6 py-4 bg-white d-flex align-center flex-shrink-0"
          >
            <v-btn-toggle
              v-model="currentRole"
              mandatory
              density="compact"
              class="rounded-pill bg-grey-lighten-4"
            >
              <v-btn
                value="갑"
                class="px-4 font-weight-bold"
                size="small"
                variant="text"
                selected-class="bg-primary text-white"
                >고예경 (갑)</v-btn
              >
              <v-btn
                value="을"
                class="px-4 font-weight-bold"
                size="small"
                variant="text"
                selected-class="bg-primary text-white"
                >김영지 (을)</v-btn
              >
            </v-btn-toggle>

            <v-spacer></v-spacer>

            <v-chip
              size="small"
              :color="isConnected ? 'grey-lighten-2' : 'red-lighten-4'"
              :text-color="isConnected ? 'grey-darken-3' : 'red'"
              variant="flat"
              class="font-weight-bold"
            >
              <v-icon
                start
                size="small"
                :color="isConnected ? 'green' : 'red'"
                >mdi-circle-medium</v-icon
              >
              {{ isConnected ? '연결됨' : '연결 끊김' }}
            </v-chip>
          </header>

          <div
            ref="chatArea"
            role="log"
            aria-live="polite"
            class="flex-grow-1 overflow-y-auto bg-white px-6 py-4"
            style="min-height: 0"
          >
            <div
              v-if="messages.length === 0"
              class="d-flex justify-center mt-10"
            >
              <span class="text-grey-lighten-1 text-caption"
                >대화를 시작해보세요.</span
              >
            </div>

            <template v-for="(msg, index) in messages" :key="index">
              <article
                v-if="msg.role === 'llm'"
                class="d-flex flex-column align-start mb-6"
              >
                <div class="d-flex align-center mb-1">
                  <span
                    class="font-weight-bold text-caption text-grey-darken-2 pl-1"
                    >AI DoQ</span
                  >
                </div>
                <div
                  class="pa-4 rounded-lg rounded-tl-0 text-body-2 text-grey-darken-3"
                  style="
                    max-width: 85%;
                    white-space: pre-wrap;
                    line-height: 1.6;
                    background-color: #e8e8e8;
                  "
                >
                  {{ msg.text }}
                </div>
              </article>

              <article
                v-else-if="msg.role === userProfiles[currentRole].name"
                class="d-flex flex-column align-end mb-4"
              >
                <div
                  class="pa-3 px-4 bg-primary rounded-lg rounded-tr-0 text-white text-body-2"
                  style="
                    max-width: 80%;
                    white-space: pre-wrap;
                    line-height: 1.6;
                  "
                >
                  {{ msg.text }}
                </div>
              </article>

              <article
                v-else
                class="d-flex flex-column align-start mb-4"
              >
                <div class="d-flex align-center mb-1">
                  <span
                    class="font-weight-bold text-caption text-primary pl-1"
                  >
                    {{ msg.role }}
                  </span>
                </div>
                <div
                  class="pa-3 px-4 rounded-lg rounded-tl-0 text-grey-darken-3 text-body-2"
                  style="
                    max-width: 85%;
                    white-space: pre-wrap;
                    line-height: 1.6;
                    background-color: #e3f2fd; /* 아주 연한 하늘색 */
                  "
                >
                  {{ msg.text }}
                </div>
              </article>
            </template>
          </div>

          <footer class="pa-4 bg-white flex-shrink-0">
            <v-text-field
              v-model="inputText"
              placeholder="메시지를 입력하세요..."
              variant="outlined"
              hide-details
              density="comfortable"
              rounded="pill"
              bg-color="white"
              color="primary"
              aria-label="메시지 입력"
              @keyup.enter="sendMessage"
            >
              <template #append-inner>
                <v-btn
                  icon="mdi-send"
                  color="primary"
                  variant="text"
                  density="compact"
                  aria-label="전송"
                  :disabled="!inputText.trim()"
                  @click="sendMessage"
                ></v-btn>
              </template>
            </v-text-field>
          </footer>
        </section>
      </v-col>

      <v-col
        cols="12"
        md="6"
        class="d-flex flex-column pa-0"
        style="min-height: 0; height: 100%; overflow: hidden"
      >
        <section
          aria-label="계약서 초안 미리보기"
          class="d-flex flex-column w-100 h-100 bg-white rounded-xl border"
          style="overflow: hidden"
        >
          <header class="px-6 pt-5 pb-2 bg-white flex-shrink-0">
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-2"
                  >mdi-file-document-outline</v-icon
                >
                <h2
                  class="font-weight-bold text-h6 text-grey-darken-3 mb-0"
                >
                  계약서 초안
                </h2>
              </div>
              <v-chip
                size="small"
                variant="flat"
                color="grey-lighten-3"
                class="text-caption font-weight-medium"
              >
                {{ getStepLabel(currentStep) }}
              </v-chip>
            </div>

            <div class="mb-2" aria-hidden="true">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-caption font-weight-bold text-primary"
                  >진행률</span
                >
                <span class="text-caption font-weight-bold text-primary"
                  >{{ progressPercentage }}%</span
                >
              </div>
              <v-progress-linear
                :model-value="progressPercentage"
                color="primary"
                height="6"
                rounded
                bg-color="grey-lighten-3"
              ></v-progress-linear>
            </div>
          </header>

          <v-divider></v-divider>

          <aside
            v-if="metaInfo"
            class="bg-blue-grey-lighten-5 px-6 py-3 border-b flex-shrink-0"
            aria-label="AI 분석 정보"
          >
            <div
              class="d-flex align-center justify-space-between"
              style="cursor: pointer"
              @click="showMetaPanel = !showMetaPanel"
            >
              <span class="text-caption font-weight-bold text-blue-grey">
                <v-icon size="small" class="mr-1">mdi-robot-outline</v-icon>
                AI 분석 상태
              </span>
              <v-icon>{{
                showMetaPanel ? 'mdi-chevron-up' : 'mdi-chevron-down'
              }}</v-icon>
            </div>
            <v-expand-transition>
              <div v-show="showMetaPanel">
                <div
                  v-if="metaInfo.step_advance"
                  class="mt-2 d-flex align-center"
                >
                  <span class="text-caption text-grey-darken-1 mr-2"
                    >단계 진행:</span
                  >
                  <v-icon
                    size="14"
                    :color="metaInfo.step_advance.advance ? 'green' : 'orange'"
                    class="mr-1"
                  >
                    {{
                      metaInfo.step_advance.advance
                        ? 'mdi-check-circle'
                        : 'mdi-clock'
                    }}
                  </v-icon>
                  <span class="text-caption">{{
                    metaInfo.step_advance.reason || '-'
                  }}</span>
                </div>
              </div>
            </v-expand-transition>
          </aside>

          <article
            class="flex-grow-1 overflow-y-auto pa-8 bg-white"
            style="min-height: 0"
            aria-label="계약서 내용"
          >
            <div
              v-if="contractDraft"
              class="contract-content text-body-2 text-grey-darken-3"
              style="line-height: 1.8; font-family: 'Noto Sans KR', sans-serif"
            >
              <div v-html="renderedContract"></div>
            </div>

            <div
              v-else
              class="d-flex flex-column align-center justify-center h-100 opacity-60"
            >
              <v-icon size="48" color="grey-lighten-1" class="mb-2"
                >mdi-file-hidden</v-icon
              >
              <p class="text-grey mb-1">작성된 계약서 내용이 없습니다.</p>
              <p class="text-caption text-grey-lighten-1">
                왼쪽 채팅을 통해 계약 내용을 논의해주세요.
              </p>
            </div>
          </article>

          <footer
            class="px-6 py-4 bg-white border-t flex-shrink-0 d-flex"
          >
            <v-spacer></v-spacer>
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              size="small"
              class="mr-2 rounded-pill px-4"
              :disabled="!contractDraft"
              @click="copyContractDraft"
            >
              <v-icon start size="small">mdi-content-copy</v-icon> 복사
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              class="rounded-pill px-4"
              :disabled="!contractDraft"
              @click="downloadContractDraft"
            >
              <v-icon start size="small">mdi-download</v-icon> 다운로드
            </v-btn>
          </footer>
        </section>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// ----- 선언부 (Imports, Props, Emits, Router) ----- //
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { MockWebSocket } from '@/services/ws/mockSocket.js';

const emit = defineEmits(['set-side-nav', 'set-top-nav']);

// ----- 상태 변수 (State & Refs) ----- //
const USE_MOCK = false; // true: 가짜 서버, false: 진짜 서버
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

const API_URL = 'http://localhost:9571/v1/session/connect';
const WS_BASE_URL = 'ws://localhost:9571/v1/session/chat';

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
  completed: '계약 완료',
};

const userProfiles = {
  갑: {
    name: '고예경',
    role: 'client',
    contractDate: '2025-12-07',
  },
  을: {
    name: '김영지',
    role: 'provider',
    contractDate: '2025-12-07',
  },
};

const renderedContract = computed(() => renderMarkdown(contractDraft.value));

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
onMounted(() => {
  initializeSession();
  emit('set-top-nav', false);
  emit('set-side-nav', true);
});

onUnmounted(() => {
  if (socket.value) socket.value.close();
});

// ----- 함수 정의 (Methods) ----- //
const escapeHtml = (str = '') =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const renderMarkdown = (md = '') => {
  let html = escapeHtml(md);
  html = html.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/^(?:-\s+.+\n?)+/gm, (block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((li) => li.replace(/^-\s+/, ''));
    return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  });
  html = html.replace(/\n/g, '<br />');
  return html;
};

const initializeSession = async () => {
  isLoading.value = true;
  try {
    if (USE_MOCK) {
      console.log('[Mock] API 호출을 건너뛰고 가짜 세션을 초기화합니다.');
      sessionId.value = 'mock-session-id-12345';
      await new Promise((resolve) => setTimeout(resolve, 500));
      connectWebSocket();
      return;
    }

    const payload = {
      userId: 'user123',
      client_name: userProfiles['갑'].name,
      provider_name: userProfiles['을'].name,
      contract_date: userProfiles['갑'].contractDate,
    };

    console.log('세션 생성 요청:', payload);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    sessionId.value = data.sid;

    console.log('세션 ID 획득:', sessionId.value);
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
    console.error('sessionId가 없어 WebSocket에 연결할 수 없습니다.');
    return;
  }

  const wsUrl = `${WS_BASE_URL}?sid=${sessionId.value}`;
  console.log('WebSocket 연결 시도:', wsUrl);

  if (USE_MOCK) {
    socket.value = new MockWebSocket(wsUrl);
  } else {
    socket.value = new WebSocket(wsUrl);
  }

  socket.value.onopen = () => {
    console.log('WebSocket 연결 성공:', sessionId.value);
    isConnected.value = true;
  };

  socket.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('수신 메시지:', data);

      if (data.hd?.event === 'llm.response') {
        messages.value.push({
          role: 'llm',
          text: data.bd?.text || '응답 없음',
          timestamp: new Date(),
        });

        if (data.bd?.contract_draft) {
          contractDraft.value = data.bd.contract_draft;
        }

        if (data.hd?.step) {
          currentStep.value = data.hd.step;
        }

        if (data.bd?.progress_percentage !== undefined) {
          progressPercentage.value = data.bd.progress_percentage;
          console.log('진행률 업데이트:', progressPercentage.value);
        }

        if (data.bd?.meta) {
          metaInfo.value = data.bd.meta;
          showMetaPanel.value = true;
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
      isConnected: isConnected.value,
    });
    return;
  }

  const currentUser = userProfiles[currentRole.value];

  if (!currentUser) {
    console.error('사용자 프로필을 찾을 수 없습니다:', currentRole.value);
    return;
  }

  // Use the name for display purposes to match the logic in the template
  messages.value.push({
    role: currentUser.name, // Display name
    text: inputText.value,
    timestamp: new Date(),
  });

  const payload = {
    hd: {
      sid: sessionId.value,
      event: 'llm.invoke',
      role: currentUser.role,
      user_name: currentUser.name,
    },
    bd: {
      text: inputText.value,
    },
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
  return msg.role === currentUserName ? 'justify-end' : 'justify-start';
};

const getBubbleColor = (role) => {
  if (role === 'llm') return 'grey-lighten-3';
  const currentUserName = userProfiles[currentRole.value]?.name;
  return role === currentUserName ? 'primary' : 'secondary';
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
    const file = new Blob([contractDraft.value], {
      type: 'text/plain;charset=utf-8',
    });
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
      // The ref might be the component instance or the element itself.
      const el = chatArea.value.$el ?? chatArea.value;
      el.scrollTop = el.scrollHeight;
    }
  });
};
</script>
