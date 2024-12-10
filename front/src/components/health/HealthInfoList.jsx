import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getHealthInfoList, 
  deleteHealthInfo, 
  QUERY_KEYS 
} from '../../api/HealthInfo';

function HealthInfoList() {
  const queryClient = useQueryClient();

  // 건강정보 목록 조회 쿼리
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [QUERY_KEYS.HEALTH_INFO_LIST],
    queryFn: () => getHealthInfoList(),
    select: (data) => {
      if (!data?.items) return data;
      return {
        ...data,
        items: data.items.map(item => ({
          ...item,
          복용약물: {
            약물: Array.isArray(item.복용약물?.약물) ? item.복용약물.약물 : [],
            기호식품: Array.isArray(item.복용약물?.기호식품) ? item.복용약물.기호식품 : []
          }
        }))
      };
    }
  });

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: deleteHealthInfo,
    onSuccess: () => {
      // 삭제 성공 시 목록 갱신
      queryClient.invalidateQueries([QUERY_KEYS.HEALTH_INFO_LIST]);
      alert('삭제되었습니다.');
    },
    onError: (error) => {
      alert(`삭제 실패: ${error.message}`);
    }
  });

  // 삭제 핸들러
  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  // 백엔드 데이터를 프론트엔드 형식으로 매핑하는 함수 수정
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

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div>
      <h2>건강정보 목록</h2>
      {data?.items?.map((info) => (
        <div key={info._id}>
          <h3>{info.기본정보.이름}</h3>
          <p>연락처: {info.기본정보.연락처}</p>
          <button onClick={() => handleDelete(info._id)}>삭제</button>
        </div>
      ))}
    </div>
  );
}

export default HealthInfoList;