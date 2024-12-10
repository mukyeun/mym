import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, verifyToken } from '../api/auth';
import { tokenService } from '../utils/tokenService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 초기 인증 상태 복원
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = tokenService.getToken();
        const savedUser = tokenService.getUser();

        if (token && savedUser) {
          const isValid = await verifyToken();
          if (isValid) {
            setIsAuthenticated(true);
            setUser(savedUser);
          } else {
            tokenService.clearAll();
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('인증 초기화 실패:', error);
        tokenService.clearAll();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    console.group('AuthContext - 로그인 시도');
    console.log('입력된 데이터:', {
      hasEmail: !!credentials?.email,
      hasPassword: !!credentials?.password
    });

    // 입력값 검증
    if (!credentials || !credentials.email || !credentials.password) {
      console.error('유효하지 않은 로그인 데이터');
      throw new Error('이메일과 비밀번호를 입력해주세요.');
    }

    try {
      // API 호출
      const response = await apiLogin(credentials);
      console.log('API 응답 확인:', {
        hasResponse: !!response,
        hasToken: !!response?.token,
        hasUser: !!response?.user
      });

      // 응답 데이터 검증
      if (!response || !response.token || !response.user) {
        throw new Error('유효하지 않은 응답 데이터');
      }

      const { token, user } = response;

      // 상태 업데이트
      setIsAuthenticated(true);
      setUser(user);

      // 토큰 저장
      tokenService.setToken(token);
      tokenService.setUser(user);

      console.log('로그인 성공:', {
        isAuthenticated: true,
        user: user
      });

      return {
        token,
        user
      };
    } catch (error) {
      console.error('로그인 실패:', {
        message: error.message,
        type: error.constructor.name
      });
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      console.groupEnd();
    }
  };

  const logout = () => {
    console.log('AuthContext - 로그아웃 시도');
    apiLogout();
    setIsAuthenticated(false);
    setUser(null);
    tokenService.clearAll();
    console.log('AuthContext - 로그아웃 완료');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  if (loading) {
    return <div>인증 상태 확인 중...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;