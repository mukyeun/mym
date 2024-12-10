const User = require('../models/User');
const logger = require('../../config/logger');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * 사용자 회원가입
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const registerUser = async (req, res) => {
  try {
    const { email, username, password, name } = req.body;

    // 이메일 중복 확인
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json(errorResponse('이미 사용 중인 이메일입니다', 400));
    }

    // 사용자 생성 (비밀번호 해싱은 User 모델의 pre save 미들웨어에서 처리)
    const user = await User.create({
      email,
      username,
      password,
      name
    });

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    logger.info('New user registered:', { userId: user._id, email });

    res.status(201).json(successResponse({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name
      }
    }, '회원가입이 완료되었습니다', 201));
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json(errorResponse('회원가입 처리 중 오류가 발생했습니다', 400));
  }
};

/**
 * 사용자 로그인
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 사용자 찾기
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn('Login attempt with non-existent email:', { email });
      return res.status(401).json(errorResponse('이메일 또는 비밀번호가 올바르지 않습니다', 401));
    }

    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Login attempt with incorrect password:', { email });
      return res.status(401).json(errorResponse('이메일 또는 비밀번호가 올바르지 않습니다', 401));
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    logger.info('User logged in:', { userId: user._id, email });

    res.json(successResponse({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name
      }
    }, '로그인되었습니다'));
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json(errorResponse('로그인 처리 중 오류가 발생했습니다', 500));
  }
};

module.exports = {
  registerUser,
  loginUser
};