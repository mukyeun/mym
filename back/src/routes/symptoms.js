const express = require('express');
const router = express.Router();
const Symptom = require('../models/Symptom');
const auth = require('../middleware/auth');
const logger = require('../../config/logger');
const { validate } = require('../middleware/validators/commonValidator');
const { symptomValidationRules } = require('../middleware/validators/symptomValidator');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * @route   GET /api/symptoms
 * @desc    사용자의 모든 증상 조회
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const symptoms = await Symptom.find({ userId: req.user.userId })
      .sort({ date: -1 });
    res.json(successResponse(symptoms, '증상 목록 조회 성공'));
  } catch (err) {
    logger.error('증상 조회 실패:', err);
    res.status(500).json(errorResponse('증상 조회 실패', 500));
  }
});

/**
 * @route   GET /api/symptoms/:id
 * @desc    ID로 증상 조회
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const symptom = await Symptom.findOne({ 
      _id: req.params.id,
      userId: req.user.userId 
    });
    
    if (!symptom) {
      return res.status(404).json(errorResponse('증상을 찾을 수 없습니다', 404));
    }
    
    res.json(successResponse(symptom, '증상 조회 성공'));
  } catch (err) {
    logger.error('증상 조회 실패:', err);
    res.status(500).json(errorResponse('증상 조회 실패', 500));
  }
});

/**
 * @route   POST /api/symptoms
 * @desc    새로운 증상 추가
 * @access  Private
 */
router.post('/', 
  auth, 
  symptomValidationRules(), 
  validate, 
  async (req, res) => {
    try {
      const symptom = new Symptom({
        userId: req.user.userId,
        ...req.body,
        date: req.body.date || new Date()
      });

      const newSymptom = await symptom.save();
      
      logger.info('새로운 증상 기록:', {
        id: newSymptom._id,
        userId: req.user.userId,
        category: newSymptom.category
      });

      res.status(201).json(successResponse(newSymptom, '증상이 기록되었습니다', 201));
    } catch (err) {
      logger.error('증상 생성 실패:', err);
      res.status(400).json(errorResponse('증상 생성 실패', 400));
    }
});

/**
 * @route   PUT /api/symptoms/:id
 * @desc    증상 정보 수정
 * @access  Private
 */
router.put('/:id', 
  auth, 
  symptomValidationRules(), 
  validate, 
  async (req, res) => {
    try {
      const symptom = await Symptom.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user.userId
        },
        req.body,
        { new: true }
      );

      if (!symptom) {
        return res.status(404).json(errorResponse('증상을 찾을 수 없습니다', 404));
      }

      logger.info('증상 정보 수정:', { id: req.params.id });
      res.json(successResponse(symptom, '증상 수정 성공'));
    } catch (err) {
      logger.error('증상 수정 실패:', err);
      res.status(400).json(errorResponse('증상 수정 실패', 400));
    }
});

/**
 * @route   DELETE /api/symptoms/:id
 * @desc    증상 삭제
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const symptom = await Symptom.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!symptom) {
      return res.status(404).json(errorResponse('증상을 찾을 수 없습니다', 404));
    }

    logger.info('증상 삭제:', { id: req.params.id });
    res.json(successResponse(null, '증상이 삭제되었습니다'));
  } catch (err) {
    logger.error('증상 삭제 실패:', err);
    res.status(500).json(errorResponse('증상 삭제 실패', 500));
  }
});

module.exports = router;