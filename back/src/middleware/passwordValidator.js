const logger = require('../../utils/logger');
const { errorResponse } = require('../../utils/responseFormatter');

/**
 * 비밀번호 유효성 검사 함수
 * @param {string} password - 검사할 비밀번호
 * @returns {boolean} 유효성 검사 결과
 */
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

/**
 * 비밀번호 유효성 검사 미들웨어
 */
const passwordValidator = (req, res, next) => {
  const { password } = req.body;

  if (!validatePassword(password)) {
    logger.warn('Password validation failed', {
      ip: req.ip,
      path: req.path
    });

    return res.status(400).json(errorResponse(
      '비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
      400
    ));
  }

  next();
};

module.exports = { passwordValidator };
