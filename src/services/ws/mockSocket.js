// src/services/ws/mockSocket.js

/**
 * 백엔드 웹소켓 서버를 모방하는 가짜 웹소켓 클래스.
 * 실제 서버 연결 없이 프론트엔드 UI 및 로직 테스트를 위해 사용됩니다.
 */
export class MockWebSocket {
  constructor(url) {
    console.log(`[Mock] 가짜 웹소켓이 다음 주소에 연결을 시도합니다: ${url}`);
    this.url = url;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;

    // 0.5초 후 연결 성공(onopen)을 시뮬레이션합니다.
    setTimeout(() => {
      if (this.onopen) {
        console.log('[Mock] 가짜 웹소켓 연결 성공.');
        this.onopen();
      }
    }, 500);
  }

  /**
   * 프론트엔드에서 보내는 메시지를 수신하고 가짜 AI 응답을 생성합니다.
   * @param {string} payloadStr - 프론트엔드에서 JSON.stringify를 통해 보낸 메시지
   */
  send(payloadStr) {
    const payload = JSON.parse(payloadStr);
    console.log(`[Mock] 메시지 수신:`, payload);

    // AI가 생각하는 시간(1.5초)을 시뮬레이션합니다.
    setTimeout(() => {
      if (this.onmessage) {
        // 백엔드가 보낼 법한 가짜 응답 데이터를 구성합니다.
        const mockResponse = {
          hd: {
            event: 'llm.response',
            step: 'work_scope' // 단계 테스트용 고정값
          },
          bd: {
            text: `(가짜 AI 응답) 귀하께서 입력하신 "${payload.bd.text}" 요청을 처리했습니다.`, // Corrected: Escaped inner quotes for template literal
            contract_draft: `## 용역 계약서 (모의 초안)\n\n**제1조 (목적)**\n본 계약은 ...\n\n**제2조 (수정 사항)**\n- 사용자 요청사항: "${payload.bd.text}"\n\n**제3조 (용역 대금)**\n금 일백만원정 (₩1,000,000)`,
            progress_percentage: Math.floor(Math.random() * (80 - 20 + 1)) + 20, // 20~80% 사이의 랜덤 진행률
            meta: {
              step_advance: {
                advance: true,
                source: "시스템 판단",
                reason: "사용자 요청에 따라 작업 범위가 명확해져 다음 단계로 진행합니다."
              },
              question_answered: true
            }
          }
        };

        console.log('[Mock] 가짜 응답 메시지를 보냅니다:', mockResponse);
        // 실제 onmessage 이벤트 핸들러는 Event 객체를 인자로 받으므로, data 속성에 JSON 문자열을 담아 전달합니다.
        this.onmessage({ data: JSON.stringify(mockResponse) });
      }
    }, 1500);
  }

  /**
   * 웹소켓 연결 종료를 시뮬레이션합니다.
   */
  close() {
    console.log('[Mock] 가짜 웹소켓 연결이 종료되었습니다.');
    if (this.onclose) {
      this.onclose();
    }
  }
}
