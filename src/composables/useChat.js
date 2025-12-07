// src/composables/useChat.js

import { ref, readonly } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getSessionId } from '@/services/api/sessionService';
import { chatSocket } from '@/services/ws/chatSocket';
import { useStorageWithExpiry } from '@/common/useStorageWithExpiry';
import { getStepName } from '@/utils/contractUtils';

/**
 * @typedef {import('@/types/chatTypes').User} User
 * @typedef {import('@/types/chatTypes').Message} Message
 * @typedef {import('@/types/chatTypes').ReceiveMessagePayload} ReceiveMessagePayload
 */

// 모듈 스코프에서 상태 관리 (싱글톤)
const messages = ref([]);
const contractDraft = ref('');
const step = ref(1);
const progress = ref(0);
const isConnected = ref(false);
const isLoading = ref(false);
const error = ref(null);
const currentUser = ref(null);

const { getItem } = useStorageWithExpiry();

/**
 * 채팅과 계약서 관리를 위한 컴포저블
 */
export function useChat() {
  const router = useRouter();
  const route = useRoute(); // 현재 라우트 정보 access

  /**
   * 채팅 세션을 초기화합니다.
   * 사용자 정보를 불러오고, 세션 ID를 받아 WebSocket에 연결합니다.
   */
  async function initialize() {
    if (isConnected.value || isLoading.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      // 1. 라우트 쿼리에서 현재 사용자 역할(role) 가져오기
      const role = route.query.role;
      if (!role) {
        throw new Error('역할(role) 정보가 없습니다. 시작 페이지로 돌아가세요.');
      }

      // 2. 저장소에서 전체 계약 데이터 가져오기
      const contractData = getItem('contractData');
      if (!contractData) {
        throw new Error('계약 정보(contractData)가 없습니다. 시작 페이지로 돌아가세요.');
      }

      // 3. 현재 역할에 맞는 사용자 정보 추출
      const userFormData = contractData[role];
      if (!userFormData || !userFormData.name) {
        throw new Error(`현재 역할(${role})에 대한 사용자 정보가 없습니다.`);
      }

      // 4. currentUser 상태 설정 (데이터 구조 매핑)
      currentUser.value = {
        userName: userFormData.name,
        userType: role, // 'client' 또는 'performer'
        // 필요 시 다른 정보도 매핑
      };

      // 5. 새로운 세션 ID 발급받기
      const sid = await getSessionId();

      // 6. WebSocket 연결
      chatSocket.connect(sid, {
        onOpen: () => {
          isConnected.value = true;
          isLoading.value = false;
          console.log('채팅 서버에 성공적으로 연결되었습니다.');
          messages.value.push({
            id: 'system-1',
            type: 'system',
            text: 'AI 중재봇과의 연결이 완료되었습니다. 계약에 대한 대화를 시작하세요.',
            sender: { userName: 'System', userType: 'client' }, // 시스템 메시지 표기용
            timestamp: new Date().toISOString(),
          });
        },
        onMessage: handleNewMessage,
        onClose: () => {
          isConnected.value = false;
          isLoading.value = false;
          console.log('채팅 서버와의 연결이 끊어졌습니다.');
          messages.value.push({
            id: 'system-2',
            type: 'system',
            text: '서버와의 연결이 종료되었습니다.',
            sender: { userName: 'System', userType: 'client' },
            timestamp: new Date().toISOString(),
          });
        },
        onError: () => {
          isLoading.value = false;
          error.value = 'WebSocket 연결 중 오류가 발생했습니다.';
          console.error(error.value);
        },
      });
    } catch (e) {
      isLoading.value = false;
      error.value = e.message;
      console.error('채팅 초기화 실패:', e);
      // 에러 발생 시 사용자에게 피드백을 주고 다른 페이지로 리디렉션 할 수 있습니다.
      // 예: router.push('/error');
    }
  }

  /**
   * 수신된 WebSocket 메시지를 처리합니다.
   * @param {ReceiveMessagePayload} payload
   */
  function handleNewMessage(payload) {
    if (payload.hd.event === 'llm.response') {
      const { hd, bd } = payload;

      // AI 응답 메시지를 채팅창에 추가
      const aiMessage = {
        id: `ai-${Date.now()}`,
        type: 'message',
        text: bd.text,
        sender: { userName: 'AI Assistant', userType: 'client' }, // AI 메시지 표기용. sender.userType에 따라 정렬되므로 client로 설정
        timestamp: new Date().toISOString(),
      };
      messages.value.push(aiMessage);

      // 계약서 및 진행상황 업데이트
      contractDraft.value = bd.contract_draft;
      step.value = hd.step;
      progress.value = bd.progress_percentage;
    }
  }

  /**
   * 사용자가 입력한 메시지를 서버로 전송합니다.
   * @param {string} text
   */
  function sendMessage(text) {
    if (!isConnected.value || !currentUser.value) {
      console.error('채팅이 연결되지 않았거나 사용자 정보가 없습니다.');
      return;
    }
    const trimmedText = text.trim();
    if (!trimmedText) return;

    // 사용자 메시지를 즉시 UI에 추가 (Optimistic Update)
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'message',
      text: trimmedText,
      sender: currentUser.value,
      timestamp: new Date().toISOString(),
    };
    messages.value.push(userMessage);

    // 서버로 전송할 페이로드 구성
    const payload = {
      hd: {
        sid: chatSocket.sid,
        event: 'llm.invoke',
        role: currentUser.value.userType,
        user_name: currentUser.value.userName,
      },
      bd: {
        text: trimmedText,
      },
    };

    chatSocket.sendMessage(payload);
  }

  /**
   * 채팅 세션을 종료하고 상태를 초기화합니다.
   */
  function cleanup() {
    chatSocket.disconnect();
    messages.value = [];
    contractDraft.value = '';
    step.value = 1;
    progress.value = 0;
    isConnected.value = false;
    currentUser.value = null;
    isLoading.value = false;
    error.value = null;
  }

  return {
    // 읽기 전용 상태 (Readonly State)
    messages: readonly(messages),
    contractDraft: readonly(contractDraft),
    step: readonly(step),
    stepName: readonly(ref(getStepName(step.value))), // computed 대신 readonly ref 사용
    progress: readonly(progress),
    isConnected: readonly(isConnected),
    isLoading: readonly(isLoading),
    error: readonly(error),
    currentUser: readonly(currentUser),

    // 함수 (Actions)
    initialize,
    sendMessage,
    cleanup,
  };
}
