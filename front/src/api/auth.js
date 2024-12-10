import axios from 'axios';
import { tokenService } from '../utils/tokenService';

const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
    LOGOUT: '/auth/logout'
  }
};

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const login = async (credentials) => {
  console.group('Auth API - 로그인 시도');
  
  try {
    // 데이터 검증
    if (!credentials?.email || !credentials?.password) {
      console.error('유효하지 않은 로그인 데이터:', {
        hasEmail: !!credentials?.email,
        hasPassword: !!credentials?.password
      });
      throw new Error('이메일과 비밀번호를 입력해주세요.');
    }

    // API 요청 데이터 준비
    const loginData = {
      email: credentials.email.trim(),
      password: credentials.password.trim()
    };

    console.log('API 요청:', {
      endpoint: API_CONFIG.ENDPOINTS.LOGIN,
      email: loginData.email
    });

    // API 호출
    const response = await api.post(API_CONFIG.ENDPOINTS.LOGIN, loginData);

    console.log('서버 응답:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data
    });

    // 응답 데이터 검증
    if (!response.data?.token || !response.data?.user) {
      console.error('유효하지 않은 응답 데이터:', response.data);
      throw new Error('서버 응답 데이터가 올바르지 않습니다.');
    }

    const { token, user } = response.data;

    // 토큰 저장
    tokenService.setToken(token);
    tokenService.setUser(user);

    console.log('로그인 성공:', {
      hasToken: !!token,
      hasUser: !!user
    });

    return { token, user };
  } catch (error) {
    console.error('로그인 실패:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.status === 401) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    throw new Error(
      error.response?.data?.message || 
      error.message || 
      '로그인 중 오류가 발생했습니다.'
    );
  } finally {
    console.groupEnd();
  }
};

// 토큰 검증
export const verifyToken = async () => {
  const token = tokenService.getToken();
  
  if (!token) {
    console.log('토큰 없음');
    return false;
  }

  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.VERIFY);
    return response.data.success;
  } catch (error) {
    console.error('토큰 검증 실패:', error);
    return false;
  }
};

// 로그아웃
export const logout = () => {
  tokenService.clearAll();
  console.log('로그아웃 완료');
};
