const { body } = require('express-validator');

/**
 * 회원가입 유효성 검사 규칙
 * @returns {Array} Validation chain array
 */
const registerValidationRules = () => [
  // 이메일 검증
  body('email')
    .trim()
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다')
    .normalizeEmail(),
  
  // 사용자명 검증
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('사용자명은 3-30자 사이여야 합니다')
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('사용자명은 영문자, 숫자, 언더스코어만 사용할 수 있습니다'),
  
  // 비밀번호 검증
  body('password')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 최소 6자 이상이어야 합니다')
    .matches(/\d/)
    .withMessage('비밀번호는 최소 1개의 숫자를 포함해야 합니다'),
  
  // 이름 검증
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다')
];

/**
 * 로그인 유효성 검사 규칙
 * @returns {Array} Validation chain array
 */
const loginValidationRules = () => [
  // 이메일 검증
  body('email')
    .trim()
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다')
    .normalizeEmail(),
  
  // 비밀번호 검증
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요')
];

/**
 * 프로필 수정 유효성 검사 규칙
 * @returns {Array} Validation chain array
 */
const profileUpdateValidationRules = () => [
  // 이름 검증 (선택)
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다'),
  
  // 사용자명 검증 (선택)
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('사용자명은 3-30자 사이여야 합니다')
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('사용자명은 영문자, 숫자, 언더스코어만 사용할 수 있습니다'),
  
  // 자기소개 검증 (선택)
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('자기소개는 200자를 초과할 수 없습니다')
];

module.exports = {
  registerValidationRules,
  loginValidationRules,
  profileUpdateValidationRules
};