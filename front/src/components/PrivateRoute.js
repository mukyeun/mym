import { Navigate, useLocation } from 'react-router-dom';
import { tokenService } from '../utils/tokenService';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = !!tokenService.getToken();

  // 디버깅을 위한 로그
  console.log('PrivateRoute check:', {
    path: location.pathname,
    isAuthenticated,
    token: tokenService.getToken() ? 'exists' : 'none'
  });

  if (!isAuthenticated) {
    // 현재 경로를 state로 전달하여 로그인 후 원래 페이지로 돌아올 수 있게 함
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default PrivateRoute;