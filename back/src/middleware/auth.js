const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHelper');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);  // 헤더 로깅

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header');  // 헤더 없음 로깅
      return res.status(401).json(errorResponse('인증 토큰이 없습니다'));
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Received token:', token);  // 토큰 로깅

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);  // 디코딩된 토큰 로깅
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification error:', error);  // 토큰 검증 에러 로깅
      return res.status(401).json(errorResponse('유효하지 않은 토큰입니다'));
    }
  } catch (error) {
    console.error('Auth middleware error:', error);  // 기타 에러 로깅
    return res.status(500).json(errorResponse('서버 에러가 발생했습니다'));
  }
};

module.exports = auth;