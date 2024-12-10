import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// URL 파라미터 인코딩 함수
const encodeQueryParams = (params) => {
  return Object.keys(params).reduce((acc, key) => {
    if (params[key] != null) {
      acc[key] = encodeURIComponent(params[key]);
    }
    return acc;
  }, {});
};

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // URL 정규화
    let url = config.url || '';
    url = url.replace(/^\/+/, '');  // 앞쪽 슬래시 제거
    
    // 'health-info'를 'healthInfo'로 변경
    url = url.replace(/health-info/g, 'healthInfo');
    
    // URL 구성 (슬래시 추가)
    config.url = url;
    
    // 디버깅을 위한 로그
    console.log('Request URL transformation:', {
      original: config.url,
      transformed: url,
      fullURL: `${config.baseURL}/${url}`
    });
    
    // URL 파라미터 인코딩
    if (config.params) {
      config.params = encodeQueryParams(config.params);
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 디버깅을 위한 로그
    const fullURL = `${config.baseURL}/${config.url}`.replace(/([^:]\/)\/+/g, '$1');
    console.log('Final Request:', {
      url: config.url,
      baseURL: config.baseURL,
      params: config.params,
      fullURL: fullURL
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized access, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 관련 서비스
export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Raw login response:', response);
      
      const { data } = response;
      const token = data.data?.token || data.token;
      const userId = data.data?.userId || data.userId;
      
      console.log('Extracted token data:', { token, userId });

      if (!token) {
        throw new Error('인증 토큰 없습니다.');
      }

      // 토큰 저장
      localStorage.setItem('token', token);
      
      // 사용자 정보 저장
      const userData = {
        id: userId,
        email: credentials.email
      };
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('Stored auth data:', {
        hasToken: !!localStorage.getItem('token'),
        hasUser: !!localStorage.getItem('user')
      });
      
      return {
        token,
        user: userData
      };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  },

  // 회원가입
  async register(userData) {
    try {
      const fullUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/users/register`;
      console.log('Attempting to register at:', fullUrl);
      console.log('With data:', userData);
      
      const response = await api.post('/users/register', userData);
      console.log('Register success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Register error:', {
        url: `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/users/register`,
        error: error,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.');
    }
  },

  // 로그아웃
  async logout() {
    try {
      await api.post('/users/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('로그아웃 에러:', error);
      throw new Error(error.response?.data?.message || '로그아웃에 실패했습니다.');
    }
  },

  // 토큰 검증
  async verifyToken() {
    try {
      const response = await api.get('/users/verify');
      return response.data;
    } catch (error) {
      console.error('토큰 검증 에러:', error);
      throw new Error(error.response?.data?.message || '인증에 실패했습니다.');
    }
  }
};

// 건강 정보 관련 서비스
export const healthInfoService = {
  getList: async (params = {}) => {
    try {
      const response = await api.get('/healthInfo', { params });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // 건강 정보 생성
  create: async (data) => {
    try {
      console.log('Creating health info with data:', data);
      const response = await api.post('/healthInfo', data);
      console.log('Health info creation response:', response);
      return response.data;
    } catch (error) {
      console.error('Health info create error:', error);
      throw error;
    }
  },

  // 건강 정보 수정
  async update(id, data) {
    try {
      const response = await api.put(`/healthInfo/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Health info update error:', error);
      throw new Error(error.response?.data?.message || '건강정보 수정에 실패했습니다.');
    }
  },

  // 건강 정보 삭제
  async delete(id) {
    try {
      await api.delete(`/healthInfo/${id}`);
    } catch (error) {
      console.error('Health info delete error:', error);
      throw new Error(error.response?.data?.message || '건강정보 삭제에 실패했습니다.');
    }
  }
};

// API 서비스 구조화 - 경 수정
const healthInfoAPI = {
  create: (data) => api.post('/healthInfo', data),
  update: (id, data) => api.put(`/healthInfo/${id}`, data),
  delete: (id) => api.delete(`/healthInfo/${id}`),
  get: (id) => api.get(`/healthInfo/${id}`),
  list: (params) => api.get('/healthInfo', { params })
};

export default {
  auth: authService,
  healthInfo: healthInfoService
};