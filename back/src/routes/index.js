const express = require('express');
const router = express.Router();

// 파일명에 맞게 import 경로 수정
const authRouter = require('./auth');  // auth.js
const healthInfoRouter = require('./healthInfo');  // healthInfo.js
const symptomsRouter = require('./symptoms');  // symptoms.js
const usersRouter = require('./users');  // users.js

// 라우터 등록
router.use('/auth', authRouter);
router.use('/healthInfo', healthInfoRouter);
router.use('/symptoms', symptomsRouter);
router.use('/users', usersRouter);

module.exports = router;