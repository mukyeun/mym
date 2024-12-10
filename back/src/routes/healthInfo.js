const express = require('express');
const router = express.Router();
const Excel = require('exceljs');
const auth = require('../middleware/auth');
const logger = require('../../config/logger');
const HealthInfo = require('../models/HealthInfo');
const { errorResponse, successResponse } = require('../utils/responseFormatter');
const { multipleDeleteRules, validate } = require('../middleware/validators/commonValidator');
const { healthInfoValidationRules } = require('../middleware/validators/healthInfoValidator');
const { paginationRules, idParamRules } = require('../middleware/validators/commonValidator');

// 모든 라우트에 auth 미들웨어 적용
router.use(auth);

/**
 * @route GET /api/health-info/export
 * @desc 건강정보 엑셀 내보내기
 * @access Private
 */
router.get('/export', async (req, res) => {
  try {
    console.log('GET /health-info/export - User:', req.user);  // 사용자 정보 로깅
    const healthInfos = await HealthInfo.find({ userId: req.userId })
      .lean()
      .sort({ createdAt: -1 });

    if (!healthInfos?.length) {
      return res.status(404).json(errorResponse('내보낼 데이터가 없습니다', 404));
    }

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('건강 정보');

    // 엑셀 컬럼 정의
    worksheet.columns = [
      { header: '날짜', key: 'createdAt', width: 15 },
      { header: '이름', key: '기본정보.이름', width: 10 },
      { header: '연락처', key: '기본정보.연락처', width: 15 },
      { header: '성별', key: '기본정보.성별', width: 8 },
      { header: '신장', key: '기본정보.신장', width: 8 },
      { header: '체중', key: '기본정보.체중', width: 8 },
      { header: '성격', key: '기본정보.성격', width: 10 },
      { header: '스트레스', key: '기본정보.스트레스', width: 10 },
      { header: '노동강도', key: '기본정보.노동강도', width: 10 },
      { header: '수축기혈압', key: '맥파분석.수축기혈압', width: 12 },
      { header: '이완기혈압', key: '맥파분석.이완기혈압', width: 12 },
      { header: '맥박수', key: '맥파분석.맥박수', width: 10 },
      { header: '증상', key: '증상선택.증상', width: 30 },
      { header: '약물', key: '복용약물.약물', width: 30 },
      { header: '기호식품', key: '복용약물.기호식품', width: 30 },
      { header: '메모', key: 'memo', width: 30 }
    ];

    // 데이터 추가
    healthInfos.forEach(info => {
      worksheet.addRow({
        createdAt: info.createdAt ? new Date(info.createdAt).toLocaleDateString('ko-KR') : '',
        '기본정보.이름': info.기본정보?.이름 || '',
        '기본정보.연락처': info.기본정보?.연락처 || '',
        '기본정보.성별': info.기본정보?.성별 || '',
        '기본정보.신장': info.기본정보?.신장 || '',
        '기본정보.체중': info.기본정보?.체중 || '',
        '기본정보.성격': info.기본정보?.성격 || '',
        '기본정보.스트레스': info.기본정보?.스트레스 || '',
        '기본정보.노동강도': info.기본정보?.노동강도 || '',
        '맥파분석.수축기혈압': info.맥파분석?.수축기혈압 || '',
        '맥파분석.이완기혈압': info.맥파분석?.이완기혈압 || '',
        '맥파분석.맥박수': info.맥파분석?.맥박수 || '',
        '증상선택.증상': Array.isArray(info.증상선택?.증상) ? info.증상선택.증상.join(', ') : '',
        '복용약물.약물': Array.isArray(info.복용약물?.약물) ? info.복용약물.약물.join(', ') : '',
        '복용약물.기호식품': Array.isArray(info.복용약물?.기호식품) ? info.복용약물.기호식품.join(', ') : '',
        'memo': info.메모 || ''
      });
    });

    // 스타일 적용
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // 파일 다운로드 설정
    res.setHeader(
      'Content-Type', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename=건건건강정보_${new Date().toISOString().slice(0,10)}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Route error:', error);  // 라우트 에러 로깅
    logger.error('Export error:', error);
    if (!res.headersSent) {
      res.status(500).json(errorResponse('엑셀 파일 생성에 실패했습니다', 500));
    }
  }
});

/**
 * @route POST /api/health-info/multiple-delete
 * @desc 여러 건강정보 삭제
 * @access Private
 */
router.post('/multiple-delete',
  auth,
  multipleDeleteRules(),
  validate,
  async (req, res) => {
    try {
      const { ids } = req.body;
      const result = await HealthInfo.deleteMany({
        _id: { $in: ids },
        userId: req.userId
      });

      if (result.deletedCount === 0) {
        return res.status(404).json(errorResponse('삭제할 데이터를 찾을 수 없습니다', 404));
      }

      logger.info('Multiple health info deleted', {
        count: result.deletedCount,
        userId: req.userId
      });

      res.json(successResponse(
        { deletedCount: result.deletedCount },
        `${result.deletedCount}개의 건강정보가 삭제되었습니다`
      ));
    } catch (error) {
      logger.error('Multiple delete error:', error);
      res.status(500).json(errorResponse('삭제 처리 중 오류가 발생했습니다', 500));
    }
  }
);

/**
 * @route GET /api/health-info
 * @desc 건강정보 목록 조회 (검색 포함)
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    console.log('GET /health-info - User:', req.user);  // 사용자 정보 로깅
    const healthInfos = await HealthInfo.find()
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json(successResponse(
      healthInfos,
      '건강정보 조회 성공'
    ));
  } catch (error) {
    console.error('Route error:', error);  // 라우트 에러 로깅
    logger.error('Error in GET /health-info:', error);
    return res.status(500).json(errorResponse(
      '건강정보 조회 중 오류가 발생했습니다',
      500
    ));
  }
});

// 건강정보 생성
router.post('/', async (req, res) => {
  try {
    const healthInfo = new HealthInfo(req.body);
    const savedHealthInfo = await healthInfo.save();
    
    return res.status(201).json(successResponse(
      savedHealthInfo,
      '건강정보가 성공적으로 저장되었습니다'
    ));
  } catch (error) {
    logger.error('Error saving health info:', error);
    return res.status(500).json(errorResponse(
      '건강정보 저장 중 오류가 발생했습니다',
      500
    ));
  }
});

// 건강정보 상세 조
router.get('/:id',
  auth,
  idParamRules(),
  validate,
  async (req, res) => {
    try {
      const healthInfo = await HealthInfo.findOne({
        _id: req.params.id,
        userId: req.userId
      });

      if (!healthInfo) {
        return res.status(404).json(errorResponse(
          '건강정보를 찾을 수 없습니다',
          404
        ));
      }

      logger.info('Health info retrieved', {
        id: healthInfo._id,
        userId: req.userId,
        name: healthInfo.기본정보?.이름
      });

      res.json(successResponse(
        { healthInfo },
        '건강정보를 조회했습니다'
      ));
    } catch (error) {
      logger.error('Get health info error:', error);
      res.status(500).json(errorResponse(
        '건강정보 조회 중 오류가 발생했습니다',
        500
      ));
    }
  }
);

// 건강정보 수정
router.put('/:id',
  auth,
  idParamRules(),
  healthInfoValidationRules(),
  validate,
  async (req, res) => {
    try {
      const healthInfo = await HealthInfo.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.userId
        },
        req.body,
        { new: true, runValidators: true }
      );

      if (!healthInfo) {
        return res.status(404).json(errorResponse(
          '건강정보를 찾을 수 없습니다',
          404
        ));
      }

      logger.info('Health info updated', {
        id: healthInfo._id,
        userId: req.userId,
        name: healthInfo.기본정보?.이름
      });

      res.json(successResponse(
        { healthInfo },
        '건강정보가 수정되었습니다'
      ));
    } catch (error) {
      logger.error('Update health info error:', error);
      res.status(500).json(errorResponse(
        '건강정보 수정 중 오류가 발생했습니다',
        500
      ));
    }
  }
);

// 건강정보 삭제
router.delete('/:id',
  auth,
  idParamRules(),
  validate,
  async (req, res) => {
    try {
      const healthInfo = await HealthInfo.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId
      });

      if (!healthInfo) {
        return res.status(404).json(errorResponse(
          '건강정보를 찾을 수 없습니다',
          404
        ));
      }

      logger.info('Health info deleted', {
        id: healthInfo._id,
        userId: req.userId,
        name: healthInfo.기본정보?.이름
      });

      res.json(successResponse(
        null,
        '건강정보가 삭제되었습니다'
      ));
    } catch (error) {
      logger.error('Delete health info error:', error);
      res.status(500).json(errorResponse(
        '건강정보 삭제 중 오류가 발생했습니다',
        500
      ));
    }
  }
);

// 테스트용 샘플 데이터 생성 라우트 추가
router.post('/sample', auth, async (req, res) => {
  try {
    const sampleData = {
      userId: req.userId,
      기본정보: {
        이름: '홍길동',
        연락처: '010-1234-5678',
        주민등록번호: '800101-1234567',
        성별: '남',
        신장: 175,
        체중: 70,
        성격: '보통',
        스트레스: '중간',
        노동강도: '중간'
      },
      맥파분석: {
        수축기혈압: 120,
        이완기혈압: 80,
        맥박수: 75
      },
      증상선택: {
        증상: ['두통', '피로']
      },
      복용약물: {
        약물: ['비타민'],
        기호식품: ['커피']
      },
      메모: '샘플 데이터입니다.'
    };

    const healthInfo = new HealthInfo(sampleData);
    await healthInfo.save();

    logger.info('Sample health info created:', {
      id: healthInfo._id,
      userId: req.userId
    });

    res.status(201).json(successResponse(
      healthInfo,
      '샘플 건강정보가 생성되었습니다'
    ));

  } catch (error) {
    logger.error('Sample data creation error:', error);
    res.status(500).json(errorResponse('샘플 데이터 생성 중 오류가 발생했습니다', 500));
  }
});

module.exports = router;