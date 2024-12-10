import axios from 'axios';
import { tokenService } from '../utils/tokenService';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const endpoints = {
  list: '/health-info',
  create: '/health-info',
  detail: (id) => `/health-info/${id}`,
  update: (id) => `/health-info/${id}`,
  delete: (id) => `/health-info/${id}`,
  multipleDelete: '/health-info/multiple-delete',
  export: '/health-info/export'
};

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
  retries: 3,
});

export const QUERY_KEYS = {
  HEALTH_INFO_LIST: 'healthInfoList'
};

api.interceptors.request.use(
  async (config) => {
    try {
      const token = tokenService.getToken();
      console.log('Request interceptor - Token:', token);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Request headers:', config.headers);
      } else {
        console.warn('No token found');
      }
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('Response interceptor - Error:', error.response?.status);
    
    if (error.response?.status === 401) {
      console.log('Unauthorized access - clearing tokens');
      tokenService.clearAll();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    if (!error.response && error.config && error.config.retries > 0) {
      error.config.retries--;
      return api.request(error.config);
    }
    
    return Promise.reject(error);
  }
);

export const getHealthInfoList = async ({ name = '' } = {}) => {
  try {
    console.log('Fetching health info with token:', tokenService.getToken());
    const response = await api.get('/health-info', {
      params: { name }
    });
    console.log('Health info response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching health info:', error);
    if (error.response) {
      console.error('Server error response:', error.response.data);
    }
    throw error;
  }
};

export const createHealthInfo = async (data) => {
  try {
    console.log('API 저장 요청 시작:', data);
    const response = await api.post(endpoints.create, data);
    console.log('API 저장 응답 성공:', response.data);
    
    const event = new CustomEvent('healthInfoCreated', { 
      detail: response.data 
    });
    window.dispatchEvent(event);
    
    return response.data;
  } catch (error) {
    console.error('API 저장 에러 발생:', error);
    if (error.response) {
      console.error('서버 에러 응답:', error.response.data);
      throw new Error(error.response.data.message || '저장에 실패했습니다.');
    }
    throw error;
  }
};

export const getHealthInfo = async (id) => {
  const response = await api.get(endpoints.detail(id));
  return response.data;
};

export const updateHealthInfo = async (id, data) => {
  const response = await api.put(endpoints.update(id), data);
  return response.data;
};

export const deleteHealthInfo = async (id) => {
  const response = await api.delete(endpoints.delete(id));
  return response.data;
};

export const searchHealthInfo = async (searchParams) => {
  const response = await api.get('/api/health-info/search', { 
    params: searchParams 
  });
  return response.data;
};

export const exportHealthInfo = async (searchParams = {}) => {
  const response = await api.get(endpoints.export, {
    params: searchParams,
    responseType: 'blob'
  });
  return response.data;
};

export const deleteMultipleHealthInfo = async (ids) => {
  const response = await api.post(endpoints.multipleDelete, { ids });
  return response.data;
};

export const getList = getHealthInfoList;

export default api;