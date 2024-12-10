const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  profileUpdateValidationRules, 
  validate 
} = require('../middleware/validators/userValidator');
const { 
  updateProfile,
  getProfile,
  deleteAccount 
} = require('../controllers/userController');

/**
 * @route   GET /api/users/profile
 * @desc    사용자 프로필 조회
 * @access  Private
 */
router.get('/profile', auth, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    프로필 업데이트
 * @access  Private
 */
router.put('/profile',
  auth,
  profileUpdateValidationRules(),
  validate,
  updateProfile
);

/**
 * @route   DELETE /api/users/account
 * @desc    계정 삭제
 * @access  Private
 */
router.delete('/account', auth, deleteAccount);

module.exports = router;
