import { useState } from "react";
import Modal from "./Modal";

// ---------------------------------------------------------------------------
// 1. 서버 설정
// ---------------------------------------------------------------------------
// FastAPI 백엔드 주소 (환경변수가 없으면 기본 로컬 서버 사용)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function SignupModal({ onClose, onSwitchToLogin }) {
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

  // 아이디 중복 확인 관련 상태
  const [idChecking, setIdChecking] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false); // 중복 확인 통과 여부
  const [idCheckMessage, setIdCheckMessage] = useState(""); // 중복 확인 결과 메시지

  // ---------------------------------------------------------------------------
  // 3. 아이디 중복 확인 API 호출 (/auth/check-id)
  // ---------------------------------------------------------------------------
  const handleCheckId = async () => {
    const trimmedId = userId.trim();
    if (!trimmedId) {
      setIdCheckMessage("아이디를 입력해 주세요.");
      setIsIdChecked(false);
      return;
    }

    if (trimmedId.length < 2) {
      setIdCheckMessage("아이디는 2자 이상 입력해 주세요.");
      setIsIdChecked(false);
      return;
    }

    setIdChecking(true);
    setIdCheckMessage("");

    try {
      const res = await fetch(
        `${API_URL}/auth/check-id?user_id=${encodeURIComponent(trimmedId)}` // 백엔드 get 요청엔 ?뒤에 매개변수 사용
      );
      const data = await res.json();

      if (!res.ok) {
        setIdCheckMessage(data.detail || "중복 확인에 실패했습니다.");
        setIsIdChecked(false);
        return;
      }

      if (data.available) {
        setIdCheckMessage(data.message || "사용 가능한 아이디입니다.");
        setIsIdChecked(true);
      } else {
        setIdCheckMessage(data.message || "이미 사용 중인 아이디입니다.");
        setIsIdChecked(false);
      }
    } catch {
      setIdCheckMessage("서버와 통신할 수 없습니다. 백엔드 서버를 확인해 주세요.");
      setIsIdChecked(false);
    } finally {
      setIdChecking(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. 약관 전체 동의 처리 로직
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
  // 5. 백엔드 회원가입 API 호출
  // ---------------------------------------------------------------------------
  const handleSignup = async (e) => {
    e.preventDefault(); // 폼 기본 새로고침 방지

    // [유효성 검사 1] 빈 칸 확인
    if (!userId.trim()) {
      setErrorMessage("아이디를 입력해 주세요.");
      return;
    }
    // [유효성 검사 2] 아이디 중복 확인 여부
    if (!isIdChecked) {
      setErrorMessage("아이디 중복 확인을 진행해 주세요.");
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

    // [유효성 검사 3] 필수 약관 동의 여부 (백엔드에서도 체크함)
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

      // 가입 성공 안내 후 1.2초 뒤에 로그인 모달로 자동 전환
      setTimeout(() => {
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
  // 6. 화면 렌더링 
  // ---------------------------------------------------------------------------
  return (
    <Modal onClose={onClose}>
      <div>
        {/* 상단 뒤로가기 버튼*/}
        <button
          type="button"
          onClick={() => {
            if (onSwitchToLogin) onSwitchToLogin();
          }}
          className="text-sm text-gray-500 hover:text-gray-800 mb-3 inline-flex items-center gap-1 font-medium"
        >
          ← 로그인
        </button>

        {/* 타이틀 및 안내 문구 */}
        <h2 className="text-3xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
          회원가입
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          계정 정보를 입력하고 약관에 동의해 주세요.
        </p>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* 아이디 입력칸 및 중복 확인 버튼 */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-1.5">아이디</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="영문, 숫자 조합"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  // 아이디를 변경하면 중복 확인 통과 상태 초기화
                  setIsIdChecked(false);
                  setIdCheckMessage("");
                }}
                disabled={loading || idChecking}
                autoComplete="username"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={handleCheckId}
                disabled={loading || idChecking || !userId.trim()}
                className="shrink-0 rounded-xl border border-brand px-3.5 py-3 text-xs font-bold text-brand hover:bg-brand-soft transition-colors disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
              >
                {idChecking ? "확인 중…" : "중복 확인"}
              </button>
            </div>
            {/* 아이디 중복 확인 결과 피드백 문구 */}
            {idCheckMessage && (
              <p
                className={`text-xs mt-1.5 font-medium ${
                  isIdChecked ? "text-brand" : "text-danger"
                }`}
              >
                {idCheckMessage}
              </p>
            )}
          </div>

          {/* 비밀번호 입력칸 */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-1.5">비밀번호</p>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-gray-50"
            />
          </div>

          {/* 비밀번호 확인 입력칸 */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-1.5">비밀번호 확인</p>
            <input
              type="password"
              placeholder="비밀번호 다시 입력"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-gray-50"
            />
          </div>

          {/* 이메일 입력칸 */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-1.5">이메일</p>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-gray-50"
            />
          </div>

          {/* 약관 동의 체크박스 영역 */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden mt-5">
            {/* 전체 동의 */}
            <div className="flex items-center gap-3 bg-brand-light/70 px-4 py-3.5 border-b border-gray-200">
              <input
                type="checkbox"
                id="all_agree"
                checked={isAllAgreed}
                onChange={handleAllAgree}
                className="w-4 h-4 accent-brand rounded cursor-pointer"
              />
              <label
                htmlFor="all_agree"
                className="font-bold text-sm text-gray-900 cursor-pointer select-none"
              >
                전체 동의
              </label>
            </div>

            <div className="p-4 space-y-3 bg-white">
              {/* [필수] 서비스 이용약관 동의 */}
              <div className="flex items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  id="service_agree"
                  checked={serviceAgreed}
                  onChange={(e) => setServiceAgreed(e.target.checked)}
                  className="w-4 h-4 accent-brand rounded cursor-pointer"
                />
                <label
                  htmlFor="service_agree"
                  className="text-gray-800 cursor-pointer select-none"
                >
                  <strong className="text-brand font-bold">[필수]</strong> 서비스 이용약관 동의
                </label>
                <button
                  type="button"
                  className="ml-auto text-xs text-gray-500 underline hover:text-gray-800"
                >
                  보기
                </button>
              </div>

              {/* [필수] 개인정보 수집·이용 동의 */}
              <div className="flex items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  id="privacy_agree"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="w-4 h-4 accent-brand rounded cursor-pointer"
                />
                <label
                  htmlFor="privacy_agree"
                  className="text-gray-800 cursor-pointer select-none"
                >
                  <strong className="text-brand font-bold">[필수]</strong> 개인정보 수집·이용 동의
                </label>
                <button
                  type="button"
                  className="ml-auto text-xs text-gray-500 underline hover:text-gray-800"
                >
                  보기
                </button>
              </div>

              {/* [선택] 문서 저장 동의 */}
              <div className="text-sm">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="save_agree"
                    checked={saveAgreed}
                    onChange={(e) => setSaveAgreed(e.target.checked)}
                    className="w-4 h-4 accent-brand rounded cursor-pointer"
                  />
                  <label
                    htmlFor="save_agree"
                    className="text-gray-800 cursor-pointer select-none"
                  >
                    <strong className="text-gray-600 font-bold">[선택]</strong> 문서 저장 동의
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1 pl-6">
                  이력서 · 자기소개서 · 면접 대화를 저장해 마이페이지에서 다시 볼 수 있어요.
                </p>
              </div>
            </div>
          </div>

          {/* 에러 및 성공 메시지 안내 */}
          {errorMessage && (
            <p className="text-xs font-medium text-danger bg-danger-bg border border-danger-border rounded-lg px-3 py-2">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="text-xs font-medium text-brand bg-brand-light rounded-lg px-3 py-2">
              {successMessage}
            </p>
          )}

          {/* 가입하기 버튼: 요청 중일 때는 비활성화 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-3.5 text-base font-bold transition-colors mt-2 ${
              serviceAgreed && privacyAgreed
                ? "bg-brand text-white hover:bg-brand-hover"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            }`}
          >
            {loading ? "가입 처리 중…" : "가입하기"}
          </button>
        </form>

        {/* 하단 안내 문구*/}
        <p className="text-center text-xs text-gray-500 mt-3">
          필수 항목에 동의하면 가입할 수 있어요.
        </p>
      </div>
    </Modal>
  );
}

export default SignupModal;
