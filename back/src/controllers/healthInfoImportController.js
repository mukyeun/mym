const HealthInfo = require('../models/HealthInfo');
const Excel = require('exceljs');
const logger = require('../../config/logger');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * 엑셀 파일에서 건강정보 가져오기
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const importFromExcel = async (req, res) => {
  try {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.getWorksheet(1);
    const headers = worksheet.getRow(1).values;
    
    // 필수 컬럼 확인
    const requiredColumns = ['이름', '연락처', '성별'];
    const missingColumns = requiredColumns.filter(col => 
      !headers.some(header => header?.includes(col))
    );

    if (missingColumns.length > 0) {
      return res.status(400).json(errorResponse(
        `필수 컬럼이 누락되었습니다: ${missingColumns.join(', ')}`,
        400
      ));
    }

    const importedData = [];
    let successCount = 0;
    let errorCount = 0;

    // 데이터 행 처리
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // 헤더 행 스킵

      try {
        const rowData = {
          userId: req.userId,
          기본정보: {
            이름: row.getCell('기본정보.이름').value || '',
            연락처: row.getCell('기본정보.연락처').value || '',
            성별: row.getCell('기본정보.성별').value || '',
            신장: parseFloat(row.getCell('기본정보.신장').value) || null,
            체중: parseFloat(row.getCell('기본정보.체중').value) || null,
            성격: row.getCell('기본정보.성격').value || '',
            스트레스: row.getCell('기본정보.스트레스').value || '',
            노동강도: row.getCell('기본정보.노동강도').value || ''
          },
          맥파분석: {
            수축기혈압: parseInt(row.getCell('맥파분석.수축기혈압').value) || null,
            이완기혈압: parseInt(row.getCell('맥파분석.이완기혈압').value) || null,
            맥박수: parseInt(row.getCell('맥파분석.맥박수').value) || null
          },
          증상선택: {
            증상: row.getCell('증상선택.증상').value?.split(',').map(s => s.trim()) || []
          },
          복용약물: {
            약물: row.getCell('복용약물.약물').value?.split(',').map(s => s.trim()) || [],
            기호식품: row.getCell('복용약물.기호식품').value?.split(',').map(s => s.trim()) || []
          },
          메모: row.getCell('memo').value || ''
        };

        if (rowData.기본정보.이름 && rowData.기본정보.연락처 && rowData.기본정보.성별) {
          importedData.push(rowData);
          successCount++;
        } else {
          errorCount++;
          logger.warn('Invalid row data:', { rowNumber, data: rowData });
        }
      } catch (error) {
        errorCount++;
        logger.error('Row processing error:', { rowNumber, error: error.message });
      }
    });

    if (importedData.length === 0) {
      return res.status(400).json(errorResponse('가져올 수 있는 유효한 데이터가 없습니다', 400));
    }

    // 데이터 저장
    await HealthInfo.insertMany(importedData);

    logger.info('Excel import completed:', {
      userId: req.userId,
      totalRows: successCount + errorCount,
      successCount,
      errorCount
    });

    res.json(successResponse({
      totalProcessed: successCount + errorCount,
      successCount,
      errorCount
    }, '데이터 가져오기가 완료되었습니다'));

  } catch (error) {
    logger.error('Import from Excel error:', error);
    res.status(500).json(errorResponse('데이터 가져오기에 실패했습니다', 500));
  }
};

module.exports = {
  importFromExcel
}; 