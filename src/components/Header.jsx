import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import LoginModal from "./modals/LoginModal";
import SignupModal from "./modals/SignupModal";
import FindAccountModal from "./modals/FindAccountModal";

// 모든 페이지 맨 위에 보이는 공통 헤더 (App.jsx에서 <Routes> 바깥에 둠)
function Header() {
  // 지금 띄워 둔 모달: null = 없음, "login" = 로그인, "signup" = 회원가입, "find" = 계정찾기
  // (모달이 동시에 두 개 뜨는 일이 없어서 값 하나로 관리)
  const [modal, setModal] = useState(null);
  // 계정 찾기 모달의 기본 탭: "id" = 아이디 찾기, "pw" = 비밀번호 재설정
  const [findTab, setFindTab] = useState("id");
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
    window.dispatchEvent(new Event("authChange")); //로그아웃 시 홈 화면 교체
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* a 태그 대신 Link: 클릭해도 페이지가 새로고침되지 않아서 입력 중인 글이 안 사라짐 */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xl font-extrabold text-gray-900 tracking-tight"
        >
          <img src="/logo.svg" alt="합격메이트" className="w-8 h-8 rounded-lg" />
          합격 메이트
        </Link>

        {/* NavLink: Link와 같지만, 지금 보고 있는 페이지의 메뉴에 "active" 이름표가 자동으로 붙음 */}
        {/* to 주소는 App.jsx의 Route path와 글자까지 같아야 함 */}
        <nav className="flex items-center gap-1 sm:gap-2 mr-auto ml-6 sm:ml-10">
          <NavLink
            to="/cl"
            className={({ isActive }) =>
              isActive
                ? "px-3.5 py-2 rounded-xl bg-brand-light text-brand font-bold text-sm transition-colors"
                : "px-3.5 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium text-sm transition-colors"
            }
          >
            자기소개서
          </NavLink>
          <NavLink
            to="/interview"
            className={({ isActive }) =>
              isActive
                ? "px-3.5 py-2 rounded-xl bg-brand-light text-brand font-bold text-sm transition-colors"
                : "px-3.5 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium text-sm transition-colors"
            }
          >
            AI 면접
          </NavLink>
          <NavLink
            to="/mypage"
            className={({ isActive }) =>
              isActive
                ? "px-3.5 py-2 rounded-xl bg-brand-light text-brand font-bold text-sm transition-colors"
                : "px-3.5 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium text-sm transition-colors"
            }
          >
            마이페이지
          </NavLink>
        </nav>

        {/* 로그인 상태면 로그아웃 버튼, 아니면 로그인/회원가입 버튼 */}
        {/* 버튼을 누르면 modal 값이 바뀌고, 아래에서 그 값에 맞는 모달을 그림 */}
        {loggedIn ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModal("login")}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setModal("signup")}
              className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors"
            >
              회원가입
            </button>
          </div>
        )}
      </div>

      {/* modal 값이 맞을 때만 모달을 화면에 올림 */}
      {modal === "login" && (
        <LoginModal
          onClose={() => setModal(null)}
          onSwitchToSignup={() => setModal("signup")}
          onSwitchToFind={(tab) => {
            setFindTab(tab);
            setModal("find");
          }}
        />
      )}
      {modal === "signup" && (
        <SignupModal
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
      {modal === "find" && (
        <FindAccountModal
          initialTab={findTab}
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
    </header>
  );
}

export default Header;
