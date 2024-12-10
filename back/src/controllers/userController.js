const User = require('../models/User');
const logger = require('../../config/logger');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * 사용자 회로필 조회
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json(errorResponse('사용자를 찾을 수 없습니다', 404));
    }

    logger.info('Profile retrieved:', { userId: user._id });
    res.json(successResponse({ user }));
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json(errorResponse('프로필 조회 중 오류가 발생했습니다', 500));
  }
};

/**
 * 프로필 정보 수정
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const updateProfile = async (req, res) => {
  try {
    const { name, username } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (username) updates.username = username;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json(errorResponse('사용자를 찾을 수 없습니다', 404));
    }

    logger.info('Profile updated:', { userId: user._id });
    res.json(successResponse({ user }, '프로필이 수정되었습니다'));
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(400).json(errorResponse('프로필 수정 중 오류가 발생했습니다', 400));
  }
};

/**
 * 프로필 이미지 업데이트
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(errorResponse('이미지 파일을 선택해주세요', 400));
    }

    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { profileImage: imageUrl } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json(errorResponse('사용자를 찾을 수 없습니다', 404));
    }

    logger.info('Profile image updated:', { userId: user._id });
    res.json(successResponse({ user }, '프로필 이미지가 업데이트되었습니다'));
  } catch (error) {
    logger.error('Update profile image error:', error);
    res.status(500).json(errorResponse('프로필 이미지 업데이트 중 오류가 발생했습니다', 500));
  }
};

/**
 * 계정 삭제
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    
    if (!user) {
      return res.status(404).json(errorResponse('사용자를 찾을 수 없습니다', 404));
    }

    logger.info('Account deleted:', { userId: user._id });
    res.json(successResponse(null, '계정이 삭제되었습니다'));
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json(errorResponse('계정 삭제 중 오류가 발생했습니다', 500));
  }
};

// 명시적인 exports
module.exports = {
    getProfile,
    updateProfile,
    updateProfileImage,
    deleteAccount
};
