import React, { useState, useCallback, useMemo } from 'react';
import HealthInfoForm from '../components/health/HealthInfoForm';
import { 증상카테고리 } from '../data/SymptomCategories';
import { useNavigate } from 'react-router-dom';

const initialFormState = {
  기본정보: {
    이름: '',
    연락처: '',
    주민등록번호: '',
    성별: '',
    신장: '',
    체중: '',
    BMI: '',
    성격: ''
  },
  증상선택: {
    스트레스수준: '',
    노동강도: '',
    증상: []
  },
  맥파분석: {},
  메모: '',
  복용약물: {
    약물: [],
    기호식품: []
  }
};

function HealthInfoPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [selectedCategory, setSelectedCategory] = useState({
    대분류: '',
    중분류: '',
    소분류: ''
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 제출 핸들러
  const handleFormSubmit = useCallback(async (updatedData) => {
    try {
      setIsSubmitting(true);
      console.log('Form data submitted:', updatedData);
      
      // API 호출 또는 데이터 처리 로직
      await new Promise(resolve => setTimeout(resolve, 1000)); // 임시 지연
      
      setFormData(updatedData);
      
      // 성공 이벤트 발생
      window.dispatchEvent(new CustomEvent('healthInfoCreated', { 
        detail: { data: updatedData } 
      }));

      // 목록 페이지로 이동
      navigate('/health-info-list');
      
    } catch (error) {
      console.error('Form submission error:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate]);

  // 폼 초기화 핸들러
  const handleReset = useCallback(() => {
    setFormData(initialFormState);
    setSelectedSymptoms([]);
    setSelectedCategory({
      대분류: '',
      중분류: '',
      소분류: ''
    });
    setValidationErrors({});
  }, []);

  // 증상 카테고리 메모이제이션
  const memoizedSymptomCategories = useMemo(() => 증상카테고리, []);

  // 폼 props 메모이제이션
  const formProps = useMemo(() => ({
    formData,
    setFormData,
    selectedSymptoms,
    setSelectedSymptoms,
    selectedCategory,
    setSelectedCategory,
    onSubmit: handleFormSubmit,
    onReset: handleReset,
    isValid: Object.keys(validationErrors).length === 0,
    validationErrors,
    증상카테고리: memoizedSymptomCategories,
    isSubmitting
  }), [
    formData,
    selectedSymptoms,
    selectedCategory,
    handleFormSubmit,
    handleReset,
    validationErrors,
    memoizedSymptomCategories,
    isSubmitting
  ]);

  return <HealthInfoForm {...formProps} />;
}

export default HealthInfoPage;
