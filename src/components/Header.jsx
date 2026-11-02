import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import LoginModal from "./modals/LoginModal";
import SignupModal from "./modals/SignupModal";

// 모든 페이지 맨 위에 보이는 공통 헤더 (App.jsx에서 <Routes> 바깥에 둠)
function Header() {
  // 지금 띄워 둔 모달: null = 없음, "login" = 로그인, "signup" = 회원가입
  // (모달이 동시에 두 개 뜨는 일이 없어서 값 하나로 관리)
  const [modal, setModal] = useState(null);
  // 로그인했는지: 저장된 토큰이 있으면 로그인 상태
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("access_token") !== null,
  );

  // LoginModal이 토큰을 저장하면 "authChange" 신호를 보냄 → 받아서 버튼을 바꿈
  // (Home에서 로그인해도 헤더가 바로 바뀌게 하려고)
  useEffect(() => {
    const update = () =>
      setLoggedIn(localStorage.getItem("access_token") !== null);
    window.addEventListener("authChange", update);
    return () => window.removeEventListener("authChange", update);
  }, []);

  // 로그아웃: 저장된 토큰을 지우면 끝 (JWT 방식, 서버 routes/auth.py logout 설명 참고)
  // LoginModal이 저장한 "access_token", "user"를 둘 다 지운다
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setLoggedIn(false);
  };

  return (
    <header>
      {/* a 태그 대신 Link: 클릭해도 페이지가 새로고침되지 않아서 입력 중인 글이 안 사라짐 */}
      <Link to="/">
        <img src="/logo.svg" alt="합격메이트" />
        합격메이트
      </Link>

      {/* NavLink: Link와 같지만, 지금 보고 있는 페이지의 메뉴에 "active" 이름표가 자동으로 붙음 */}
      {/* to 주소는 App.jsx의 Route path와 글자까지 같아야 함 */}
      <nav>
        <NavLink to="/cl">자기소개서</NavLink>
        <NavLink to="/interview">AI 면접</NavLink>
        <NavLink to="/mypage">마이페이지</NavLink>
      </nav>

      {/* 로그인 상태면 로그아웃 버튼, 아니면 로그인/회원가입 버튼 */}
      {/* 버튼을 누르면 modal 값이 바뀌고, 아래에서 그 값에 맞는 모달을 그림 */}
      {loggedIn ? (
        <div>
          <button type="button" onClick={logout}>
            로그아웃
          </button>
        </div>
      ) : (
        <div>
          <button type="button" onClick={() => setModal("login")}>
            로그인
          </button>
          <button type="button" onClick={() => setModal("signup")}>
            회원가입
          </button>
        </div>
      )}

      {/* modal 값이 맞을 때만 모달을 화면에 올림 */}
      {modal === "login" && (
        <LoginModal
          onClose={() => setModal(null)}
          onSwitchToSignup={() => setModal("signup")}
        />
      )}
      {modal === "signup" && (
        <SignupModal
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
    </header>
  );
}

export default Header;