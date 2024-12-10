import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getHealthInfoList, 
  deleteHealthInfo, 
  QUERY_KEYS 
} from '../../api/healthInfo';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './HealthInfoList.css';

function HealthInfoList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const queryClient = useQueryClient();

  // 건강정보 목록 조회 쿼리
  const { 
    data: healthData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [QUERY_KEYS.HEALTH_INFO_LIST, searchTerm],
    queryFn: () => getHealthInfoList({ name: searchTerm }),
    select: (response) => response?.data || []
  });

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: deleteHealthInfo,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.HEALTH_INFO_LIST]);
      alert('삭제되었습니다.');
    },
    onError: (error) => {
      alert(`삭제 실패: ${error.message}`);
    }
  });

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // 데이터 매핑 함수
  const mapHealthInfoData = (item) => {
    return {
      id: item._id,
      날짜: new Date(item.createdAt).toLocaleDateString(),
      이름: item.기본정보?.이름 || '-',
      연락처: item.기본정보?.연락처 || '-',
      나이: item.기본정보?.나이 || '-',
      성별: item.기본정보?.성별 || '-',
      성격: item.기본정보?.성격 || '-',
      BMI: item.기본정보?.BMI || '-',
      스트레스: item.기본정보?.스트레스 || '-',
      노동강도: item.기본정보?.노동강도 || '-',
      증상: Array.from(item.증상선택?.entries() || [])
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ') || '-',
      혈압: item.기본정보?.혈압 || '-',
      복용약물: Array.isArray(item.복용약물) 
        ? item.복용약물.map(약물 => 약물.약물명).join(', ') 
        : (item.복용약물?.약물명 || '-')
    };
  };

  if (isLoading) {
    return <Typography>데이터를 불러오는 중...</Typography>;
  }

  return (
    <div>
      <h2>건강정보 목록</h2>
      <TextField
        value={searchTerm}
        onChange={handleSearchChange}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        placeholder="이름으로 검색"
      />
      {healthData?.map((info) => {
        const mappedInfo = mapHealthInfoData(info);
        return (
          <div key={mappedInfo.id} className="health-info-item">
            <h3>{mappedInfo.이름}</h3>
            <p>날짜: {mappedInfo.날짜}</p>
            <p>연락처: {mappedInfo.연락처}</p>
            <p>나이: {mappedInfo.나이}</p>
            <p>성별: {mappedInfo.성별}</p>
            <p>성격: {mappedInfo.성격}</p>
            <p>BMI: {mappedInfo.BMI}</p>
            <p>스트레스: {mappedInfo.스트레스}</p>
            <p>노동강도: {mappedInfo.노동강도}</p>
            <p>증상: {mappedInfo.증상}</p>
            <p>혈압: {mappedInfo.혈압}</p>
            <p>복용약물: {mappedInfo.복용약물}</p>
            <button onClick={() => {
              if (window.confirm('정말 삭제하시겠습니까?')) {
                deleteMutation.mutate(mappedInfo.id);
              }
            }}>삭제</button>
          </div>
        );
      })}
    </div>
  );
}

export default HealthInfoList;