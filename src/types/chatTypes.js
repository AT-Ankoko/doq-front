// src/types/chatTypes.js

/**
 * @typedef {'client' | 'performer'} UserRole
 */

/**
 * @typedef {object} User
 * @property {string} userName - 사용자 이름
 * @property {UserRole} userType - 사용자 역할
 * @property {string} [company] - 소속 회사 (선택)
 */

/**
 * @typedef {object} Message
 * @property {string} id - 메시지 고유 ID
 * @property {string} text - 메시지 내용
 * @property {User} sender - 발신자 정보
 * @property {string} timestamp - 메시지 발신 시간 (ISO 8601 형식)
 * @property {'message' | 'system'} type - 메시지 타입
 */

/**
 * @typedef {object} SendMessageHd
 * @property {string} sid - 세션 ID
 * @property {'llm.invoke'} event - 이벤트 타입
 * @property {UserRole} role - 현재 사용자 역할
 * @property {string} user_name - 현재 사용자 이름
 */

/**
 * @typedef {object} SendMessageBd
 * @property {string} text - 전송할 메시지 텍스트
 */

/**
 * @typedef {object} SendMessagePayload
 * @property {SendMessageHd} hd
 * @property {SendMessageBd} bd
 */

/**
 * @typedef {object} ReceiveMessageHd
 * @property {'llm.response'} event - 이벤트 타입
 * @property {number} step - 현재 계약 진행 단계
 */

/**
 * @typedef {object} ReceiveMessageBd
 * @property {string} text - AI가 생성한 응답 텍스트
 * @property {number} progress_percentage - 계약 진행률
 * @property {string} contract_draft - AI가 업데이트한 계약서 초안
 */

/**
 * @typedef {object} ReceiveMessagePayload
 * @property {ReceiveMessageHd} hd
 * @property {ReceiveMessageBd} bd
 */

// JSDoc을 위한 빈 export. 실제 런타임에는 사용되지 않음.
export {};
