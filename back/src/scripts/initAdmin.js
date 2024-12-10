const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const initAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 기존 admin 계정 확인
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin account already exists');
      return;
    }

    // 새 admin 계정 생성
    const admin = new User({
      email: 'admin@example.com',
      password: 'admin1234',
      name: '관리자',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin account created successfully');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// 스크립트 실행
initAdmin();