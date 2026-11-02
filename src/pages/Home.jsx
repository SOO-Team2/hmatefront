import { useState } from "react"
import { Link } from "react-router"
import LoginModal from "../components/modals/LoginModal"
import SignupModal from "../components/modals/SignupModal"

function Home() {
  // 지금 띄워 둔 모달: null = 없음, "login" = 로그인, "signup" = 회원가입
  const [modal, setModal] = useState(null)

  return (
    <div>
      {/* 1. 메인 히어로 섹션 */}
      <section>
        <span>AI 합격 코치</span>
        <h1>
          자기소개서부터 면접까지,<br/>
          합격메이트와 함께 준비해요
        </h1>
        <p>
          내가 쓴 문장으로 예상 면접 질문을 뽑아 드려요.
        </p>
      </section>

      {/* 2. 주요 기능 3가지 카드 */}
      <section>
        <div>
          <span>01 자기소개서</span>
          <h3>문장 다듬기 · 제목 추천 · 글자수</h3>
        </div>

        <div>
          <span>02 AI 면접</span>
          <h3>내 자기소개서 기반 질문</h3>
        </div>

        <div>
          <span>03 답변 검증</span>
          <h3>자기소개서와 면접 답변 비교 분석</h3>
        </div>
      </section>

      {/* 3. 맛보기 체험 섹션 */}
      <section>
        <h2>회원가입 없이 체험해 보세요</h2>

        <div>
          {/* 자기소개서 체험 */}
          <div>
            <h3>자기소개서 체험</h3>
            <p>문장 다듬기 최대 200자</p>
            <Link to="/cl">
              <button type="button">자기소개서 다듬기</button>
            </Link>
          </div>

          {/* 면접 체험 */}
          <div>
            <h3>면접 체험</h3>
            <p>꼬리 질문 1회</p>
            <Link to="/interview">
              <button type="button">면접 시작하기</button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. 하단 로그인 유도 배너 */}
      <section>
        <h2>지금 로그인하고 합격으로 한 발짝</h2>
        {/* 시작하기 버튼을 클릭하면 로그인 화면이 나옴 */}
        <button type="button" onClick={() => setModal("login")}>
          시작하기
        </button>
      </section>

      {/* modal 상태에 따라 모달을 화면에 올림 */}
      {modal === "login" && (
        <LoginModal
          onClose={() => setModal(null)}
          onSwitchToSignup={() => setModal("signup")} //로그인화면에서 회원가입으로 이동
        />
      )}
      {modal === "signup" && (
        <SignupModal
          onClose={() => setModal(null)}
          onSwitch={() => setModal("login")}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
    </div>
  )
}

export default Home
