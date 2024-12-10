const express = require('express');
const cors = require('cors');
const healthInfoRoutes = require('./routes/health-info');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// API 라우트 설정
app.use('/api/health-info', healthInfoRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});