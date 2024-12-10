import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting login with:', {
      email: formData.email,
      hasPassword: !!formData.password
    });

    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      await login(formData); // AuthContext의 login 호출
      console.log('로그인 성공 - 리다이렉트');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // 에러 메시지 처리
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         '로그인 중 오류가 발생했습니다.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAccount = () => {
    setFormData({
      email: 'admin@example.com',
      password: 'admin123'
    });
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      
      {error && (
        <div className="error-message" style={{ 
          color: 'red', 
          marginBottom: '1rem',
          padding: '10px',
          backgroundColor: '#ffebee',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">이메일:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            disabled={loading}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">비밀번호:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            disabled={loading}
            required
          />
        </div>

        <button 
          type="submit"
          disabled={loading || !formData.email || !formData.password}
          style={{ 
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <h3>테스트 계정</h3>
        <p>이메일: admin@example.com</p>
        <p>비밀번호: admin123</p>
        <button 
          onClick={handleTestAccount}
          disabled={loading}
          style={{ 
            backgroundColor: '#6c757d',
            color: 'white',
            padding: '0.3rem 0.6rem',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem'
          }}
        >
          테스트 계정으로 채우기
        </button>
      </div>
    </div>
  );
}

export default LoginPage;