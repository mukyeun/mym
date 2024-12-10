const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

// 유효성 검사 결과를 확인하는 미들웨어
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

// 회이지네이션 검증 규칙
const paginationRules = () => [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('페이지 번호는 1 이상의 정수여야 합니다')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('페이지당 항목 수는 1-100 사이여야 합니다')
];

// 회원가입 검증 규칙
const registerValidationRules = () => [
    body('email').isEmail().withMessage('유효한 이메일을 입력하세요'),
    body('username').isLength({ min: 3 }).withMessage('사용자명은 3자 이상이어야 합니다'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 6자 이상이어야 합니다'),
    body('name').notEmpty().withMessage('이름을 입력하세요')
];

// 로그인 검증 규칙
const loginValidationRules = () => [
    body('email').isEmail().withMessage('유효한 이메일을 입력하세요'),
    body('password').notEmpty().withMessage('비밀번호를 입력하세요')
];

// 프로필 수정 검증 규칙
const profileUpdateValidationRules = () => [
    body('username').optional().isLength({ min: 3 }).withMessage('사용자명은 3자 이상이어야 합니다'),
    body('name').optional().notEmpty().withMessage('이름을 입력하세요')
];

// 날짜 범위 검증 규칙
const validateDateRange = () => [
    query('startDate')
        .optional()
        .isDate()
        .withMessage('유효하지 않은 시작 날짜'),
    query('endDate')
        .optional()
        .isDate()
        .withMessage('유효하지 않은 종료 날짜')
        .custom((endDate, { req }) => {
            if (req.query.startDate && endDate) {
                if (new Date(endDate) < new Date(req.query.startDate)) {
                    throw new Error('종료 날짜는 시작 날짜보다 늦어야 합니다');
                }
            }
            return true;
        })
];

// 날짜 파라미터 검증 규칙
const dateParamValidationRules = () => [
    param('date')
        .isDate()
        .withMessage('올바른 날짜 형식이 아닙니다')
];

// 내보내기 검증 규칙
const exportValidationRules = () => [
    query('format')
        .optional()
        .isIn(['csv', 'json'])
        .withMessage('지원하지 않는 형식입니다'),
    query('startDate')
        .optional()
        .isDate()
        .withMessage('시작 날짜가 올바르지 않습니다'),
    query('endDate')
        .optional()
        .isDate()
        .withMessage('종료 날짜가 올바르지 않습니다')
        .custom((endDate, { req }) => {
            if (req.query.startDate && endDate) {
                if (new Date(endDate) < new Date(req.query.startDate)) {
                    throw new Error('종료 날짜는 시작 날짜보다 늦어야 합니다');
                }
            }
            return true;
        })
];

// 지표 유형 검증 규칙
const validateMetricType = () => [
    param('metric')
        .isIn(['weight', 'blood-pressure', 'steps'])
        .withMessage('지원하지 않는 지표입니다')
];

// multipleDeleteRules 함수 추가
const multipleDeleteRules = () => {
  return [
    body('ids')
      .isArray()
      .withMessage('ids는 배열이어야 합니다')
      .notEmpty()
      .withMessage('삭제할 항목을 선택해주세요')
      .custom((value) => {
        if (!value.every((id) => typeof id === 'string' && id.length === 24)) {
          throw new Error('유효하지 않은 ID가 포함되어 있습니다');
        }
        return true;
      }),
  ];
};

// healthInfoValidationRules 함수 추가
const healthInfoValidationRules = () => {
  return [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('이름은 2-50자 사이여야 합니다'),
    body('기본정보.연락처')
      .optional()
      .matches(/^[0-9-]+$/)
      .withMessage('연락처는 숫자와 하이픈(-)만 포함할 수 있습니다'),
    body('기본정보.성별')
      .optional()
      .isIn(['남성', '여성'])
      .withMessage('성별은 남성 또는 여성이어야 합니다'),
    body('기본정보.신장')
      .optional()
      .isFloat({ min: 0, max: 300 })
      .withMessage('신장은 0-300cm 사이여야 합니다'),
    body('기본정보.체중')
      .optional()
      .isFloat({ min: 0, max: 500 })
      .withMessage('체중은 0-500kg 사이여야 합니다'),
    body('맥파분석.수축기혈압')
      .optional()
      .isInt({ min: 0, max: 300 })
      .withMessage('수축기혈압은 0-300 사이여야 합니다'),
    body('맥파분석.이완기혈압')
      .optional()
      .isInt({ min: 0, max: 200 })
      .withMessage('이완기혈압은 0-200 사이여야 합니다'),
    body('맥파분석.맥박수')
      .optional()
      .isInt({ min: 0, max: 300 })
      .withMessage('맥박수는 0-300 사이여야 합니다'),
    body('증상선택.증상')
      .optional()
      .isArray()
      .withMessage('증상은 배열이어야 합니다'),
    body('복용약물.약물')
      .optional()
      .isArray()
      .withMessage('약물은 배열이어야 합니다'),
    body('복용약물.기호식품')
      .optional()
      .isArray()
      .withMessage('기호식품은 배열이어야 합니다')
  ];
};

// idParamRules 함수 추가
const idParamRules = () => {
  return [
    param('id')
      .isMongoId()
      .withMessage('유효하지 않은 ID 형식입니다')
  ];
};

module.exports = {
    validate,
    paginationRules,
    registerValidationRules,
    loginValidationRules,
    profileUpdateValidationRules,
    validateDateRange,
    dateParamValidationRules,
    exportValidationRules,
    validateMetricType,
    multipleDeleteRules,
    healthInfoValidationRules,
    idParamRules
}; 