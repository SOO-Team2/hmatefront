import { useState } from "react";
import { Link, NavLink } from "react-router";
import LoginModal from "./modals/LoginModal";
import SignupModal from "./modals/SignupModal";

// 모든 페이지 맨 위에 보이는 공통 헤더 (App.jsx에서 <Routes> 바깥에 둠)
function Header() {
  // 지금 띄워 둔 모달: null = 없음, "login" = 로그인, "signup" = 회원가입
  // (모달이 동시에 두 개 뜨는 일이 없어서 값 하나로 관리)
  const [modal, setModal] = useState(null);

  return (
    <header>
      {/* a 태그 대신 Link: 클릭해도 페이지가 새로고침되지 않아서 입력 중인 글이 안 사라짐 */}
      <Link to="/">
        <img src="/logo.svg" alt="합격 메이트" />
        합격 메이트
      </Link>

      {/* NavLink: Link와 같지만, 지금 보고 있는 페이지의 메뉴에 "active" 이름표가 자동으로 붙음 */}
      {/* to 주소는 App.jsx의 Route path와 글자까지 같아야 함 */}
      <nav>
        <NavLink to="/cl">자기소개서</NavLink>
        <NavLink to="/interview">AI 면접</NavLink>
        <NavLink to="/mypage">마이페이지</NavLink>
      </nav>

      {/* 버튼을 누르면 modal 값이 바뀌고, 아래에서 그 값에 맞는 모달을 그림 */}
      <div>
        <button type="button" onClick={() => setModal("login")}>
          로그인
        </button>
        <button type="button" onClick={() => setModal("signup")}>
          회원가입
        </button>
      </div>

      {/* modal 값이 맞을 때만 모달을 화면에 올림 */}
      {/* TODO: 모달 안의 닫기/로그인↔회원가입 전환은 모달이 값을 받게 만든 뒤에 연결 */}
      {modal === "login" && <LoginModal />}
      {modal === "signup" && <SignupModal />}
    </header>
  );
}

export default Header;
