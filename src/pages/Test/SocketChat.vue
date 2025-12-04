<template>
  <v-container class="fill-height">
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

const sessionId = 'test12345678';
const WS_URL = `ws://localhost:9571/v1/session/chat?sid=${sessionId}`;

// [수정] 역할별 사용자 정보 매핑
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
        messages.value.push({
          role: 'llm',
          text: data.bd?.text || '응답 없음',
          timestamp: new Date()
        });
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

const scrollToBottom = () => {
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.$el.scrollTop = chatArea.value.$el.scrollHeight;
    }
  });
};
</script>