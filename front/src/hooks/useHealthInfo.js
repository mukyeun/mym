import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useHealthInfo = () => {
  const queryClient = useQueryClient();
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchHealthInfo = async (searchTerm = '') => {
    try {
      // 토큰 체크
      const token = localStorage.getItem('token');
      if (!token) {
        // 토큰이 없으면 로그인 페이지로 리다이렉트
        navigate('/login');
        throw new Error('No authentication token found');
      }

      // axios 인스턴스 생성 (매 요청마다 새로운 토큰으로)
      const api = axios.create({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // URL 구성
      const url = searchTerm 
        ? `/list?searchTerm=${encodeURIComponent(searchTerm)}` 
        : '/list';
      
      console.log('Fetching URL:', url, 'Token:', token);
      const response = await api.get(url);

      console.log('API Response:', response.data);

      if (!response.data) {
        console.warn('No data received');
        return { items: [] };
      }

      const items = Array.isArray(response.data) ? response.data : [response.data];

      return {
        items: items.map(item => ({
          id: item._id || item.id,
          이름: item.이름 || '-',
          연락처: item.연락처 || '-',
          주민등록번호: item.주민등록번호 || '-',
          성별: item.성별 || '-',
          성격: item.성격 || '-',
          BMI지수: item.BMI지수 || '-',
          수축기혈압: item.수축기혈압 || '-',
          이완기혈압: item.이완기혈압 || '-',
          맥박수: item.맥박수 || '-',
          스트레스: item.스트레스 || '-',
          노동강도: item.노동강도 || '-',
          증상: item.증상 || '-',
          복용약물: item.복용약물 || '-'
        }))
      };
    } catch (error) {
      console.error('API Error:', error.response || error);
      throw error;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['healthInfo', localSearchTerm],
    queryFn: () => fetchHealthInfo(localSearchTerm),
    enabled: true,
    staleTime: 1000 * 60,
    retry: 1
  });

  const handleSearch = useCallback(async (term) => {
    console.log('Searching:', term);
    setLocalSearchTerm(term);
    await queryClient.invalidateQueries(['healthInfo']);
    return refetch();
  }, [queryClient, refetch]);

  const refreshData = useCallback(() => {
    setLocalSearchTerm('');
    return refetch();
  }, [refetch]);

  return {
    listData: data || { items: [] },
    isLoading,
    error,
    handleSearch,
    refreshData
  };
};
