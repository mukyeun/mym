import { healthInfoService } from '../services/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('폼 제출 시작');

  try {
    console.log('제출할 데이터:', formData);
    
    const response = await healthInfoService.create(formData);
    
    console.log('저장 성공:', response);
    // ... 성공 처리
    
  } catch (error) {
    console.error('저장 실패:', error);
    // ... 에러 처리
  }
}; 