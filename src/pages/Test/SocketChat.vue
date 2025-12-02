<template>
  <v-container class="fill-height">
    <v-card class="w-100 h-100 d-flex flex-column" rounded="xl">
      <v-toolbar color="white" density="compact" class="px-4 border-b">
        <v-btn-toggle v-model="currentRole" mandatory density="compact" color="primary">
          <v-btn value="갑">User A (갑)</v-btn>
          <v-btn value="을">User B (을)</v-btn>
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

// [수정] 초기 역할을 '갑'으로 설정 (버튼 value와 일치)
const currentRole = ref('갑');

// [수정] 요청하신 세션 ID 및 계약 정보 설정
const sessionId = 'test123';
const WS_URL = `ws://localhost:9571/v1/session/chat?sid=${sessionId}`;

// 고정된 사용자 정보 (실제 앱에서는 로그인 정보 등에서 가져옴)
const userInfo = {
  name: "김철수",
  contractDate: "2025-12-01"
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
      
      // 서버 응답 처리
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

  // 화면에 내 메시지 표시
  messages.value.push({
    role: currentRole.value,
    text: inputText.value,
    timestamp: new Date()
  });

  // [수정] 요청하신 JSON 패킷 구조에 맞춰 Payload 구성
  const payload = {
    hd: {
      sid: sessionId,                     // "test123"
      event: "llm.invoke",
      role: currentRole.value,            // "갑" (또는 "을")
      asker: userInfo.name,               // "김철수"
      user_name: userInfo.name,           // "김철수"
      user_role: currentRole.value,       // "갑"
      contract_date: userInfo.contractDate // "2025-12-01"
    },
    bd: {
      text: inputText.value
    }
  };

  // 웹소켓 전송
  socket.value.send(JSON.stringify(payload));
  
  // 입력창 초기화 및 스크롤
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