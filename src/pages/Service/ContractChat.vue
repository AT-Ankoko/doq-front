<!-- src/pages/Service/ContractChat.vue -->
<template>
  <v-container fluid class="fill-height pa-0 chat-container">
    <!-- 로딩 및 에러 오버레이 -->
    <v-overlay :model-value="isLoading || !!error" class="align-center justify-center" persistent>
      <div class="text-center">
        <v-progress-circular v-if="isLoading" indeterminate color="primary" size="64"></v-progress-circular>
        <div v-if="error" class="pa-4 bg-red-darken-4 rounded-lg">
          <p class="text-h6">오류 발생</p>
          <p>{{ error }}</p>
          <v-btn class="mt-4" @click="goHome">홈으로 돌아가기</v-btn>
        </div>
      </div>
    </v-overlay>

    <!-- 메인 레이아웃 -->
    <v-row no-gutters class="fill-height">
      <!-- 채팅 패널 (왼쪽) -->
      <v-col cols="12" md="6" class="d-flex flex-column fill-height">
        <!-- 헤더: 계약 진행상황 -->
        <v-sheet color="grey-lighten-4" class="pa-4">
          <p class="text-subtitle-2 font-weight-bold">계약 진행 단계</p>
          <p class="text-h6">{{ stepName }} ({{ step }}/5)</p>
          <v-progress-linear :model-value="progress" color="primary" height="10" rounded class="mt-2"></v-progress-linear>
        </v-sheet>

        <!-- 메시지 목록 -->
        <v-card-text ref="chatArea" class="flex-grow-1 overflow-y-auto pa-4">
          <div v-for="msg in messages" :key="msg.id" :class="['d-flex', 'mb-4', getMessageAlignment(msg)]">
            <v-sheet :color="getMessageColor(msg)" class="pa-3 rounded-lg" max-width="80%">
              <p class="text-caption font-weight-bold" v-if="msg.type === 'message'">{{ msg.sender.userName }} ({{ msg.sender.userType }})</p>
              <p class="text-body-2">{{ msg.text }}</p>
              <p class="text-caption text-right mt-1">{{ formatTimestamp(msg.timestamp) }}</p>
            </v-sheet>
          </div>
        </v-card-text>

        <!-- 메시지 입력창 -->
        <v-sheet class="pa-4" color="grey-lighten-3">
          <v-text-field
            v-model="newMessage"
            label="메시지를 입력하세요..."
            variant="solo"
            append-inner-icon="mdi-send"
            @click:append-inner="handleSendMessage"
            @keydown.enter="handleSendMessage"
            hide-details
            :disabled="!isConnected"
          ></v-text-field>
        </v-sheet>
      </v-col>

      <!-- 계약서 패널 (오른쪽) -->
      <v-col cols="12" md="6" class="d-flex flex-column fill-height border-s">
        <!-- 헤더: 계약서 초안 -->
        <v-sheet color="grey-lighten-4" class="pa-4 d-flex justify-space-between align-center">
          <p class="text-h6 font-weight-bold">계약서 초안</p>
          <div>
            <v-btn icon="mdi-content-copy" variant="text" @click="handleCopy"></v-btn>
            <v-btn icon="mdi-download" variant="text" @click="handleDownload"></v-btn>
          </div>
        </v-sheet>

        <!-- 계약서 내용 -->
        <v-card-text class="flex-grow-1 overflow-y-auto pa-4" style="white-space: pre-wrap; line-height: 1.8;">
          <pre>{{ contractDraft || '아직 계약서 초안이 생성되지 않았습니다.' }}</pre>
        </v-card-text>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useChat } from '@/composables/useChat';
import { copyToClipboard, downloadAsTxt } from '@/utils/contractUtils';

const newMessage = ref('');
const chatArea = ref(null);
const router = useRouter();

const {
  messages,
  contractDraft,
  step,
  stepName,
  progress,
  isConnected,
  isLoading,
  error,
  currentUser,
  initialize,
  sendMessage,
  cleanup,
} = useChat();

// 메시지 목록이 변경될 때마다 스크롤을 맨 아래로 이동
watch(messages, async () => {
  await nextTick();
  if (chatArea.value) {
    chatArea.value.scrollTop = chatArea.value.scrollHeight;
  }
}, { deep: true });

// 컴포넌트가 마운트되면 채팅 초기화
onMounted(() => {
  initialize();
});

// 컴포넌트가 언마운트되면 연결 종료 및 상태 초기화
onUnmounted(() => {
  cleanup();
});

const handleSendMessage = () => {
  if (newMessage.value.trim()) {
    sendMessage(newMessage.value);
    newMessage.value = '';
  }
};

const handleCopy = () => {
  if (contractDraft.value) {
    copyToClipboard(contractDraft.value);
  }
};

const handleDownload = () => {
  if (contractDraft.value) {
    downloadAsTxt(contractDraft.value, `계약서_초안_${new Date().toISOString().split('T')[0]}.txt`);
  }
};

const goHome = () => {
  router.push('/');
};

const getMessageAlignment = (msg) => {
  if (msg.type === 'system' || msg.sender.userName === 'AI Assistant') return 'justify-center';
  return msg.sender.userType === currentUser.value?.userType ? 'justify-end' : 'justify-start';
};

const getMessageColor = (msg) => {
  if (msg.type === 'system') return 'blue-grey-lighten-4';
  if (msg.sender.userName === 'AI Assistant') return 'teal-lighten-5';
  return msg.sender.userType === currentUser.value?.userType ? 'primary' : 'grey-lighten-2';
};

const formatTimestamp = (isoString) => {
  return new Date(isoString).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.chat-container {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}
.border-s {
  border-left: 1px solid #e0e0e0;
}
pre {
  font-family: 'Pretendard', sans-serif;
  white-space: pre-wrap;
  word-break: keep-all;
  font-size: 0.9rem;
}
</style>
