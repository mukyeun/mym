const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query } = require('express-validator');
const { validate } = require('../middleware/validators/commonValidator');
const { exportToExcel } = require('../controllers/healthInfoExportController');

/**
 * 내보내기 유효성 검사 규칙
 */
const exportValidationRules = () => [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('시작일 형식이 올바르지 않습니다'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('종료일 형식이 올바르지 않습니다')
    .custom((endDate, { req }) => {
      if (endDate && req.query.startDate) {
        const start = new Date(req.query.startDate);
        const end = new Date(endDate);
        if (end < start) {
          throw new Error('종료일은 시작일보다 이후여야 합니다');
        }
      }
      return true;
    }),
    
  query('format')
    .optional()
    .isIn(['xlsx', 'csv'])
    .withMessage('지원하지 않는 파일 형식입니다')
];

/**
 * @route   GET /api/health-info/export
 * @desc    건강정보 엑셀 내보내기
 * @access  Private
 */
router.get('/',
  auth,
  exportValidationRules(),
  validate,
  exportToExcel
);

module.exports = router;