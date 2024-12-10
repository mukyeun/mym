const HealthInfo = require('../models/HealthInfo');
const logger = require('../../config/logger');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * 혈압 차트 데이터 조회
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getBloodPressureChart = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.userId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const data = await HealthInfo.find(query)
      .select('createdAt 맥파분석.수축기혈압 맥파분석.이완기혈압')
      .sort('createdAt')
      .lean();

    const chartData = data.map(item => ({
      date: item.createdAt,
      systolic: item.맥파분석?.수축기혈압 || null,
      diastolic: item.맥파분석?.이완기혈압 || null
    }));

    logger.info('Blood pressure chart data retrieved:', {
      userId: req.userId,
      dataPoints: chartData.length
    });

    res.json(successResponse(chartData));
  } catch (error) {
    logger.error('Get blood pressure chart error:', error);
    res.status(500).json(errorResponse('차트 데이터 조회 중 오류가 발생했습니다', 500));
  }
};

/**
 * 맥박 차트 데이터 조회
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getPulseChart = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.userId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const data = await HealthInfo.find(query)
      .select('createdAt 맥파분석.맥박수')
      .sort('createdAt')
      .lean();

    const chartData = data.map(item => ({
      date: item.createdAt,
      pulse: item.맥파분석?.맥박수 || null
    }));

    logger.info('Pulse chart data retrieved:', {
      userId: req.userId,
      dataPoints: chartData.length
    });

    res.json(successResponse(chartData));
  } catch (error) {
    logger.error('Get pulse chart error:', error);
    res.status(500).json(errorResponse('차트 데이터 조회 중 오류가 발생했습니다', 500));
  }
};

/**
 * 체중 차트 데이터 조회
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getWeightChart = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.userId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const data = await HealthInfo.find(query)
      .select('createdAt 기본정보.체중')
      .sort('createdAt')
      .lean();

    const chartData = data.map(item => ({
      date: item.createdAt,
      weight: item.기본정보?.체중 || null
    }));

    logger.info('Weight chart data retrieved:', {
      userId: req.userId,
      dataPoints: chartData.length
    });

    res.json(successResponse(chartData));
  } catch (error) {
    logger.error('Get weight chart error:', error);
    res.status(500).json(errorResponse('차트 데이터 조회 중 오류가 발생했습니다', 500));
  }
};

module.exports = {
  getBloodPressureChart,
  getPulseChart,
  getWeightChart
};