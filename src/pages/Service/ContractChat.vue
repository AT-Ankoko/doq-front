<template>
  <v-container
    class="pa-4"
    fluid
    style="height: 100vh; display: flex; box-sizing: border-box; overflow: hidden; background-color: #F2F7FB;"
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
        gap: 20px; 
      "
    >
      <div
        class="d-flex flex-column"
        style="flex: 1.4; min-width: 0; height: 100%; overflow: visible;"
      >

        <section
          aria-label="AI 채팅 인터페이스"
          class="d-flex flex-column w-100 h-100 rounded-xl elevation-0 border ma-2"
          style="overflow: hidden; background-color: #FFFFFF; border-color: #E0E0E0 !important;"
        >
          <header
            class="px-6 py-4 d-flex align-center flex-shrink-0"
            style="background-color: #FFFFFF; z-index: 1;"
          >
            <v-btn-toggle
              v-model="currentRole"
              mandatory
              variant="flat"
              class="bg-transparent"
              style="gap: 8px; height: auto;" 
              selected-class="bg-primary text-white elevation-2"
            >
              <v-btn
                value="갑"
                class="px-4 rounded-pill text-body-2 font-weight-bold bg-grey-lighten-4 text-grey-darken-1"
                size="large"
                height="24"
                style="border: none;"
              >
                고예경 (갑)
              </v-btn>
              <v-btn
                value="을"
                class="px-4 rounded-pill text-body-2 font-weight-bold bg-grey-lighten-4 text-grey-darken-1"
                size="large"
                height="24"
                style="border: none;"
              >
                김영지 (을)
              </v-btn>
            </v-btn-toggle>

            <v-spacer></v-spacer>


            <v-chip
              v-if="sessionId"
              size="small"
              color="blue-lighten-5"
              text-color="blue-darken-2"
              class="font-weight-bold mr-2"
              style="height: 24px; cursor: pointer;"
              title="클릭하여 세션 아이디 복사"
              @click="copySessionId"
            >
              SID: {{ sessionId }}
            </v-chip>

            <v-btn
              icon="mdi-refresh"
              color="primary"
              variant="text"
              size="small"
              class="ml-2"
              title="채팅 재접속"
              @click="joinExistingSession"
            ></v-btn>

            <v-chip
              size="small"
              :color="isConnected ? 'grey-lighten-2' : 'red-lighten-4'"
              :text-color="isConnected ? 'grey-darken-3' : 'red'"
              variant="flat"
              class="font-weight-bold"
              style="height: 24px;" 
            >
              <v-icon
                start
                size="x-small"
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
            class="flex-grow-1 overflow-y-auto px-6 py-4"
            style="min-height: 0; background-color: #F8F9FA;"
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
                    background-color: #E8E8E8;
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

              <article v-else class="d-flex flex-column align-start mb-4">
                <div class="d-flex align-center mb-1">
                  <span class="font-weight-bold text-caption text-primary pl-1">
                    {{ msg.role }}
                  </span>
                </div>
                <div
                  class="pa-3 px-4 rounded-lg rounded-tl-0 text-grey-darken-3 text-body-2"
                  style="
                    max-width: 85%;
                    white-space: pre-wrap;
                    line-height: 1.6;
                    background-color: #E3F2FD;
                  "
                >
                  {{ msg.text }}
                </div>
              </article>
            </template>
          </div>

          <footer 
            class="px-6 py-4 flex-shrink-0 d-flex align-center" 
            style="background-color: #FFFFFF; height: 72px; z-index: 1;"
          >
            <v-text-field
              v-model="inputText"
              placeholder="메시지를 입력하세요..."
              variant="outlined"
              hide-details
              density="compact" 
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
                  aria-label="전송"
                  size="small"
                  :disabled="!inputText.trim()"
                  @click="sendMessage"
                ></v-btn>
              </template>
            </v-text-field>
          </footer>
        </section>
      </div>

      <div
        class="d-flex flex-column"
        style="flex: 1; min-width: 0; height: 100%; overflow: visible;"
      >
        <section
          aria-label="계약서 초안 미리보기"
          class="d-flex flex-column w-100 h-100 rounded-xl elevation-0 border ma-2"
          style="overflow: hidden; background-color: #FFFFFF; border-color: #E0E0E0 !important;"
        >
          <header class="px-6 pt-5 pb-2 flex-shrink-0" style="background-color: #FFFFFF; z-index: 1;">
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-2"
                  >mdi-file-document-outline</v-icon
                >
                <h2
                  class="font-weight-bold text-h6 text-grey-darken-3 mb-0"
                >
                  {{ contractTitle }}
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
            class="bg-blue-grey-lighten-5 border-b flex-shrink-0 transition-swing"
            aria-label="AI 분석 정보"
          >
            <div 
              class="d-flex align-center justify-space-between px-6 py-3 cursor-pointer user-select-none"
              @click="showMetaPanel = !showMetaPanel"
            >
              <span class="text-caption font-weight-bold text-blue-grey d-flex align-center">
                <v-icon size="small" class="mr-1">mdi-robot-outline</v-icon>
                AI 분석 상태
              </span>
              <v-icon 
                size="small" 
                color="blue-grey"
                class="transition-transform"
                :style="{ transform: showMetaPanel ? 'rotate(180deg)' : 'rotate(0deg)' }"
              >
                mdi-chevron-down
              </v-icon>
            </div>

            <v-expand-transition>
              <div v-show="showMetaPanel" class="px-6 pb-3">
                <div
                  v-if="metaInfo.step_advance"
                  class="d-flex align-center"
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
            class="flex-grow-1 overflow-y-auto pa-8"
            style="min-height: 0; background-color: #F8F9FA;"
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
            class="px-6 py-4 flex-shrink-0 d-flex align-center"
            style="background-color: #FFFFFF; height: 72px; z-index: 1;"
          >
            <v-spacer></v-spacer>
            <v-btn
              variant="flat" 
              class="px-4 rounded-pill text-body-2 font-weight-bold bg-grey-lighten-4 text-grey-darken-1 mr-2"
              size="large"
              height="24"
              style="border: none;"
              :disabled="!contractDraft"
              @click="copyContractDraft"
            >
              <v-icon start size="small">mdi-content-copy</v-icon> 복사
            </v-btn>
            
            <v-btn
              variant="flat"
              class="px-4 rounded-pill text-body-2 font-weight-bold bg-primary text-white"
              size="large"
              height="24"
              style="border: none;"
              :disabled="!contractDraft"
              @click="downloadContractDraft"
            >
              <v-icon start size="small">mdi-download</v-icon> 다운로드
            </v-btn>
          </footer>
        </section>
      </div>
    </v-row>
  </v-container>
