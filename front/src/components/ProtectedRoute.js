import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute Check:', { 
    isAuthenticated, 
    isLoading,
    currentPath: location.pathname 
  });

  // 로딩 중에는 아무것도 렌더링하지 않음
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    // 현재 경로를 state로 저장하여 로그인 후 리다이렉트할 수 있도록 함
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;