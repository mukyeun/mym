const mongoose = require('mongoose');

const healthInfoSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  },
  기본정보: {
    이름: String,
    연락처: String,
    주민등록번호: String,
    성별: String,
    신장: String,
    체중: String,
    BMI: String,
    성격: String,
    스트레스: String,
    노동강도: String
  },
  맥파분석: {
    수축기혈압: String,
    이완기혈압: String,
    맥박: String
  },
  증상선택: {
    증상: [Object],
    카테고리: {
      대분류: String,
      중분류: String,
      소분류: String
    }
  },
  복용약물: {
    약물: [Object],
    기호식품: [String]
  },
  메모: String
}, {
  timestamps: true
});

const HealthInfo = mongoose.model('HealthInfo', healthInfoSchema);

module.exports = HealthInfo;