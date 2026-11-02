import { useState } from "react";
import Modal from "./Modal";

// ---------------------------------------------------------------------------
// 1. 서버 설정
// ---------------------------------------------------------------------------
// FastAPI 백엔드 주소 (환경변수가 없으면 기본 로컬 서버 사용)
const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.13:8000";

function LoginModal({ isOpen = true, onClose, onSuccess, onSwitchToSignup }) {
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

  // 모달이 닫힌 상태라면 화면에 아무것도 렌더링하지 않음
  if (!isOpen) return null;

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

      // 4. 부모 컴포넌트가 전달한 onSuccess 콜백이 있다면 실행 (결과 데이터 전달)
      if (onSuccess) {
        onSuccess(data);
      }

      // 5. 로그인 성공 후 모달 닫기
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
  // 4. 화면 렌더
  // ---------------------------------------------------------------------------
  return (
    <Modal onClose={onClose}>
      <div>
        {/* 상단 뒤로가기 버튼*/}
        <button type="button" onClick={onClose}>
          ← 홈으로
        </button>

        {/* 타이틀 */}
        <h2>로그인</h2>

        {/* 로그인 입력 폼 */}
        <form onSubmit={handleLogin}>
          {/* 아이디 입력칸 */}
          <div>
            <p>아이디</p>
            <input
              type="text"
              placeholder="아이디를 입력하세요"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          {/* 비밀번호 입력칸 */}
          <div>
            <p>비밀번호</p>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {/* 에러 메시지 (오류 발생 시에만 표시) */}
          {errorMessage && <p>{errorMessage}</p>}

          {/* 로그인 버튼: 요청 중일 때는 비활성화 */}
          <button type="submit" disabled={loading}>
            {loading ? "로그인 중…" : "로그인"}
          </button>
        </form>

        {/* 아이디 찾기 | 비밀번호 찾기 */}
        <div>
          <button type="button">아이디 찾기</button>
          <span>|</span>
          <button type="button">비밀번호 찾기</button>
        </div>

        <div>
          <span>아직 회원이 아니신가요?</span>
        </div>

        {/* 회원가입 버튼 클릭 시 회원가입 모달로 전환 */}
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            if (onSwitchToSignup) onSwitchToSignup();
          }}
        >
          회원가입
        </button>
      </div>
    </Modal>
  );
}

export default LoginModal;
