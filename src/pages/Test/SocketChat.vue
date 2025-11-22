<template>
  <v-container class="fill-height">
    <v-card class="w-100 h-100 d-flex flex-column" rounded="xl">
      <v-toolbar color="white" density="compact" class="px-4 border-b">
        <v-btn-toggle v-model="currentRole" mandatory density="compact" color="primary">
          <v-btn value="A">User A</v-btn>
          <v-btn value="B">User B</v-btn>
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
// ----- 선언부 (Imports, Props, Emits, Router) ----- //
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';

// ----- 상태 변수 (State & Refs) ----- //
const socket = ref(null);
const isConnected = ref(false);
const messages = ref([]);
const inputText = ref('');
const currentRole = ref('A');
const chatArea = ref(null);
const sessionId = 's1';
const WS_URL = `ws://localhost:9571/v1/session/chat?sid=${sessionId}`;

// ----- 라이프 사이클 (Lifecycle Hooks) ----- //
onMounted(() => {
  connectWebSocket();
});

onUnmounted(() => {
  if (socket.value) socket.value.close();
});

// ----- 함수 정의 (Methods) ----- //
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

  messages.value.push({
    role: currentRole.value,
    text: inputText.value,
    timestamp: new Date()
  });

  const payload = {
    hd: {
      event: "llm.invoke",
      role: currentRole.value
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