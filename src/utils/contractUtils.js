// src/utils/contractUtils.js

/**
 * 계약 단계 번호를 한글 단계명으로 변환합니다.
 * @param {number} step - 단계 번호 (e.g., 1, 2, 3)
 * @returns {string} 변환된 단계명
 */
export function getStepName(step) {
  const stepNames = {
    1: '계약 조건 협의',
    2: '주요 항목 정의',
    3: '세부 조항 조율',
    4: '법적 검토 요청',
    5: '최종 합의 및 서명 준비',
    // 필요에 따라 단계를 추가하세요.
  };
  return stepNames[step] || '알 수 없는 단계';
}

/**
 * 텍스트를 클립보드에 복사합니다.
 * @param {string} text - 복사할 텍스트
 * @returns {Promise<void>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert('계약서 초안이 클립보드에 복사되었습니다.');
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
    alert('클립보드 복사에 실패했습니다.');
  }
}

/**
 * 텍스트를 .txt 파일로 다운로드합니다.
 * @param {string} text - 다운로드할 텍스트 내용
 * @param {string} filename - 저장할 파일 이름 (기본값: 'contract_draft.txt')
 */
export function downloadAsTxt(text, filename = 'contract_draft.txt') {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
