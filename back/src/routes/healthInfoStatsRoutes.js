const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query } = require('express-validator');
const { validate } = require('../middleware/validators/commonValidator');
const { 
  getHealthInfoStats, 
  getPeriodStats 
} = require('../controllers/healthInfoStatsController');

/**
 * 날짜 범위 유효성 검사 규칙
 */
const validateDateRange = () => [
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
    })
];

/**
 * @route   GET /api/health-info/stats
 * @desc    전체 건강정보 통계 조회
 * @access  Private
 */
router.get('/', auth, getHealthInfoStats);

/**
 * @route   GET /api/health-info/stats/period
 * @desc    기간별 건강정보 통계 조회
 * @access  Private
 */
router.get('/period',
  auth,
  validateDateRange(),
  validate,
  getPeriodStats
);

module.exports = router; 