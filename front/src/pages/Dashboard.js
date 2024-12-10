import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// 스타일드 컴포넌트
const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 40px auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: #333;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledLink = styled(Link)`
  padding: 8px 16px;
  background-color: #fff;
  color: #4285f4;
  border: 1px solid #4285f4;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #4285f4;
    color: white;
  }
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #d32f2f;
  }
`;

const WelcomeCard = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

// 대시보드 카드 컴포넌트
const DashboardCard = React.memo(({ title, description }) => (
  <Card>
    <h4 style={{ margin: '0 0 10px 0', color: '#444', fontSize: '16px' }}>
      {title}
    </h4>
    <p style={{ color: '#666', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
      {description}
    </p>
  </Card>
));

const Dashboard = () => {
  const { user, logout } = useAuth();

  // 카드 데이터 메모이제이션
  const dashboardCards = useMemo(() => [
    {
      title: '건강정보 입력',
      description: '새로운 건강정보를 입력하세요.',
      link: '/health-info'
    },
    {
      title: '건강정보 목록',
      description: '등록된 건강정보 목록을 확인하세요.',
      link: '/health-info-list'
    },
    {
      title: '통계',
      description: '건강정보 통계를 확인하세요.',
      link: '/statistics'
    }
  ], []);

  const handleLogout = async () => {
    try {
      await logout();
      // 로그아웃 성공 처리
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <Title>대시보드</Title>
        <ButtonGroup>
          <StyledLink to="/profile">프로필 설정</StyledLink>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </ButtonGroup>
      </Header>
      
      <WelcomeCard>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#444', fontSize: '18px' }}>
          환영합니다, {user?.name || '사용자'}님!
        </h3>
        <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>
          이곳에서 다양한 기능을 사용하실 수 있습니다.
        </p>
      </WelcomeCard>

      <CardGrid>
        {dashboardCards.map((card, index) => (
          <Link 
            key={index} 
            to={card.link} 
            style={{ textDecoration: 'none' }}
          >
            <DashboardCard 
              title={card.title}
              description={card.description}
            />
          </Link>
        ))}
      </CardGrid>
    </DashboardContainer>
  );
};

export default Dashboard;