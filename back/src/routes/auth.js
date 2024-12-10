const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const logger = require('../../config/logger');

// 테스트용 계정
const TEST_USER = {
  _id: '1',
  email: 'admin@example.com',
  password: 'admin123',
  name: '관리자',
  role: 'admin'
};

// JWT 시크릿 키
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

/**
 * @route   POST /api/auth/login
 * @desc    사용자 로그인
 * @access  Public
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`로그인 시도: ${email}`);

    // 입력값 검증
    if (!email || !password) {
      logger.warn('로그인 실패: 이메일 또는 비밀번호 누락');
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 모두 입력해주세요.'
      });
    }

    // 테스트 계정 검증
    if (email === TEST_USER.email && password === TEST_USER.password) {
      // JWT 토큰 생성
      const token = jwt.sign(
        { 
          id: TEST_USER._id,
          email: TEST_USER.email,
          role: TEST_USER.role
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      logger.info(`로그인 성공: ${email}`);

      // 응답
      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: TEST_USER._id,
            email: TEST_USER.email,
            name: TEST_USER.name,
            role: TEST_USER.role
          }
        }
      });
    }

    logger.warn(`로그인 실패: 잘못된 인증 정보 (${email})`);
    return res.status(401).json({
      success: false,
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      status: 401
    });
  } catch (error) {
    logger.error(`로그인 에러: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      status: 500
    });
  }
});

// 토큰 검증 라우트
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    return res.json({
      success: true,
      data: {
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role
        }
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.',
      status: 401
    });
  }
});

module.exports = router;