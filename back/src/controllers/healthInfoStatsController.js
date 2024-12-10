const HealthInfo = require('../models/HealthInfo');
const logger = require('../../config/logger');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * 건강정보 통계 조회
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getHealthInfoStats = async (req, res) => {
  try {
    const stats = await HealthInfo.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          avgSystolic: { $avg: '$맥파분석.수축기혈압' },
          avgDiastolic: { $avg: '$맥파분석.이완기혈압' },
          avgPulse: { $avg: '$맥파분석.맥박수' },
          avgWeight: { $avg: '$기본정보.체중' },
          latestRecord: { $max: '$createdAt' }
        }
      }
    ]);

    if (!stats.length) {
      return res.json(successResponse({
        totalCount: 0,
        avgSystolic: 0,
        avgDiastolic: 0,
        avgPulse: 0,
        avgWeight: 0,
        latestRecord: null
      }));
    }

    const result = {
      totalCount: stats[0].totalCount,
      avgSystolic: Math.round(stats[0].avgSystolic || 0),
      avgDiastolic: Math.round(stats[0].avgDiastolic || 0),
      avgPulse: Math.round(stats[0].avgPulse || 0),
      avgWeight: Math.round(stats[0].avgWeight * 10) / 10 || 0,
      latestRecord: stats[0].latestRecord
    };

    logger.info('Health info stats retrieved:', { userId: req.userId, stats: result });
    res.json(successResponse(result));

  } catch (error) {
    logger.error('Get health info stats error:', error);
    res.status(500).json(errorResponse('통계 조회 중 오류가 발생했습니다', 500));
  }
};

/**
 * 기간별 건강정보 통계 조회
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getPeriodStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {
      userId: req.userId,
      createdAt: {}
    };

    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }

    const stats = await HealthInfo.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          avgSystolic: { $avg: '$맥파분석.수축기혈압' },
          avgDiastolic: { $avg: '$맥파분석.이완기혈압' },
          avgPulse: { $avg: '$맥파분석.맥박수' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    logger.info('Period stats retrieved:', {
      userId: req.userId,
      startDate,
      endDate,
      resultCount: stats.length
    });

    res.json(successResponse(stats));

  } catch (error) {
    logger.error('Get period stats error:', error);
    res.status(500).json(errorResponse('기간별 건강정보 통계 조회 중 오류가 발생했습니다', 500));
  }
};

module.exports = {
  getHealthInfoStats,
  getPeriodStats
}; 