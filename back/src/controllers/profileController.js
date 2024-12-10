const User = require('../../models/User');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;
const {successResponse, errorResponse } = require('../utils/responseFormatter');

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = {};
    const allowedFields = ['name', 'username', 'bio', 'birthDate', 'isPublic'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.username) {
      const existingUser = await User.findOne({ 
        username: updateData.username,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json(errorResponse(
          '이미 사용 중인 사용자 이름입니다',
          400
        ));
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorResponse(
        '사용자를 찾을 수 없습니다',
        404
      ));
    }

    Object.assign(user, updateData);
    await user.save();

    const userResponse = {
      name: user.name,
      username: user.username,
      bio: user.bio,
      birthDate: user.birthDate,
      isPublic: user.isPublic,
      profileImage: user.profileImage
    };

    res.json(successResponse(
      { user: userResponse },
      '프로필이 업데이트되었습니다'
    ));

  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json(errorResponse(
      '서버 오류가 발생했습니다',
      500
    ));
  }
};

const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(errorResponse(
        '이미지 파일이 필요합니다',
        400
      ));
    }

    const userId = req.user.userId;
    const imageUrl = '/uploads/' + req.file.filename;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorResponse(
        '사용자를 찾을 수 없습니다',
        404
      ));
    }

    user.profileImage = imageUrl;
    await user.save();

    const response = successResponse(
      { user: { profileImage: user.profileImage } },
      '프로필 이미지가 업데이트되었습니다'
    );
    
    logger.info('Profile image updated:', response);
    res.json(response);

  } catch (error) {
    logger.error('Profile image update error:', error);
    res.status(500).json(errorResponse(
      '서버 오류가 발생했습니다',
      500
    ));
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json(errorResponse(
        '사용자를 찾을 수 없습니다',
        404
      ));
    }

    if (!user.profileImage) {
      return res.status(400).json(errorResponse(
        '삭제할 프로필 이미지가 없습니다',
        400
      ));
    }

    const imagePath = path.join(__dirname, '../../', user.profileImage);
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      logger.error('File deletion error:', error);
    }

    user.profileImage = null;
    await user.save();

    res.json(successResponse(
      { user: { profileImage: user.profileImage } },
      '프로필 이미지가 삭제되었습니다'
    ));

  } catch (error) {
    logger.error('Profile image deletion error:', error);
    res.status(500).json(errorResponse(
      '서버 오류가 발생했습니다',
      500
    ));
  }
};

const updatePrivacy = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { isPublic } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorResponse(
        '사용자를 찾을 수 없습니다',
        404
      ));
    }

    user.isPublic = isPublic;
    await user.save();

    res.json(successResponse(
      { user: { isPublic: user.isPublic } },
      '프로필 공개 설정이 업데이트되었습니다'
    ));

  } catch (error) {
    logger.error('Privacy update error:', error);
    res.status(500).json(errorResponse(
      '서버 오류가 발생했습니다',
      500
    ));
  }
};

const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const requestingUserId = req.user.userId;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json(errorResponse(
        '사용자를 찾을 수 없습니다',
        404
      ));
    }

    if (!user.isPublic && user._id.toString() !== requestingUserId) {
      return res.status(403).json(errorResponse(
        '비공개 프로필입니다',
        403
      ));
    }

    const profileData = {
      name: user.name,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
      isPublic: user.isPublic
    };

    res.json(successResponse({ user: profileData }));

  } catch (error) {
    logger.error('Profile retrieval error:', error);
    res.status(500).json(errorResponse(
      '서버 오류가 발생했습니다',
      500
    ));
  }
};

module.exports = {
  updateProfile,
  updateProfileImage,
  deleteProfileImage,
  updatePrivacy,
  getProfile
}; 