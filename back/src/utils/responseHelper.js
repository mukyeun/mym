/**
 * 성공 응답을 위한 표준 포맷
 * @param {*} data - 응답 데이터
 * @param {string} message - 성공 메시지
 * @returns {Object} 표준화된 성공 응답 객체
 */
const successResponse = (data, message = '성공') => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * 에러 응답을 위한 표준 포맷
 * @param {string} message - 에러 메시지
 * @param {number} statusCode - HTTP 상태 코드
 * @param {*} error - 에러 상세 정보 (선택적)
 * @returns {Object} 표준화된 에러 응답 객체
 */
const errorResponse = (message, statusCode = 500, error = null) => {
  const response = {
    success: false,
    message,
    statusCode
  };

  if (error) {
    response.error = error;
  }

  return response;
};

module.exports = {
  successResponse,
  errorResponse
};
