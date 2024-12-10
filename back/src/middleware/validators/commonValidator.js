const { query, param, validationResult, body } = require('express-validator');
const { errorResponse } = require('../../utils/responseFormatter');
const logger = require('../../utils/logger');

/**
 * 유효성 검사 결과를 확인하는 미들웨어
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed:', {
      path: req.path,
      method: req.method,
      errors: errors.array(),
      body: req.body
    });
    return res.status(400).json(errorResponse(
      '입력값이 올바르지 않습니다',
      400,
      errors.array()
    ));
  }
  next();
};

/**
 * 페이지네이션 규칙
 */
const paginationRules = () => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('페이지 번호는 1 이상의 정수여야 합니다')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('페이지당 항목 수는 1-100 사이의 정수여야 합니다')
    .toInt(),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('시작 날짜 형식이 올바르지 않습니다')
    .toDate(),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('종료 날짜 형식이 올바르지 ���습니다')
    .toDate()
];

/**
 * ID 파라미터 규칙
 */
const idParamRules = () => [
  param('id')
    .isMongoId()
    .withMessage('유효하지 않은 ID 형식입니다')
];

/**
 * 다중 삭제 규칙
 */
const multipleDeleteRules = () => [
  body('ids')
    .isArray()
    .withMessage('ids는 배열이어야 합니다')
    .notEmpty()
    .withMessage('삭제할 항목을 선택해주세요')
    .custom((value) => {
      if (!Array.isArray(value) || !value.every(id => /^[0-9a-fA-F]{24}$/.test(id))) {
        throw new Error('유효하지 않은 ID가 포함되어 있습니다');
      }
      return true;
    })
];

module.exports = {
  validate,
  paginationRules,
  idParamRules,
  multipleDeleteRules
};