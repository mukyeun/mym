const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query } = require('express-validator');
const { validate } = require('../middleware/validators/commonValidator');
const {
  getBloodPressureChart,
  getPulseChart,
  getWeightChart
} = require('../controllers/healthInfoChartController');

/**
 * 차트 데이터 유효성 검사 규칙
 */
const chartValidationRules = () => [
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
 * @route   GET /api/health-info/chart/blood-pressure
 * @desc    혈압 차트 데이터 조회
 * @access  Private
 */
router.get('/blood-pressure',
  auth,
  chartValidationRules(),
  validate,
  getBloodPressureChart
);

/**
 * @route   GET /api/health-info/chart/pulse
 * @desc    맥박 차트 데이터 조회
 * @access  Private
 */
router.get('/pulse',
  auth,
  chartValidationRules(),
  validate,
  getPulseChart
);

/**
 * @route   GET /api/health-info/chart/weight
 * @desc    체중 차트 데이터 조회
 * @access  Private
 */
router.get('/weight',
  auth,
  chartValidationRules(),
  validate,
  getWeightChart
);

module.exports = router; 