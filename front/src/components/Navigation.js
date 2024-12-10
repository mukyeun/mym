import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <Link to="/login">로그인</Link>
      <Link to="/register">회원가입</Link>
    </nav>
  );
}