import { useState, useRef } from "react"
import { Link } from "react-router"

function Mypage() {
  // 현재 선택된 사이드바 탭 (cl: 자기소개서, resume: 이력서, history: 지난 대화, profile: 회원정보 수정)
  const [activeTab, setActiveTab] = useState("cl")

  // 업로드된 이력서 파일 정보 (파일이 없으면 null, 올라오면 { name, date } 저장)
  const [resumeFile, setResumeFile] = useState(null)
  // PDF 파일 선택창을 열기 위한 ref
  const fileInputRef = useRef(null)

  // 파일 선택 시 실행되는 함수
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".")
      setResumeFile({
        name: file.name,
        date: today,
      })
    }
  }

  // 업로드된 파일 삭제 함수
  const handleDeleteFile = () => {
    setResumeFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div>
      {/* 1. 좌측 사이드바 (프로필 및 탭 메뉴) */}
      <aside>
        <div>
          <h2>[회원 이름]님</h2>
          <p>[아이디]</p>
        </div>

        <nav>
          <button type="button" onClick={() => setActiveTab("cl")}>
            자기소개서
          </button>
          <button type="button" onClick={() => setActiveTab("resume")}>
            이력서
          </button>
          <button type="button" onClick={() => setActiveTab("history")}>
            지난 대화
          </button>
          <button type="button" onClick={() => setActiveTab("profile")}>
            회원정보 수정
          </button>
        </nav>
      </aside>

      {/* 2. 우측 콘텐츠 영역 */}
      <main>
        {/* 자기소개서 탭*/}
        {activeTab === "cl" && (
          <section>
            <div>
              <h2>자기소개서</h2>
              <Link to="/cl">
                <button type="button">새 자소서 작성 →</button>
              </Link>
            </div>

            <p>저장한 자소서</p>

            {/* 자소서 카드 1 */}
            <div>
              <div>
                <h3>불편을 데이터로 증명하는 사람</h3>
                <span>2026.10.22</span>
                <button type="button">수정</button>
                <button type="button">삭제</button>
              </div>

              <div>
                <h4>지원 동기</h4>
                <p>
                  저는 사용자의 불편을 데이터로 확인하고 개선하는 일에 관심이 많습니다. 학원 팀 프로젝트에서 사용자 피드백을 모아 화면 흐름을 다시 설계했고, 팀원 4명이 역할을 나눠 문제를 정리했습니다.
                </p>
              </div>

              <div>
                <h4>입사 후 포부</h4>
                <p>그래서 근거로 결정하는 개발자가 되고 싶습니다.</p>
              </div>
            </div>

            {/* 자소서 카드 2 */}
            <div>
              <div>
                <h3>작게 쪼개고, 근거로 결정합니다</h3>
                <span>2026.10.20</span>
                <button type="button">수정</button>
                <button type="button">삭제</button>
              </div>
            </div>
          </section>
        )}

        {/* 이력서 탭*/}
        {activeTab === "resume" && (
          <section>
            <h2>이력서</h2>

            <div>
              {/* PDF 첨부 버튼 클릭 시 숨겨진 파일 선택창 실행 */}
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                PDF 첨부
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <button type="button">기본 양식으로 작성</button>
            </div>

            <div>
              <div>
                <p>이름</p>
                <input type="text" placeholder="이름" />
              </div>

              <div>
                <div>
                  <p>연락처</p>
                  <input type="text" placeholder="010-0000-0000" />
                </div>
                <div>
                  <p>이메일</p>
                  <input type="text" placeholder="name@example.com" />
                </div>
              </div>

              <div>
                <p>학력</p>
                <button type="button">+ 추가</button>
                <input type="text" placeholder="학교 · 전공 · 졸업년도" />
              </div>

              <div>
                <p>자격증</p>
                <button type="button">+ 추가</button>
                <input type="text" placeholder="자격증명 · 취득일" />
              </div>

              <div>
                <p>보유 기술</p>
                <input type="text" placeholder="예) Python, SQL, Django" />
              </div>

              <div>
                <p>경력</p>
                <button type="button">+ 추가</button>
                <input type="text" placeholder="기간, 역할, 사용 기술, 결과를 적어 주세요." />
              </div>

              {/* 실제로 파일이 첨부되었을 때만 파일명과 삭제/저장 버튼 노출 */}
              {resumeFile && (
                <div>
                  <span>📄 {resumeFile.name} - {resumeFile.date} 저장</span>
                  <div>
                    <button type="button" onClick={handleDeleteFile}>
                      삭제
                    </button>
                    <button type="button">저장</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 지난 대화 탭 */}
        {activeTab === "history" && (
          <section>
            <div>
              <h2>마이페이지 — 지난 대화 이력</h2>
              <span>면접 피드백 & 불일치 기록</span>
            </div>

            {/* 대화 기록 카드 1 */}
            <div>
              <div>
                <span>2026.10.22 (목)</span>
                <span>IT · 개발 &gt; 백엔드 개발</span>
              </div>
              <p>피드백 · 경험 설명은 구체적이에요. 팀 인원 수가 자소서와 달라 불일치 경고 1회가 있었어요.</p>
              <div>
                <button type="button">대화 보기</button>
                <button type="button">삭제</button>
              </div>
            </div>

            {/* 대화 기록 카드 2 */}
            <div>
              <div>
                <span>2026.10.20 (화)</span>
                <span>IT · 개발 &gt; 데이터 분석</span>
              </div>
              <p>피드백 · 직무 역량 질문 2개가 '부족'으로 분류됐어요. 사용 도구와 결과를 함께 말해 보세요.</p>
              <div>
                <button type="button">대화 보기</button>
                <button type="button">삭제</button>
              </div>
            </div>
          </section>
        )}

        {/* 회원정보 수정 탭 */}
        {activeTab === "profile" && (
          <section>
            <h2>마이페이지 — 회원정보 수정 (개인정보 보호 장치 연동)</h2>

            <div>
              <div>
                <h3>문서 저장 동의</h3>
                <p>동의함 · 2026.10.01</p>
              </div>
              <button type="button">동의 변경</button>
            </div>

            <ul>
              <li>내 문서는 본인만 조회할 수 있어요. 다른 회원은 접근할 수 없어요.</li>
              <li>문서를 삭제하면 DB에서 바로 삭제되며 되돌릴 수 없어요.</li>
              <li>회원 탈퇴 시 자소서 · 이력서 · 문장 · 대화 기록이 모두 삭제돼요.</li>
            </ul>

            <button type="button">회원 탈퇴</button>
          </section>
        )}
      </main>
    </div>
  )
}

export default Mypage