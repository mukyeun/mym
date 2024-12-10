/**
 * 성공 응답을 위한 포맷터
 * @param {*} data - 응답 데이터
 * @param {string} message - 성공 메시지
 * @param {number} status - HTTP 상태 코드 (기본값: 200)
 * @returns {Object} 포맷된 응답 객체
 */
const successResponse = (data, message = '성공', status = 200) => ({
  success: true,
  message,
  status,
  data
});

/**
 * 에러 응답을 위한 포맷터
 * @param {string} message - 에러 메시지
 * @param {number} status - HTTP 상태 코드 (기본값: 500)
 * @param {Object} [errors] - 상세 에러 정보 (선택사항)
 * @returns {Object} 포맷된 에러 응답 객체
 */
const errorResponse = (message = '오류가 발생했습니다', status = 500, errors = null) => ({
  success: false,
  message,
  status,
  ...(errors && { errors })
});

module.exports = {
  successResponse,
  errorResponse
};