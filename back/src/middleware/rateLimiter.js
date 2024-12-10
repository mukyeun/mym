const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const securityConfig = require('../config/security');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Rate Limiter 생성 함수
 * @param {Object} options - Rate Limiter 설정
 * @returns {Function} Rate Limiter 미들웨어
 */
const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: errorResponse(
      options.message || '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
      429
    ),
    handler: (req, res, next, options) => {
      logger.warn('Rate limit exceeded:', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        limit: options.max,
        windowMs: options.windowMs
      });
      res.status(429).json(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // 개발 환경에서는 rate limit 건너뛰기
      return process.env.NODE_ENV === 'development';
    }
  });
};

/**
 * Rate Limiter 설정
 */
const limiters = {
  // 전역 Rate Limiter
  global: createRateLimiter({
    ...securityConfig.rateLimits.global,
    message: '전체 API 요청 제한을 초과했습니다.'
  }),
  
  // 인증 관련 Rate Limiter
  auth: createRateLimiter({
    ...securityConfig.rateLimits.auth,
    message: '인증 시도가 너무 많습니다. 1시간 후 다시 시도해주세요.'
  }),
  
  // API 요청 Rate Limiter
  api: createRateLimiter({
    ...securityConfig.rateLimits.api,
    message: 'API 요청 제한을 초과했습니다.'
  })
};

module.exports = limiters;
