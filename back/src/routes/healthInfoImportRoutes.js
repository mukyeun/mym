const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validators/commonValidator');
const { importFromExcel } = require('../controllers/healthInfoImportController');

// 파일 업로드 설정
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
    files: 1 // 단일 파일만 허용
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('엑셀 파일만 업로드 가능합니다'), false);
    }
  }
});

/**
 * @route   POST /api/health-info/import
 * @desc    엑셀 파일에서 건강정보 가져오기
 * @access  Private
 */
router.post('/',
  auth,
  upload.single('file'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '파일이 업로드되지 않았습니다'
      });
    }
    next();
  },
  importFromExcel
);

module.exports = router;