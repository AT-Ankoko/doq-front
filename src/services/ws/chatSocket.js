// src/services/ws/chatSocket.js

/**
 * @typedef {import('@/types/chatTypes').SendMessagePayload} SendMessagePayload
 * @typedef {import('@/types/chatTypes').ReceiveMessagePayload} ReceiveMessagePayload
 */

const WEBSOCKET_URL = 'ws://localhost:8000/ws/chat'; // TODO: 환경 변수로 분리

/**
 * WebSocket 통신을 관리하는 클래스
 */
class ChatSocket {
  /** @type {WebSocket | null} */
  socket = null;

  /** @type {string | null} */
  sid = null;

  /** @type {() => void} */
  onOpen = () => {};

  /** @type {(event: MessageEvent) => void} */
  onMessage = () => {};

  /** @type {(event: CloseEvent) => void} */
  onClose = () => {};

  /** @type {(event: Event) => void} */
  onError = () => {};

  /**
   * WebSocket 서버에 연결합니다.
   * @param {string} sid - 연결에 사용할 세션 ID
   * @param {object} callbacks - 이벤트 콜백 함수 객체
   * @param {() => void} callbacks.onOpen - 연결 성공 시 콜백
   * @param {(payload: ReceiveMessagePayload) => void} callbacks.onMessage - 메시지 수신 시 콜백
   * @param {(event: CloseEvent) => void} callbacks.onClose - 연결 종료 시 콜백
   * @param {(event: Event) => void} callbacks.onError - 에러 발생 시 콜백
   */
  connect(sid, { onOpen, onMessage, onClose, onError }) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.warn('WebSocket이 이미 연결되어 있습니다.');
      return;
    }

    this.sid = sid;
    const url = `${WEBSOCKET_URL}?sid=${this.sid}`;
    this.socket = new WebSocket(url);

    this.onOpen = onOpen;
    this.onMessage = this.createMessageHandler(onMessage);
    this.onClose = onClose;
    this.onError = onError;

    this.socket.addEventListener('open', this.onOpen);
    this.socket.addEventListener('message', this.onMessage);
    this.socket.addEventListener('close', this.onClose);
    this.socket.addEventListener('error', this.onError);

    console.log(`WebSocket 서버에 연결을 시도합니다... (URL: ${url})`);
  }

  /**
   * 서버로 메시지를 전송합니다.
   * @param {SendMessagePayload} payload - 전송할 메시지 페이로드
   */
  sendMessage(payload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket이 연결되어 있지 않습니다. 메시지를 보낼 수 없습니다.');
      return;
    }
    this.socket.send(JSON.stringify(payload));
  }

  /**
   * WebSocket 연결을 종료합니다.
   */
  disconnect() {
    if (this.socket) {
      this.socket.removeEventListener('open', this.onOpen);
      this.socket.removeEventListener('message', this.onMessage);
      this.socket.removeEventListener('close', this.onClose);
      this.socket.removeEventListener('error', this.onError);
      this.socket.close();
      this.socket = null;
      console.log('WebSocket 연결이 종료되었습니다.');
    }
  }

  /**
   * 수신된 메시지를 파싱하고 콜백을 호출하는 핸들러를 생성합니다.
   * @private
   * @param {(payload: ReceiveMessagePayload) => void} callback
   * @returns {(event: MessageEvent) => void}
   */
  createMessageHandler(callback) {
    return (event) => {
      try {
        const payload = JSON.parse(event.data);
        callback(payload);
      } catch (error) {
        console.error('수신된 WebSocket 메시지 파싱 중 오류 발생:', error);
      }
    };
  }
}

// 싱글톤 인스턴스로 export하여 애플리케이션 전체에서 동일한 소켓을 사용하도록 함
export const chatSocket = new ChatSocket();
