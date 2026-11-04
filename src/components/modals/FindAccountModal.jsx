import { useState } from "react";
import Modal from "./Modal";

// FastAPI 백엔드 주소
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function FindAccountModal({ initialTab = "id", onClose, onSwitchToLogin }) {
  // 현재 선택된 탭: "id" = 아이디 찾기, "pw" = 비밀번호 재설정
  const [activeTab, setActiveTab] = useState(initialTab);

  // --- 아이디 찾기 상태 ---
  const [findIdEmail, setFindIdEmail] = useState("");
  const [findIdLoading, setFindIdLoading] = useState(false);
  const [foundId, setFoundId] = useState("");
  const [findIdError, setFindIdError] = useState("");

  // --- 비밀번호 재설정 상태 ---
  const [resetId, setResetId] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // 탭 변경 시 기존 에러/성공 상태 초기화
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFindIdError("");
    setResetError("");
    setResetSuccess("");
    setFoundId("");
  };

  // ---------------------------------------------------------------------------
  // 1. 아이디 찾기 API 호출 (/auth/find-id)
  // ---------------------------------------------------------------------------
  const handleFindId = async (e) => {
    e.preventDefault();
    if (!findIdEmail.trim()) {
      setFindIdError("가입하신 이메일 주소를 입력해 주세요.");
      return;
    }

    setFindIdError("");
    setFoundId("");
    setFindIdLoading(true);

    // 백엔드 서버에 아이디 조회 요청
    try {
      const res = await fetch(`${API_URL}/auth/find-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: findIdEmail.trim() }),
      });

      const data = await res.json();
      
      // 결과
      if (!res.ok) {
        setFindIdError(data.detail || "등록된 계정을 찾을 수 없습니다.");
        return;
      }

      setFoundId(data.id);
    } catch {

      setFindIdError("서버와 통신할 수 없습니다. 백엔드 서버를 확인해 주세요.");
    } finally {
      setFindIdLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. 비밀번호 재설정 API 호출 (/auth/reset-password)
  // ---------------------------------------------------------------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetId.trim()) {
      setResetError("아이디를 입력해 주세요.");
      return;
    }
    if (!resetEmail.trim()) {
      setResetError("이메일을 입력해 주세요.");
      return;
    }
    if (!newPassword) {
      setResetError("새 비밀번호를 입력해 주세요.");
      return;
    }
    if (newPassword.length < 4) {
      setResetError("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setResetError("");
    setResetLoading(true);

    // 백엔드에 비밀번호 변경을 요청
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resetId.trim(),
          email: resetEmail.trim(),
          new_pw: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.detail || "비밀번호 변경에 실패했습니다.");
        return;
      }

      setResetSuccess(data.message || "비밀번호가 성공적으로 변경되었습니다.");
    } catch {
      setResetError("서버와 통신할 수 없습니다. 백엔드 서버를 확인해 주세요.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div>
        {/* 상단 뒤로가기 버튼 */}
        <button
          type="button"
          onClick={() => {
            if (onSwitchToLogin) onSwitchToLogin();
          }}
          className="text-sm text-gray-500 hover:text-gray-800 mb-3 inline-flex items-center gap-1 font-medium"
        >
          ← 로그인으로 돌아가기
        </button>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => handleTabChange("id")}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-colors ${
              activeTab === "id"
                ? "border-brand text-brand"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            아이디 찾기
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("pw")}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-colors ${
              activeTab === "pw"
                ? "border-brand text-brand"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            비밀번호 재설정
          </button>
        </div>

        {/* =================================================================== */}
        {/* 아이디 찾기 */}
        {/* =================================================================== */}
        {activeTab === "id" && (
          <div>
            {!foundId ? (
              <form onSubmit={handleFindId} className="space-y-4">
                <p className="text-xs text-gray-500 mb-4">
                  회원가입 시 등록하셨던 이메일 주소를 입력하시면 아이디를 확인하실 수 있습니다.
                </p>

                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1.5">이메일 주소</p>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={findIdEmail}
                    onChange={(e) => setFindIdEmail(e.target.value)}
                    disabled={findIdLoading}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-gray-50"
                  />
                </div>

                {findIdError && (
                  <p className="text-xs font-medium text-danger bg-danger-bg border border-danger-border rounded-lg px-3 py-2">
                    {findIdError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={findIdLoading || !findIdEmail.trim()}
                  className="w-full rounded-xl bg-brand py-3.5 text-base font-bold text-white hover:bg-brand-hover transition-colors disabled:opacity-50 mt-2"
                >
                  {findIdLoading ? "조회 중…" : "아이디 찾기"}
                </button>
              </form>
            ) : (
              <div className="space-y-5 text-center py-2">
                <div className="rounded-2xl bg-brand-light/60 border border-brand/20 p-5">
                  <p className="text-xs text-gray-600 mb-1">등록된 계정의 아이디</p>
                  <p className="text-xl font-black text-brand tracking-wide">
                    {foundId}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFoundId("");
                      setFindIdEmail("");
                    }}
                    className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    다시 찾기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchToLogin) onSwitchToLogin();
                    }}
                    className="flex-1 rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-hover transition-colors"
                  >
                    로그인하기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* 비밀번호 재설정 */}
        {/* =================================================================== */}
        {activeTab === "pw" && (
          <div>
            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-gray-500 mb-4">
                  아이디와 가입 시 등록한 이메일을 인증한 뒤 새 비밀번호로 변경할 수 있습니다.
                </p>

                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1.5">아이디</p>
                  <input
                    type="text"
                    placeholder="아이디를 입력하세요"
                    value={resetId}
                    onChange={(e) => setResetId(e.target.value)}
                    disabled={resetLoading}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1.5">이메일 주소</p>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetLoading}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1.5">새 비밀번호</p>
                  <input
                    type="password"
                    placeholder="최소 4자 이상 입력"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={resetLoading}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1.5">새 비밀번호 확인</p>
                  <input
                    type="password"
                    placeholder="새 비밀번호 다시 입력"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={resetLoading}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:bg-gray-50"
                  />
                </div>

                {resetError && (
                  <p className="text-xs font-medium text-danger bg-danger-bg border border-danger-border rounded-lg px-3 py-2">
                    {resetError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={resetLoading || !resetId.trim() || !resetEmail.trim() || !newPassword}
                  className="w-full rounded-xl bg-brand py-3.5 text-base font-bold text-white hover:bg-brand-hover transition-colors disabled:opacity-50 mt-2"
                >
                  {resetLoading ? "변경 중…" : "비밀번호 변경하기"}
                </button>
              </form>
            ) : (
              <div className="space-y-5 text-center py-4">
                <div className="rounded-2xl bg-brand-light/60 border border-brand/20 p-5">
                  <p className="text-base font-bold text-brand mb-1">
                    비밀번호 변경 완료!
                  </p>
                  <p className="text-xs text-gray-600">
                    새로운 비밀번호로 정상 변경되었습니다.<br />
                    새 비밀번호로 다시 로그인해 주세요.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchToLogin) onSwitchToLogin();
                  }}
                  className="w-full rounded-xl bg-brand py-3.5 text-base font-bold text-white hover:bg-brand-hover transition-colors"
                >
                  로그인하러 가기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default FindAccountModal;

