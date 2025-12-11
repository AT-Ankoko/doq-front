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
        <!-- 세션 아이디 입력 다이얼로그 -->
        <v-dialog
          v-model="showSessionDialog"
          persistent
          width="500"
        >
          <v-card>
            <v-card-title class="text-h6 font-weight-bold">
              <v-icon class="mr-2" color="primary">mdi-connection</v-icon>
              세션 연결
            </v-card-title>
            
            <v-card-text class="pt-4">
              <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
                density="compact"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </v-alert>

              <div class="mb-4">
                <p class="text-body-2 text-grey-darken-2 mb-4">
                  새 세션을 생성하거나 기존 세션에 참여할 수 있습니다.
                </p>
              </div>

              <div class="d-flex flex-column gap-3">
                <!-- 새 세션 생성 -->
                <div>
                  <v-btn
                    block
                    color="primary"
                    variant="flat"
                    size="large"
                    @click="createNewSession"
                    :loading="isLoading"
                  >
                    <v-icon start>mdi-plus-circle</v-icon>
                    새 세션 생성
                  </v-btn>
                  <p class="text-caption text-grey mt-2 mb-0">새로운 세션을 생성하고 연결합니다</p>
                </div>

                <!-- 구분선 -->
                <div class="d-flex align-center gap-2 my-2">
                  <v-divider></v-divider>
                  <span class="text-caption text-grey-darken-1">또는</span>
                  <v-divider></v-divider>
                </div>

                <!-- 기존 세션 참여 -->
                <div>
                  <p class="text-caption text-grey font-weight-bold mb-2">세션 아이디</p>
                  <v-text-field
                    v-model="inputSessionId"
                    placeholder="세션 아이디 입력 (예: sbd4d9d9c6a)"
                    variant="outlined"
                    size="small"
                    density="compact"
                    @keyup.enter="joinExistingSession"
                  ></v-text-field>
                  <v-btn
                    block
                    color="success"
                    variant="flat"
                    size="large"
                    @click="joinExistingSession"
                    :loading="isLoading"
                    :disabled="!inputSessionId.trim()"
                  >
                    <v-icon start>mdi-login</v-icon>
                    세션 참여
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>

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
                {{ userProfiles.갑.name }} (갑)
              </v-btn>
              <v-btn
                value="을"
                class="px-4 rounded-pill text-body-2 font-weight-bold bg-grey-lighten-4 text-grey-darken-1"
                size="large"
                height="24"
                style="border: none;"
              >
                {{ userProfiles.을.name }} (을)
              </v-btn>
            </v-btn-toggle>

            <v-spacer></v-spacer>

            <v-btn
              icon="mdi-restart"
              size="small"
              variant="text"
              @click="showSessionDialog = true"
              color="primary"
              title="새 세션 연결"
            ></v-btn>

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
import { ref, reactive, onMounted, onUnmounted, nextTick, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { MockWebSocket } from '@/services/ws/mockSocket.js';
import { useStorageWithExpiry } from '@/common/useStorageWithExpiry';

const emit = defineEmits(['set-side-nav', 'set-top-nav']);
const route = useRoute();
const { getItem } = useStorageWithExpiry();

// ----- 상태 변수 ----- //
const USE_MOCK = false;
const socket = ref(null);
const isConnected = ref(false);
const messages = ref([]);
const inputText = ref('');
const chatArea = ref(null);

// 역할 설정
const myRoleQuery = route.query.role || 'client'; 
const currentRole = ref(myRoleQuery === 'client' ? '갑' : '을'); 

const contractDraft = ref('');
const currentStep = ref('');
const sessionId = ref('');
const isLoading = ref(false);
const progressPercentage = ref(0);
const metaInfo = ref(null);
const showMetaPanel = ref(true);
const showSessionDialog = ref(true);
const inputSessionId = ref('');
const errorMessage = ref('');
const contractTitle = ref('계약서 초안');

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

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

// [동적 프로필 생성] localStorage 데이터 활용
const savedData = getItem('contractData') || {};
const clientInfo = savedData.client || {};
const performerInfo = savedData.performer || {};
const myUserId = 'user_' + Math.random().toString(36).substr(2, 5);

const userProfiles = reactive({
  갑: { 
    name: clientInfo.name || '의뢰인', 
    role: 'client', 
    contractDate: clientInfo.contractDate || '2025-01-01', 
    userId: myRoleQuery === 'client' ? myUserId : 'partner_client' 
  },
  을: { 
    name: performerInfo.name || '용역자', 
    role: 'provider', 
    contractDate: performerInfo.contractDate || '2025-01-01', 
    userId: myRoleQuery === 'performer' ? myUserId : 'partner_provider' 
  },
});

const escapeHtml = (str = '') => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const renderMarkdown = (md = '') => {
  let html = escapeHtml(md);
  const listItems = [];
  html = html.replace(/^(?:-\s+.+\n?)+/gm, (match) => {
    const items = match.split('\n').filter(Boolean).map(item => `<li>${item.replace(/-\s+/, '')}</li>`).join('');
    listItems.push(`<ul>${items}</ul>`);
    return `__LIST_${listItems.length - 1}__`;
  });
  html = html.replace(/^(?:\d+\.\s+.+\n?)+/gm, (match) => {
    const items = match.split('\n').filter(Boolean).map(item => `<li>${item.replace(/\d+\.\s+/, '')}</li>`).join('');
    listItems.push(`<ol>${items}</ol>`);
    return `__LIST_${listItems.length - 1}__`;
  });
  html = html.replace(/^###\s+(.+)$/gm, '<h4>$1</h4>').replace(/^##\s+(.+)$/gm, '<h3>$1</h3>').replace(/^#\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br />');
  html = html.replace(/__LIST_(\d+)__/g, (match, index) => listItems[parseInt(index, 10)]);
  return html;
};
const renderedContract = computed(() => renderMarkdown(contractDraft.value));

onMounted(() => {
  emit('set-top-nav', false);
  emit('set-side-nav', true);

  if (route.query.sid) {
    sessionId.value = route.query.sid;
    showSessionDialog.value = false;
    connectWebSocket();
  }
});

onUnmounted(() => {
  if (socket.value) socket.value.close();
});

// [자동 전송 로직]
watch(isConnected, (connected) => {
  if (connected) checkAndSendPendingMessage();
});

const checkAndSendPendingMessage = () => {
  const pendingMsg = localStorage.getItem('pending_contract_msg');
  if (pendingMsg) {
    const currentUser = userProfiles[currentRole.value];
    const payload = {
      hd: {
        sid: sessionId.value,
        event: 'llm.invoke',
        userId: currentUser.userId,
        role: currentUser.role,
        user_name: currentUser.name,
        // 👇 백엔드 요구사항에 맞춰 필수 추가
        client_name: userProfiles['갑'].name,
        provider_name: userProfiles['을'].name,
      },
      bd: { text: pendingMsg },
    };
    try {
      console.log("🚀 [Socket] 전송 패킷:", JSON.stringify(payload, null, 2));
      socket.value.send(JSON.stringify(payload));
      localStorage.removeItem('pending_contract_msg');
    } catch (error) { console.error(error); }
  }
};

// ... (기존 createNewSession, joinExistingSession, connectWebSocket 등 나머지 함수들은 유지하되 userProfiles 참조만 주의)

const createNewSession = async () => {
  isLoading.value = true;
  try {
    const currentUser = userProfiles[currentRole.value];
    const payload = {
      userId: currentUser.userId,
      client_name: userProfiles['갑'].name,
      provider_name: userProfiles['을'].name,
      contract_date: userProfiles['갑'].contractDate,
    };
    const response = await fetch(`${API_BASE_URL}/v1/session/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`API 오류: ${response.status}`);
    const data = await response.json();
    sessionId.value = data.sid;
    showSessionDialog.value = false;
    errorMessage.value = '';
    messages.value = [];
    contractDraft.value = '';
    currentStep.value = '';
    progressPercentage.value = 0;
    metaInfo.value = null;
    contractTitle.value = '계약서 초안';
    connectWebSocket();
  } catch (error) {
    console.error(error);
    errorMessage.value = `세션 생성 실패: ${error?.message || '오류'}`;
  } finally {
    isLoading.value = false;
  }
};

const joinExistingSession = async () => {
  if (!inputSessionId.value.trim()) return alert('세션 아이디를 입력해주세요.');
  isLoading.value = true;
  try {
    sessionId.value = inputSessionId.value.trim();
    showSessionDialog.value = false;
    errorMessage.value = '';
    messages.value = [];
    contractDraft.value = '';
    currentStep.value = '';
    progressPercentage.value = 0;
    metaInfo.value = null;
    contractTitle.value = '계약서 초안';
    inputSessionId.value = '';
    connectWebSocket();
  } catch (error) {
    console.error(error);
    errorMessage.value = `세션 참여 실패: ${error?.message || '오류'}`;
    showSessionDialog.value = true;
  } finally {
    isLoading.value = false;
  }
};

const connectWebSocket = () => {
  if (!sessionId.value) return;
  const clientName = encodeURIComponent(userProfiles['갑'].name);
  const providerName = encodeURIComponent(userProfiles['을'].name);
  const wsUrl = `${WS_BASE_URL}?sid=${sessionId.value}&client_name=${clientName}&provider_name=${providerName}`;
  
  if (USE_MOCK) socket.value = new MockWebSocket(wsUrl);
  else socket.value = new WebSocket(wsUrl);

  socket.value.onopen = () => { isConnected.value = true; };
  socket.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
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
      userId: currentUser.userId,
      role: currentUser.role,
      user_name: currentUser.name,
      // 👇 백엔드 요구사항에 맞춰 필수 추가
      client_name: userProfiles['갑'].name,
      provider_name: userProfiles['을'].name,
    },
    bd: { text: inputText.value },
  };

  try {
    console.log("🚀 [Socket] 전송 패킷:", JSON.stringify(payload, null, 2));
    socket.value.send(JSON.stringify(payload));
    inputText.value = '';
    scrollToBottom();
  } catch (error) { console.error(error); }
};

const getStepLabel = (step) => stepLabels[step] || '대기 중...';
const copySessionId = () => {
  if (!sessionId.value) return;
  navigator.clipboard.writeText(sessionId.value).then(() => alert('세션 아이디 복사 완료')).catch(() => alert('복사 실패'));
};
const copyContractDraft = () => {
  if (contractDraft.value) {
    navigator.clipboard.writeText(contractDraft.value).then(() => alert('복사되었습니다.')).catch(() => alert('실패했습니다.'));
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