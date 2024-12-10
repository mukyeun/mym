import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import tokenService from '../utils/tokenService';

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(tokenService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const loginRequestRef = useRef(null);

  // 로그인 처리
  const login = useCallback(async (credentials) => {
    // 이미 진행 중인 요청이 있다면 그 요청을 반환
    if (loginRequestRef.current) {
      return loginRequestRef.current;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 새로운 요청 생성 및 저장
      loginRequestRef.current = api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      // 요청 완료 대기
      const response = await loginRequestRef.current;
      
      const { token, user: userData } = response.data;
      
      // 토큰과 사용자 정보 저장
      tokenService.setToken(token);
      tokenService.setUser(userData);
      setUser(userData);
      setIsAuthenticated(true);

      // 메인 페이지로 이동
      navigate('/');
      
      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || '로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
      loginRequestRef.current = null;  // 요청 참조 초기화
    }
  }, [navigate]);

  // 로그아웃 처리
  const logout = useCallback(() => {
    tokenService.clearAll();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  // 인증 상태 확인
  const checkAuth = useCallback(async () => {
    const token = tokenService.getToken();
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      console.log('Checking auth with token:', token);
      
      const response = await api.get('/api/auth/verify');
      setUser(response.data.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
      return false;
    }
  }, [logout]);

  // 회원가입
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/api/users/register', userData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 사용자 정보 업데이트
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/api/users/profile', profileData);
      const updatedUser = response.data.data;
      
      tokenService.setUser(updatedUser);
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      const errorMessage = err.response?.data?.message || '프로필 업데이트 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 비밀번호 변경
  const changePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post('/api/users/change-password', passwordData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    isAuthenticated,
    checkAuth
  };
};

export default useAuth;