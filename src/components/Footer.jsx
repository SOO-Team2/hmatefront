// 모든 페이지 맨 아래에 보이는 공통 푸터 (App.jsx에서 <Routes> 바깥에 둠)
function Footer() {
  return (
    <footer>
      <div>
        <img src="/logo.svg" alt="합격메이트" />
        <span>합격메이트</span>
      </div>

      <div>
        <span>이용약관</span>
        <span>개인정보처리방침</span>
      </div>

      <div>
        <p>TEAM2</p>
        <p>문의하기</p>
      </div>

      <p>© 2026 합격메이트. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
