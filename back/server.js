const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const healthInfoRouter = require('./src/routes/healthInfo');
const authRouter = require('./src/routes/auth');

const app = express();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 미들웨어 설정
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 라우트 등록 (URL을 클라이언트 요청과 일치시킴)
app.use('/api/health-info', healthInfoRouter);
app.use('/api/auth', authRouter);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: '서버 에러가 발생했습니다.',
    error: err.message
  });
});

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청하신 리소스를 찾을 수 없습니다.'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;