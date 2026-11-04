import { useEffect, useState } from "react"
import { Link } from "react-router"
import LoginModal from "../components/modals/LoginModal"
import SignupModal from "../components/modals/SignupModal"
import FindAccountModal from "../components/modals/FindAccountModal"

function Home() {
  // 지금 띄워 둔 모달: null = 없음, "login" = 로그인, "signup" = 회원가입, "find" = 계정찾기
  const [modal, setModal] = useState(null)
  // 계정 찾기 모달의 기본 탭: "id" = 아이디 찾기, "pw" = 비밀번호 재설정
  const [findTab, setFindTab] = useState("id")

  // 첫화면 로드시 로그인 여부 확인
  const [loggedIn, setLoggedIn] = useState( 
    localStorage.getItem("access_token") !== null
  )

  // 로그인/로그아웃 실시간 감지
  useEffect(() => {
    const update = () =>
      setLoggedIn(localStorage.getItem("access_token") !== null)
    window.addEventListener("authChange", update)
    return () => window.removeEventListener("authChange", update)
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      {/* 1. 메인 히어로 섹션 */}
      <section className="pt-2 pb-4">
        <span className="inline-block rounded-full bg-brand-light px-3.5 py-1 text-xs font-bold text-brand mb-4">
          AI 합격 코치
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.22] tracking-tight mb-4">
          자기소개서부터 면접까지,<br/>
          합격 메이트와 함께 준비해요
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          내가 쓴 문장으로 예상 면접 질문을 뽑아 드려요.
        </p>
      </section>

      {/* 2. 주요 기능 3가지 카드 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
          <span className="block text-xs font-extrabold text-brand mb-2">
            01 자기소개서
          </span>
          <h3 className="text-lg font-extrabold text-gray-900">
            문장 다듬기 · 제목 추천 · 글자수
          </h3>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
          <span className="block text-xs font-extrabold text-brand mb-2">
            02 AI 면접
          </span>
          <h3 className="text-lg font-extrabold text-gray-900">
            내 자기소개서 기반 질문
          </h3>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs">
          <span className="block text-xs font-extrabold text-brand mb-2">
            03 답변 검증
          </span>
          <h3 className="text-lg font-extrabold text-gray-900">
            자기소개서와 면접 답변 비교 분석
          </h3>
        </div>
      </section>

      {/* 3. 시작하기 / 체험 섹션 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-2xs">
        <h2 className="text-lg font-extrabold text-gray-900 mb-5">
          {loggedIn ? "클릭 한 번으로 바로 시작해 보세요" : "회원가입 없이 체험해 보세요"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 자기소개서 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                {loggedIn ? "자기소개서" : "자기소개서 체험"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {loggedIn ? "제목 추천 · AI 첨삭 · 맞춤법 검사" : "문장 다듬기 최대 200자"}
              </p>
            </div>
            <Link to="/cl" className="block">
              <button
                type="button"
                className="w-full rounded-xl border border-brand bg-white py-3 text-sm font-bold text-brand hover:bg-brand-soft transition-colors"
              >
                {loggedIn ? "자기소개서 작성하기" : "자기소개서 다듬기"}
              </button>
            </Link>
          </div>

          {/* 면접 */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                {loggedIn ? "AI 면접" : "면접 체험"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {loggedIn ? "이력서·자소서 기반으로 한 꼬리 질문" : "꼬리 질문 1회"}
              </p>
            </div>
            <Link to="/interview" className="block">
              <button
                type="button"
                className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-hover transition-colors"
              >
                면접 시작하기
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. 하단 로그인 유도 배너 */}
      <section className="rounded-2xl border-2 border-brand-border bg-white py-10 px-6 text-center shadow-2xs">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-5 tracking-tight">
          지금 로그인하고 합격으로 한 발짝
        </h2>
        {/* 시작하기 버튼을 클릭하면 로그인 화면이 나옴 */}
        <button
          type="button"
          onClick={() => setModal("login")}
          className="rounded-xl bg-brand px-12 py-3.5 text-base font-bold text-white hover:bg-brand-hover transition-colors"
        >
          시작하기
        </button>
      </section>

      {/* modal 상태에 따라 모달을 화면에 올림 */}
      {modal === "login" && (
        <LoginModal
          onClose={() => setModal(null)}
          onSwitchToSignup={() => setModal("signup")} // 로그인화면에서 회원가입으로 이동
          onSwitchToFind={(tab) => {
            setFindTab(tab);
            setModal("find"); // 로그인 화면에서 계정(아이디/비밀번호) 찾기로 이동
          }}
        />
      )}
      {modal === "signup" && (
        <SignupModal
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal("login")} // 회원가입화면에서 로그인으로 이동
        />
      )}
      {modal === "find" && (
        <FindAccountModal
          initialTab={findTab}
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal("login")} // 계정찾기에서 로그인화면으로 이동
        />
      )}
    </div>
  )
}

export default Home
