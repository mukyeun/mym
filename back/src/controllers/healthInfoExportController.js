const HealthInfo = require('../models/HealthInfo');
const Excel = require('exceljs');
const logger = require('../../config/logger');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * 건강정보 엑셀 내보내기
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const exportToExcel = async (req, res) => {
  try {
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
        '기본정보.이름': info.기본정보.이름,
        '기본정보.연락처': info.기본정보.연락처,
        '기본정보.성별': info.기본정보.성별,
        '기본정보.신장': info.기본정보.신장,
        '기본정보.체중': info.기본정보.체중,
        '기본정보.성격': info.기본정보.성격,
        '기본정보.스트레스': info.기본정보.스트레스,
        '기본정보.노동강도': info.기본정보.노동강도,
        '맥파분석.수축기혈압': info.맥파분석.수축기혈압,
        '맥파분석.이완기혈압': info.맥파분석.이완기혈압,
        '맥파분석.맥박수': info.맥파분석.맥박수,
        '증상선택.증상': info.증상선택.증상,
        '복용약물.약물': info.복용약물.약물,
        '복용약물.기호식품': info.복용약물.기호식품,
        memo: info.memo
      });
    });

    const filename = `health-info-${new Date().toLocaleDateString('ko-KR')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(workbook.xlsx.writeBuffer());

  } catch (error) {
    logger.error('Health info export error:', error);
    res.status(500).json(errorResponse(
      '서버 오류가 발생했습니다',
      500
    ));
  }
};

module.exports = {
  exportToExcel
}; 