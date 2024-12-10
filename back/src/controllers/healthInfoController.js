const HealthInfo = require('../../models/HealthInfo');
const logger = require('../utils/logger');
const { errorResponse, successResponse } = require('../utils/responseFormatter');

const createHealthInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const healthData = {
      ...req.body,
      userId
    };

    const healthInfo = await HealthInfo.create(healthData);

    logger.debug('Health info created:', { userId, date: healthInfo.date });

    res.status(201).json(successResponse(
      {
        healthInfo: {
          date: healthInfo.date,
          weight: healthInfo.weight,
          height: healthInfo.height
        }
      },
      '건강 정보가 생성되었습니다'
    ));

  } catch (error) {
    logger.error('Health info creation error:', error);

    if (error.code === 11000) {
      return res.status(400).json(errorResponse(
        '해당 날짜의 건강 정보가 이미 존재합니다',
        400
      ));
    }

    res.status(500).json(errorResponse(
      '서버 오류가 발생했습�다',
      500
    ));
  }
};

const getHealthInfoByDate = async (req, res) => {
  try {
    const userId = req.user.userId;
    const date = req.params.date;

    const healthInfo = await HealthInfo.findOne({ 
      userId,
      date: new Date(date)
    });

    if (!healthInfo) {
      return res.status(404).json({
        success: false,
        message: '해당 날짜의 건강 정보를 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      healthInfo: {
        date: healthInfo.date.toISOString().split('T')[0],
        weight: healthInfo.weight,
        height: healthInfo.height
      }
    });

  } catch (error) {
    logger.error('Health info retrieval error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
};

const getHealthInfoList = async (req, res) => {
  try {
    const healthInfos = await HealthInfo.find()
      .sort({ createdAt: -1 });  // 최신순 정렬
    
    logger.info(`Retrieved ${healthInfos.length} health info records`);
    res.json(healthInfos);
  } catch (error) {
    logger.error('Error in getHealthInfoList:', error);
    res.status(500).json({ 
      success: false, 
      message: '건강 정보 목록을 불러오는데 실패했습니다.' 
    });
  }
};

const updateHealthInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const date = req.params.date;
    const updateData = req.body;

    const healthInfo = await HealthInfo.findOne({
      userId,
      date: new Date(date)
    });

    if (!healthInfo) {
      return res.status(404).json({
        success: false,
        message: '해당 날짜의 건강 정보를 찾을 수 없습니다'
      });
    }

    // 허용된 필드만 업데이트
    const allowedUpdates = ['weight', 'height', 'bloodPressure', 'bloodSugar', 'steps', 'sleepHours', 'note'];
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        healthInfo[key] = updateData[key];
      }
    });

    await healthInfo.save();
    logger.debug('Health info updated:', { userId, date });

    res.status(200).json({
      success: true,
      message: '건강 정보가 업데이트되었습니다',
      healthInfo: {
        date: healthInfo.date.toISOString().split('T')[0],
        weight: healthInfo.weight,
        height: healthInfo.height,
        bloodPressure: healthInfo.bloodPressure,
        bloodSugar: healthInfo.bloodSugar,
        steps: healthInfo.steps,
        sleepHours: healthInfo.sleepHours,
        note: healthInfo.note
      }
    });

  } catch (error) {
    logger.error('Health info update error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
};

const deleteHealthInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const date = req.params.date;

    const healthInfo = await HealthInfo.findOneAndDelete({
      userId,
      date: new Date(date)
    });

    if (!healthInfo) {
      return res.status(404).json({
        success: false,
        message: '해당 날짜의 건강 정보를 찾을 수 없습니다'
      });
    }

    logger.debug('Health info deleted:', { userId, date });

    res.status(200).json({
      success: true,
      message: '건강 정보가 삭제되었습니다'
    });

  } catch (error) {
    logger.error('Health info deletion error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
};

module.exports = {
  createHealthInfo,
  getHealthInfoByDate,
  getHealthInfoList,
  updateHealthInfo,
  deleteHealthInfo
};