</template>

<script setup>
// 기존 스크립트 그대로 유지
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRoute } from 'vue-router';
import { MockWebSocket } from '@/services/ws/mockSocket.js';

const emit = defineEmits(['set-side-nav', 'set-top-nav']);

// ----- 상태 변수 ----- //
const USE_MOCK = false; // 모의 WebSocket 사용 여부
const socket = ref(null);
const isConnected = ref(false);
const messages = ref([]);
const inputText = ref('');
const chatArea = ref(null);
const currentRole = ref('갑');
const contractDraft = ref('');
const currentStep = ref('');
const sessionId = ref('');
const route = useRoute();
const isLoading = ref(false);
const progressPercentage = ref(0);
const metaInfo = ref(null);
const showMetaPanel = ref(true);
const showSessionDialog = ref(true);
const inputSessionId = ref('');
const errorMessage = ref('');
const contractTitle = ref('계약서 초안');

const API_URL = 'https://doq-server.onrender.com/v1/session/connect';
const WS_BASE_URL = 'wss://doq-server.onrender.com/v1/session/chat';

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
  갑: { name: '고예경', role: 'client', contractDate: '2025-12-07' },
  을: { name: '김영지', role: 'provider', contractDate: '2025-12-07' },
};

const escapeHtml = (str = '') =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderMarkdown = (md = '') => {
  let html = escapeHtml(md);

  const listItems = [];
  // ul
  html = html.replace(/^(?:-\s+.+\n?)+/gm, (match) => {
    const items = match.split('\n').filter(Boolean).map(item => `<li>${item.replace(/-\s+/, '')}</li>`).join('');
    const list = `<ul>${items}</ul>`;
    listItems.push(list);
    return `__LIST_${listItems.length - 1}__`;
  });
  // ol
  html = html.replace(/^(?:\d+\.\s+.+\n?)+/gm, (match) => {
    const items = match.split('\n').filter(Boolean).map(item => `<li>${item.replace(/\d+\.\s+/, '')}</li>`).join('');
    const list = `<ol>${items}</ol>`;
    listItems.push(list);
    return `__LIST_${listItems.length - 1}__`;
  });

  html = html.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br />');

  // Restore lists
  html = html.replace(/__LIST_(\d+)__/g, (match, index) => {
    return listItems[parseInt(index, 10)];
  });

  return html;
};

const renderedContract = computed(() => renderMarkdown(contractDraft.value));

onMounted(() => {
  emit('set-top-nav', false);
  emit('set-side-nav', true);

  // 쿼리에서 sid 우선 가져오고, 없으면 localStorage에서 가져옴
  const sidFromQuery = route.query.sid;
  const sidFromStorage = localStorage.getItem('sid');
  sessionId.value = sidFromQuery || sidFromStorage || '';

  // 세션 아이디가 있으면 바로 웹소켓 연결
  if (sessionId.value) {
    showSessionDialog.value = false;
    connectWebSocket();
  }
});

