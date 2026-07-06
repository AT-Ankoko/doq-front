/**
 * HTTP 요청을 처리하는 클래스
 * 공통 헤더, 베이스 URL, 에러 핸들링 등을 관리합니다.
 */

class HttpClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
    this.timeout = Number(import.meta.env.VITE_API_TIMEOUT);
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * localStorage에 저장된 토큰을 기본 헤더로 복원
   */
  initializeAuthFromStorage() {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        this.setAuthToken(token);
      }
    } catch (error) {
      console.warn('[HTTP] 저장된 인증 토큰 복원 실패:', error);
    }
  }

  /**
   * Authorization 토큰 설정
   * @param {string} token - 인증 토큰
   */
  setAuthToken(token) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  /**
   * 커스텀 헤더 추가
   * @param {object} headers - 추가할 헤더 객체
   */
  setHeaders(headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * 디버그 로그용 요청 바디 직렬화
   * @param {any} body - 요청 바디
   * @returns {any}
   */
  serializeBodyForLog(body) {
    if (!body) return '';

    if (body instanceof FormData) {
      return Array.from(body.entries()).map(([key, value]) => [
        key,
        value instanceof File ? value.name : value,
      ]);
    }

    if (body instanceof URLSearchParams) {
      return Object.fromEntries(body.entries());
    }

    if (typeof body === 'string') {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }

    return body;
  }

  /**
   * null/undefined를 제거한 객체 반환
   * @param {object} source - 원본 객체
   * @returns {object}
   */
  compactObject(source = {}) {
    return Object.fromEntries(
      Object.entries(source).filter(([, value]) => value !== undefined && value !== null)
    );
  }

  /**
   * 공통 fetch 요청 메서드
   * @param {string} endpoint - API 엔드포인트
   * @param {object} options - fetch 옵션
   * @returns {Promise<any>} - 응답 데이터
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const baseHeaders = (options.headers && !('Content-Type' in options.headers))
      ? (() => { const h = { ...this.defaultHeaders }; delete h['Content-Type']; return h; })()
      : this.defaultHeaders;

    const config = {
      ...options,
      headers: {
        ...baseHeaders,
        ...options.headers,
      },
    };

    // 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      console.log(`[HTTP] ${config.method || 'GET'} ${url}`, this.serializeBodyForLog(config.body));
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // 응답 상태 코드 체크
      if (!response.ok) {
        await this.handleError(response);
      }

      // 응답이 비어있을 경우 처리
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('[HTTP] 요청 타임아웃:', url);
        throw new Error('요청 시간이 초과되었습니다.');
      }
      
      console.error('[HTTP] 요청 실패:', error);
      throw error;
    }
  }

  /**
   * 에러 처리
   * @param {Response} response - fetch 응답 객체
   */
  async handleError(response) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.detail || errorMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }

    // 상태 코드별 처리
    switch (response.status) {
      case 400:
        throw new Error(`잘못된 요청입니다: ${errorMessage}`);
      case 401:
        // 인증 실패 시 메모리/스토리지 토큰 모두 제거
        this.setAuthToken(null);
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        } catch (storageError) {
          console.warn('[HTTP] 인증 정보 스토리지 정리 실패:', storageError);
        }
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      case 403:
        throw new Error('접근 권한이 없습니다.');
      case 404:
        throw new Error('요청한 리소스를 찾을 수 없습니다.');
      case 500:
        throw new Error('서버 오류가 발생했습니다.');
      default:
        throw new Error(errorMessage);
    }
  }

  /**
   * API 요청
   * @param {string} method - HTTP 메서드 ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')
   * @param {string} endpoint - API 엔드포인트
   * @param {object} options - 요청 옵션
   * @param {object} options.body - 요청 본문
   * @param {object} options.params - 쿼리 파라미터
   * @param {boolean} options.isFormData - FormData 여부
   * @param {boolean} options.isUrlEncoded - x-www-form-urlencoded 여부
   * @param {object} options.headers - 추가 헤더
   * @returns {Promise<any>} - 응답 데이터
   */
  async apiRequest(method, endpoint, { body = null, params = null, isFormData = false, isUrlEncoded = false, headers = null } = {}) {
    let url = endpoint;
    
    // 쿼리 파라미터 처리
    if (params) {
      const compactParams = this.compactObject(params);
      const queryString = new URLSearchParams(compactParams).toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }

    const options = {
      method: method.toUpperCase(),
    };

    // FormData 처리
    if (isFormData && body) {
      const headers = { ...this.defaultHeaders };
      delete headers['Content-Type'];
      options.headers = headers;
      options.body = body;
    }
    // URL Encoded 처리
    else if (isUrlEncoded && body) {
      options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...headers,
      };
      options.body = new URLSearchParams(this.compactObject(body));
    }
    // 일반 JSON 데이터 처리
    else if (body) {
      options.body = JSON.stringify(this.compactObject(body));
      if (headers) {
        options.headers = headers;
      }
    } else if (headers) {
      options.headers = headers;
    }

    return this.request(url, options);
  }
}

