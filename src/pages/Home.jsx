import { Link } from "react-router"

function Home() {
  return (
    <div>
      {/* 1. 메인 히어로 섹션 */}
      <section>
        <span>AI 자소서 · 면접 코치</span>
        <h1>
          자소서부터 면접까지,<br/>
          합격까지 함께 준비해요
        </h1>
        <p>
          자소서를 문장 단위로 분석해 근거 있는 면접 질문을 만들고, 답변이 자소서와 다르면 바로 알려드려요.
        </p>
      </section>

      {/* 2. 주요 기능 3가지 카드 */}
      <section>
        <div>
          <span>01 자소서</span>
          <h3>글자수 · 제목 추천 · 맞춤법</h3>
          <p>수정 이유까지 함께 보여줘요.</p>
        </div>

        <div>
          <span>02 합격 면접</span>
          <h3>근거 문장 기반 질문</h3>
          <p>자소서 문장 출처를 함께 표시해요.</p>
        </div>

        <div>
          <span>03 불일치 경고</span>
          <h3>자소서와 답변 비교</h3>
          <p>핵심 사실이 다르면 바로 알려드려요.</p>
        </div>
      </section>

      {/* 3. 맛보기 체험 섹션 */}
      <section>
        <h2>회원가입 없이 먼저 써보세요</h2>

        <div>
          {/* 맛보기 면접 */}
          <div>
            <h3>맛보기 면접</h3>
            <p>꼬리 질문 챗봇 1회</p>
            <Link to="/interview"> {/* 맛보기 면접 링크 연결 */}
              <button type="button">맛보기 면접 시작</button>
            </Link>
          </div>

          {/* 자소서 맛보기 */}
          <div>
            <h3>자소서 맛보기</h3>
            <p>맞춤법 · 문장 다듬기</p>
            <Link to="/cl"> {/* 자소서 맛보기 링크 연결 */}
              <button type="button">자소서 붙여넣기</button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. 하단 로그인 유도 배너 */}
      <section>
        <h2>지금, 로그인하고 합격으로 한 발짝!</h2>
        <button type="button">시작하기</button>
      </section>
    </div>
  )
}

export default Home