onUnmounted(() => {
  if (socket.value) socket.value.close();
});


// 기존 세션 참여
// 채팅 재접속 및 세션 참여
const joinExistingSession = async () => {
  // 리로드 버튼 클릭 시: 현재 sessionId로 재접속
  isLoading.value = true;
  try {
    if (!sessionId.value) {
      alert('세션 아이디가 없습니다.');
      isLoading.value = false;
      return;
    }
    // 기존 소켓 닫기
    if (socket.value) socket.value.close();
    isConnected.value = false;
    errorMessage.value = '';
    // 메시지, 계약서, 진행상태 등 모두 초기화 (중복 방지)
    messages.value = [];
    contractDraft.value = '';
    currentStep.value = '';
    progressPercentage.value = 0;
    metaInfo.value = null;
    contractTitle.value = '계약서 초안';
    // 리로드 후 재접속
    connectWebSocket();
  } catch (error) {
    console.error(error);
    errorMessage.value = `채팅 재접속 실패: ${error?.message || '알 수 없는 오류'}`;
  } finally {
    isLoading.value = false;
  }
};

const initializeSession = async () => {
  isLoading.value = true;
  try {
    if (USE_MOCK) {
      sessionId.value = 'mock-session-id-12345';
      await new Promise((resolve) => setTimeout(resolve, 500));
      connectWebSocket();
      return;
    }
    // 자동 생성 호출을 막아, 다이얼로그에서 명시적으로 생성/참여하도록 유지
    errorMessage.value = '세션을 생성하거나 참여하려면 다이얼로그에서 진행해주세요.';
  } catch (error) {
    console.error(error);
    errorMessage.value = error?.message || '세션 초기화 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const connectWebSocket = () => {
  if (!sessionId.value) return;
  const wsUrl = `${WS_BASE_URL}?sid=${sessionId.value}`;
  
  if (USE_MOCK) socket.value = new MockWebSocket(wsUrl);
  else socket.value = new WebSocket(wsUrl);

  socket.value.onopen = () => { isConnected.value = true; };
  socket.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // LLM 응답 브로드캐스트
      if (data.hd?.event === 'llm.response') {
        messages.value.push({
          role: 'llm',
          text: data.bd?.text || '응답 없음',
          timestamp: new Date(),
        });
        if (data.bd?.contract_draft) contractDraft.value = data.bd.contract_draft;
        if (data.bd?.contract_title) contractTitle.value = data.bd.contract_title;
        if (data.hd?.step) currentStep.value = data.hd.step;
        if (data.bd?.progress_percentage !== undefined) progressPercentage.value = data.bd.progress_percentage;
        if (data.bd?.meta) {
          metaInfo.value = data.bd.meta;
          showMetaPanel.value = true;
        }
        scrollToBottom();
      }

      // 다른 사용자의 채팅 브로드캐스트 (chat.message)
      if (data.hd?.event === 'chat.message') {
        const incomingRole = data.hd?.user_name || data.hd?.role || '상대';
        messages.value.push({
          role: incomingRole,
          text: data.bd?.text || '메시지 없음',
          timestamp: new Date(),
        });
        scrollToBottom();
      }
    } catch (e) { console.error(e); }
  };
  socket.value.onclose = () => { isConnected.value = false; };
};

const sendMessage = () => {
  if (!inputText.value.trim() || !isConnected.value) return;
  const currentUser = userProfiles[currentRole.value];
  if (!currentUser) return;

  messages.value.push({
    role: currentUser.name,
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
    bd: { text: inputText.value },
  };

  try {
    socket.value.send(JSON.stringify(payload));
    inputText.value = '';
    scrollToBottom();
  } catch (error) { console.error(error); }
};

const getStepLabel = (step) => stepLabels[step] || '대기 중...';

const copySessionId = () => {
  if (!sessionId.value) return;
  navigator.clipboard.writeText(sessionId.value)
    .then(() => alert('세션 아이디를 복사했습니다.'))
    .catch(() => alert('세션 아이디 복사에 실패했습니다.'));
};

const copyContractDraft = () => {
  if (contractDraft.value) {
    navigator.clipboard.writeText(contractDraft.value)
      .then(() => alert('복사되었습니다.'))
      .catch(() => alert('실패했습니다.'));
  }
};

const downloadContractDraft = () => {
  if (contractDraft.value) {
    const element = document.createElement('a');
    const file = new Blob([contractDraft.value], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `contract.txt`;
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

<style scoped>
.cursor-pointer { cursor: pointer; }
.user-select-none { user-select: none; }
.transition-transform { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
</style>