// src/services/api/sessionService.js

const API_BASE_URL = 'http://15.152.162.244/doq'; // TODO: 환경 변수로 분리하는 것을 권장합니다.

/**
 * 서버에 새로운 채팅 세션을 요청하고 세션 ID를 받아옵니다.
 * @returns {Promise<string>} 성공 시 세션 ID
 * @throws {Error} API 호출 실패 시
 */
export async function getSessionId() {
  try {
    const response = await fetch(`${API_BASE_URL}/doq/session/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: '서버 응답이 올바르지 않습니다.' }));
      throw new Error(`세션 생성에 실패했습니다: ${errorBody.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.sid) {
      throw new Error('응답에 세션 ID(sid)가 포함되지 않았습니다.');
    }

    console.log('세션이 성공적으로 생성되었습니다. SID:', data.sid);
    return data.sid;

  } catch (error) {
    console.error('세션 ID 요청 중 오류 발생:', error);
    throw error;
  }
}