// 싱글톤 인스턴스 생성 및 export
const httpClient = new HttpClient();
httpClient.initializeAuthFromStorage();

export default httpClient;

// ==================== API 함수 정의 ==================== //

function request(method, endpoint, options) {
  return httpClient.apiRequest(method, endpoint, options);
}

function compact(body = {}) {
  return httpClient.compactObject(body);
}

// ----- 인증 관련 API ----- //
export async function signup(params = {}) {
  return request('POST', '/auth/signup', {
    body: compact({
      name: params.name,
      nickname: params.nickname,
      email: params.email,
      phone: params.phone,
      emailConf: params.emailConf,
      desc: params.desc,
      fileId: params.fileId,
      extra: params.extra,
      provider: params.provider,
      providerId: params.providerId,
      role: params.role,
      password: params.password,
      passwordCheck: params.passwordCheck,
      agreeTerms: params.agreeTerms,
    }),
  });
}

export async function login(params = {}) {
  return request('POST', '/auth/login', {
    body: compact({
      email: params.email,
      password: params.password,
    }),
  });
}

export async function loginWithForm(params = {}) {
  return request('POST', '/auth/token', {
    body: compact({
      username: params.username ?? params.email,
      password: params.password,
    }),
    isUrlEncoded: true,
  });
}

export async function getMe() {
  return request('GET', '/auth/me');
}

export async function checkExists(params = {}) {
  return request('POST', '/auth/exists', {
    body: compact({
      id: params.id,
    }),
  });
}

export async function checkEmail(params = {}) {
  return request('POST', '/auth/checkEmail', {
    body: compact({
      email: params.email,
    }),
  });
}

export async function logout() {
  return request('POST', '/auth/logout');
}

export async function updateMe(params = {}) {
  return request('POST', '/auth/update', {
    body: compact({
      nickname: params.nickname,
      phone: params.phone,
      desc: params.desc,
      fileId: params.fileId,
      extra: params.extra,
      password: params.password,
      passwordNew: params.passwordNew,
      passwordNewCheck: params.passwordNewCheck,
    }),
  });
}


// ----- Basic API ----- //
export async function ping() {
  return request('GET', '/basic/ping');
}

// ----- 세션/채팅 관련 API ----- //
export async function connectSession(params = {}) {
  return request('POST', '/session/connect', {
    body: compact({
      userId: params.userId,
      client_name: params.client_name,
      provider_name: params.provider_name,
      contract_date: params.contract_date,
    }),
  });
}

/**
 * WebSocket 채팅 연결 URL 생성
 * - VITE_WS_BASE_URL이 있으면 우선 사용
 * - 없으면 VITE_API_BASE_URL을 ws/wss 스킴으로 변환해 사용
 * @param {string} sid - 세션 ID
 * @returns {string}
 */
export function getSessionChatWebSocketUrl(sid) {
  if (!sid) {
    throw new Error('sid는 필수입니다.');
  }

  const wsBaseFromEnv = import.meta.env.VITE_WS_BASE_URL;
  const httpBase = import.meta.env.VITE_API_BASE_URL || '';
  const base = (wsBaseFromEnv || httpBase).replace(/\/$/, '');

  if (!base) {
    throw new Error('VITE_API_BASE_URL 또는 VITE_WS_BASE_URL이 설정되어야 합니다.');
  }

  const wsBase = base
    .replace(/^http:\/\//i, 'ws://')
    .replace(/^https:\/\//i, 'wss://');

  return `${wsBase}/session/chat?sid=${encodeURIComponent(sid)}`;
}

// ----- 아카이브 관련 API ----- //
export async function getArchiveSessions(params = {}) {
  return request('GET', '/archive/sessions', {
    params: compact({
      page: params.page,
      size: params.size,
    }),
  });
}

export async function getArchiveSessionDetail(sid) {
  if (!sid) {
    throw new Error('sid는 필수입니다.');
  }
  return request('GET', `/archive/session/${encodeURIComponent(sid)}`);
}


// 사용 예시:
// import { getMyProfile, updateProfile, getMeetings, createMeeting } from '@/common/HttpHandler.js';
//
// // 프로필 조회
// const profile = await getMyProfile();
//
// // 프로필 업데이트
// await updateProfile({ major: '예술공학부', grade: '3학년' });
//
// // 모임 목록 조회
// const meetings = await getMeetings({ page: 1, limit: 10 });
//
// // 모임 생성
// await createMeeting({ title: '점심 모임', description: '같이 밥 먹어요' });