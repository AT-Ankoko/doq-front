<template>
  <v-container class="fill-height pa-4">
    <v-row class="h-100 gap-4">
      <!-- 왼쪽: 채팅 영역 -->
      <v-col cols="12" md="6" class="d-flex flex-column">
        <v-card class="w-100 h-100 d-flex flex-column" rounded="xl">
          <v-toolbar color="white" density="compact" class="px-4 border-b">
            <v-btn-toggle v-model="currentRole" mandatory density="compact" color="primary">
              <v-btn value="갑">김철수 (갑)</v-btn>
              <v-btn value="을">이영희 (을)</v-btn>
            </v-btn-toggle>
            
            <v-spacer></v-spacer>
            
            <v-chip size="small" :color="isConnected ? 'green' : 'red'" class="font-weight-bold">
              {{ isConnected ? '연결됨' : '연결 끊김' }}
            </v-chip>
          </v-toolbar>

          <v-card-text class="flex-grow-1 overflow-y-auto bg-grey-lighten-4" ref="chatArea">
            <article v-for="(msg, index) in messages" :key="index" class="d-flex mb-4" :class="getMessageClass(msg)">
              
              <v-avatar v-if="msg.role === 'llm'" color="teal" size="32" class="mr-2">AI</v-avatar>
              
              <div class="d-flex flex-column" :class="msg.role === currentRole ? 'align-end' : 'align-start'">
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

          <v-card-actions class="pa-4 bg-white">
            <v-text-field
              v-model="inputText"
              placeholder="메시지를 입력하세요..."
              variant="outlined"
              hide-details
              density="compact"
              rounded="pill"
              @keyup.enter="sendMessage"
            >
              <template v-slot:append-inner>
                <v-btn icon="mdi-send" color="primary" variant="text" @click="sendMessage"></v-btn>
              </template>
            </v-text-field>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 오른쪽: 계약서 초안 영역 -->
      <v-col cols="12" md="6" class="d-flex flex-column">
        <v-card class="w-100 h-100 d-flex flex-column" rounded="xl">
          <v-toolbar color="white" density="compact" class="px-4 border-b">
            <v-icon class="mr-2">mdi-file-document</v-icon>
            <span class="font-weight-bold">계약서 초안</span>
            
            <v-spacer></v-spacer>
            
            <v-chip size="small" :color="currentStep ? 'blue' : 'grey'">
              {{ getStepLabel(currentStep) }}
            </v-chip>
          </v-toolbar>

          <v-card-text class="flex-grow-1 overflow-y-auto pa-6">
            <div v-if="contractDraft" class="contract-content">
              <div style="white-space: pre-wrap; font-family: 'Courier New', monospace; line-height: 1.6;">
                {{ contractDraft }}
              </div>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

// ----- 상태 변수 ----- //
const socket = ref(null);
const isConnected = ref(false);
const messages = ref([]);
const inputText = ref('');
const chatArea = ref(null);
const currentRole = ref('갑');
const contractDraft = ref('');
const currentStep = ref('');

const sessionId = 'test12345678';
const WS_URL = `ws://localhost:9571/v1/session/chat?sid=${sessionId}`;

// 단계별 라벨 매핑
const stepLabels = {
  'introduction': '소개 및 초기 정보 수집',
  'work_scope': '작업 범위/내용',
  'work_period': '작업 기간',
  'budget': '대금/지급 조건',
  'revisions': '수정 정책',
  'copyright': '저작권 귀속',
  'confidentiality': '기밀 유지',
  'conflict_resolution': '갈등 중재',
  'finalization': '최종 확인',
  'completed': '계약 완료'
};

// 역할별 사용자 정보 매핑
// '갑' = client(의뢰인), '을' = provider(용역자)
const userProfiles = {
  '갑': {
    name: "김철수",
    role: "client",
    contractDate: "2025-12-04"
  },
  '을': {
    name: "이영희",
    role: "provider",
    contractDate: "2025-12-04"
  }
};

// ----- 라이프 사이클 ----- //
onMounted(() => {
  connectWebSocket();
});

onUnmounted(() => {
  if (socket.value) socket.value.close();
});

// ----- 함수 정의 ----- //
const connectWebSocket = () => {
  socket.value = new WebSocket(WS_URL);

  socket.value.onopen = () => {
    console.log('WebSocket Connected:', sessionId);
    isConnected.value = true;
  };

  socket.value.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received:', data);
      
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

        scrollToBottom();
      }
      else if (data.hd?.event === 'llm.state') {
        console.log('State Update:', data.bd?.state?.msg);
      }

    } catch (e) {
      console.error('JSON Parse Error:', e);
    }
  };

  socket.value.onclose = () => {
    console.log('WebSocket Disconnected');
    isConnected.value = false;
  };

  socket.value.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };
};

const sendMessage = () => {
  if (!inputText.value.trim() || !isConnected.value) return;

  // 화면 표시용 메시지 추가
  messages.value.push({
    role: currentRole.value,
    text: inputText.value,
    timestamp: new Date()
  });

  // 현재 선택된 역할(currentRole)에 맞는 프로필 가져오기
  const currentUser = userProfiles[currentRole.value];

  // Payload 구성 - 가이드 기준
  const payload = {
    hd: {
      sid: sessionId,
      event: "llm.invoke",
      role: currentUser.role,              // "client" or "provider"
      user_name: currentUser.name          // "김철수" or "이영희"
    },
    bd: {
      text: inputText.value
    }
  };

  socket.value.send(JSON.stringify(payload));
  inputText.value = '';
  scrollToBottom();
};

const getMessageClass = (msg) => {
  return msg.role === currentRole.value ? 'justify-end' : 'justify-start';
};

const getBubbleColor = (role) => {
  if (role === 'llm') return 'grey-lighten-3';
  if (role === currentRole.value) return 'primary';
  return 'secondary';
};

const getStepLabel = (step) => {
  return stepLabels[step] || '대기 중...';
};

const copyContractDraft = () => {
  if (contractDraft.value) {
    navigator.clipboard.writeText(contractDraft.value).then(() => {
      alert('계약서 초안이 클립보드에 복사되었습니다.');
    }).catch(() => {
      alert('복사 실패. 다시 시도해주세요.');
    });
  }
};

const downloadContractDraft = () => {
  if (contractDraft.value) {
    const element = document.createElement('a');
    const file = new Blob([contractDraft.value], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `contract_${sessionId}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.$el.scrollTop = chatArea.value.$el.scrollHeight;
    }
  });
};
</script>