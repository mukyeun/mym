const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseFormatter');

class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  // 상세 에러 로깅
  logger.error('Error occurred:', {
    name: err.name,
    message: err.message,
    status: err.status,
    code: err.code,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });

  // MongoDB 중복 키 에러 처리
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    const message = field === 'username' 
      ? '이미 사용 중인 사용자명입니다'
      : field === 'email'
      ? '이미 사용 중인 이메일입니다'
      : `중복된 값이 존재합니다: ${field}`;
    
    logger.warn('Duplicate key error:', { field, value });
    return res.status(400).json(errorResponse(
      message,
      400,
      { field, code: 11000 }
    ));
  }

  // Validation 에러 처리
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    return res.status(400).json(errorResponse(
      '입력값이 유효하지 않습니다',
      400,
      errors
    ));
  }

  // JWT 에러 처리
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponse(
      '유효하지 않은 토큰입니다',
      401
    ));
  }

  // 기본 에러 응답
  const status = err.status || 500;
  const response = errorResponse(
    err.message || '서버 오류가 발생했습니다',
    status
  );

  res.status(status).json(response);
};

module.exports = {
  AppError,
  errorHandler
};