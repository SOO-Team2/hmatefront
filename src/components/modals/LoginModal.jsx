import { useState } from "react";
import { useNavigate } from "react-router";
import Modal from "./Modal";

// ---------------------------------------------------------------------------
// 1. 서버 설정
// ---------------------------------------------------------------------------
// FastAPI 백엔드 주소 (환경변수가 없으면 기본 로컬 서버 사용)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function LoginModal({ onClose, onSwitchToSignup, onSwitchToFind }) {
  const navigate = useNavigate();
  // ---------------------------------------------------------------------------
  // 2. 입력값 및 상태 관리
  // ---------------------------------------------------------------------------
  // 아이디, 비밀번호 입력값 저장
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  // 로그인 요청 중인지 여부 (중복 클릭 방지용)
  const [loading, setLoading] = useState(false);
  // 로그인 실패 시 화면에 띄울 오류 메시지
  const [errorMessage, setErrorMessage] = useState("");

  // ---------------------------------------------------------------------------
  // 3. 백엔드 로그인 API 호출
  // ---------------------------------------------------------------------------
  const handleLogin = async (e) => {
    // 폼 기본 새로고침 동작 방지
    e.preventDefault();

    // 입력값 유효성 검사 (빈 칸 확인)
    if (!userId.trim()) {
      setErrorMessage("아이디를 입력해 주세요.");
      return;
    }
    if (!password) {
      setErrorMessage("비밀번호를 입력해 주세요.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      // auth.py의 @router.post("/login") 엔드포인트로 요청 전송
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 백엔드 LoginRequest 모델(id, pw) 형식에 맞춤
        body: JSON.stringify({
          id: userId.trim(),
          pw: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 401(아이디/비번 불일치) 또는 서버 에러 발생 시
        setErrorMessage(data.detail || "로그인에 실패했습니다.");
        return;
      }

      // [로그인 성공 처리]
      // 1. 발급받은 JWT 토큰을 localStorage에 저장 (이후 API 요청 시 Authorization 헤더에 사용)
      localStorage.setItem("access_token", data.access_token);
      // 2. 로그인된 사용자 정보도 함께 저장
      localStorage.setItem("user", JSON.stringify(data.user));

      // 3. 다른 컴포넌트(Header, Cl 등)가 로그인 상태 변경을 바로 감지할 수 있도록 이벤트 발생
      window.dispatchEvent(new Event("authChange"));

      // 4. 로그인 성공 후 모달 닫기
      if (onClose) {
        onClose();
      }
    } catch {
      // 백엔드 서버가 꺼져 있거나 네트워크 연결이 실패한 경우
      setErrorMessage("서버와 통신할 수 없습니다. 백엔드 서버가 켜져 있는지 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. 화면 렌더링
  // ---------------------------------------------------------------------------
  return (
    <Modal onClose={onClose}>
      <div>
        {/* 모달을 닫고 홈('/') 화면으로 이동 */}
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            navigate("/");
          }}
          className="text-sm text-gray-500 hover:text-gray-800 mb-4 inline-flex items-center gap-1 font-medium"
        >
          ← 홈
        </button>

        {/* 타이틀 */}
        <h2 className="text-3xl font-extrabold text-gray-900 mb-7 tracking-tight">
          로그인
        </h2>

        {/* 로그인 입력 폼 */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* 아이디 입력칸 */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-2">아이디</p>
            <input
              type="text"
              placeholder="아이디를 입력하세요"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={loading}
              autoComplete="username"
              className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-gray-50"
            />
          </div>

          {/* 비밀번호 입력칸 */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-2">비밀번호</p>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-gray-50"
            />
          </div>

          {/* 에러 메시지 (오류 발생 시에만 표시) */}
          {errorMessage && (
            <p className="text-xs font-medium text-danger bg-danger-bg border border-danger-border rounded-lg px-3 py-2">
              {errorMessage}
            </p>
          )}

          {/* 로그인 버튼: 요청 중일 때는 비활성화 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3.5 text-base font-bold text-white hover:bg-brand-hover transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "로그인 중…" : "로그인"}
          </button>
        </form>

        {/* 아이디 찾기 | 비밀번호 찾기 */}
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500 my-5">
          <button
            type="button"
            onClick={() => {
              if (onSwitchToFind) onSwitchToFind("id");
            }}
            className="hover:text-gray-800 transition-colors cursor-pointer"
          >
            아이디 찾기
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => {
              if (onSwitchToFind) onSwitchToFind("pw");
            }}
            className="hover:text-gray-800 transition-colors cursor-pointer"
          >
            비밀번호 재설정
          </button>
        </div>

        <div className="relative flex items-center justify-center my-5 before:content-[''] before:flex-1 before:border-t before:border-gray-200 after:content-[''] after:flex-1 after:border-t after:border-gray-200">
          <span className="px-3 text-xs text-gray-400">
            아직 회원이 아니신가요?
          </span>
        </div>

        {/* 회원가입 버튼 클릭 시 회원가입 모달로 전환 */}
        <button
          type="button"
          onClick={() => {
            if (onSwitchToSignup) onSwitchToSignup();
          }}
          className="w-full rounded-xl border border-brand bg-white py-3.5 text-base font-bold text-brand hover:bg-brand-soft transition-colors"
        >
          회원가입
        </button>
      </div>
    </Modal>
  );
}

export default LoginModal;
