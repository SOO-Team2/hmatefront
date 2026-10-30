import { useState } from "react";
import Modal from "./Modal";

// ---------------------------------------------------------------------------
// 1. 서버 설정
// ---------------------------------------------------------------------------
// FastAPI 백엔드 주소 (환경변수가 없으면 기본 로컬 서버 사용)
const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.13:8000";

function SignupModal({ isOpen = true, onClose, onSwitchToLogin, onSuccess }) {
  // ---------------------------------------------------------------------------
  // 2. 입력값 및 체크박스 상태 관리
  // ---------------------------------------------------------------------------
  // 회원 계정 정보
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState("");

  // 약관 동의 체크박스 상태 (auth.py 모델 필드명과 일치)
  const [serviceAgreed, setServiceAgreed] = useState(false); // [필수] 서비스 이용약관 동의
  const [privacyAgreed, setPrivacyAgreed] = useState(false); // [필수] 개인정보 수집·이용 동의
  const [saveAgreed, setSaveAgreed] = useState(false);       // [선택] 문서 저장 동의

  // 통신 및 메시지 상태
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 모달이 닫힌 상태라면 화면에 아무것도 그리지 않음
  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // 3. 약관 전체 동의 처리 로직
  // ---------------------------------------------------------------------------
  // 세 가지 약관이 모두 체크되어 있는지 확인
  const isAllAgreed = serviceAgreed && privacyAgreed && saveAgreed;

  // "전체 동의" 체크박스를 눌렀을 때 모든 약관을 한 번에 켜거나 끄는 함수
  const handleAllAgree = (e) => {
    const checked = e.target.checked;
    setServiceAgreed(checked);
    setPrivacyAgreed(checked);
    setSaveAgreed(checked);
  };

  // ---------------------------------------------------------------------------
  // 4. 백엔드 회원가입 API 호출
  // ---------------------------------------------------------------------------
  const handleSignup = async (e) => {
    e.preventDefault(); // 폼 기본 새로고침 방지

    // [유효성 검사 1] 빈 칸 확인
    if (!userId.trim()) {
      setErrorMessage("아이디를 입력해 주세요.");
      return;
    }
    if (!password) {
      setErrorMessage("비밀번호를 입력해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("이메일을 입력해 주세요.");
      return;
    }

    // [유효성 검사 2] 필수 약관 동의 여부 (백엔드에서도 체크함)
    if (!serviceAgreed || !privacyAgreed) {
      setErrorMessage("필수 약관에 모두 동의해야 가입할 수 있습니다.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      // auth.py의 @router.post("/signup") 엔드포인트로 회원가입 요청 전송
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 백엔드 SignupRequest 모델의 필드명에 정확히 맞춤
        body: JSON.stringify({
          id: userId.trim(),
          pw: password,
          email: email.trim(),
          service_agreed: serviceAgreed,
          privacy_agreed: privacyAgreed,
          save_agreed: saveAgreed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 400(약관 미동의), 409(아이디 중복) 등 백엔드가 보낸 에러 메시지 표시
        setErrorMessage(data.detail || "회원가입에 실패했습니다.");
        return;
      }

      // [가입 성공 처리]
      setSuccessMessage("회원가입이 완료되었습니다! 로그인 창으로 이동합니다.");

      if (onSuccess) {
        onSuccess(data);
      }

      // 가입 성공 안내 후 1.2초 뒤에 로그인 모달로 자동 전환
      setTimeout(() => {
        if (onClose) onClose();
        if (onSwitchToLogin) onSwitchToLogin();
      }, 1200);

    } catch {
      // 서버 연결 실패 시
      setErrorMessage("서버와 통신할 수 없습니다. 백엔드 서버가 켜져 있는지 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. 화면 렌더링 
  // ---------------------------------------------------------------------------
  return (
    <Modal onClose={onClose}>
      <div>
        {/* 상단 뒤로가기 버튼: 시안 텍스트 '← 로그인으로' */}
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            if (onSwitchToLogin) onSwitchToLogin();
          }}
        >
          ← 로그인으로
        </button>

        {/* 타이틀 및 안내 문구 */}
        <h2>회원가입</h2>
        <p>계정 정보를 입력하고 약관에 동의해 주세요.</p>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSignup}>
          {/* 아이디 입력칸 */}
          <div>
            <p>아이디</p>
            <input
              type="text"
              placeholder="영문, 숫자 조합"
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
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {/* 비밀번호 확인 입력칸 */}
          <div>
            <p>비밀번호 확인</p>
            <input
              type="password"
              placeholder="비밀번호 다시 입력"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {/* 이메일 입력칸 */}
          <div>
            <p>이메일</p>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* 약관 동의 체크박스 영역 */}
          <div>
            {/* 전체 동의 */}
            <div>
              <input
                type="checkbox"
                id="all_agree"
                checked={isAllAgreed}
                onChange={handleAllAgree}
              />
              <label htmlFor="all_agree">전체 동의</label>
            </div>

            {/* [필수] 서비스 이용약관 동의 */}
            <div>
              <input
                type="checkbox"
                id="service_agree"
                checked={serviceAgreed}
                onChange={(e) => setServiceAgreed(e.target.checked)}
              />
              <label htmlFor="service_agree">[필수] 서비스 이용약관 동의</label>
              <button type="button">보기</button>
            </div>

            {/* [필수] 개인정보 수집·이용 동의 */}
            <div>
              <input
                type="checkbox"
                id="privacy_agree"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
              />
              <label htmlFor="privacy_agree">[필수] 개인정보 수집·이용 동의</label>
              <button type="button">보기</button>
            </div>

            {/* [선택] 문서 저장 동의 */}
            <div>
              <div>
                <input
                  type="checkbox"
                  id="save_agree"
                  checked={saveAgreed}
                  onChange={(e) => setSaveAgreed(e.target.checked)}
                />
                <label htmlFor="save_agree">[선택] 문서 저장 동의</label>
              </div>
              <p>자소서 · 이력서 · 면접 대화를 저장해 마이페이지에서 다시 볼 수 있어요.</p>
            </div>
          </div>

          {/* 에러 및 성공 메시지 안내 */}
          {errorMessage && <p>{errorMessage}</p>}
          {successMessage && <p>{successMessage}</p>}

          {/* 가입하기 버튼: 요청 중일 때는 비활성화 */}
          <button type="submit" disabled={loading}>
            {loading ? "가입 처리 중…" : "가입하기"}
          </button>
        </form>

        {/* 하단 안내 문구 (시안 텍스트) */}
        <p>필수 항목에 동의하면 가입할 수 있어요.</p>
      </div>
    </Modal>
  );
}

export default SignupModal;
