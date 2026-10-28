function Interview() {
  return (<>
    <div>
      <header>
        <h1>AI 면접</h1>
      </header>

      <div>
        <div>
          <label>직무</label>
          <div>
            <select>
              <option>AI·개발·데이터</option>
            </select>
            <select>
              <option>백엔드개발자</option>
            </select>
          </div>
        </div>

        <div>
          <label>이력서</label>
          <button>
            PDF 업로드
          </button>
          <button>
            내 이력서 가져오기
          </button>
        </div>

        <div>
          <label>자기소개서</label>
          <button>
            PDF 업로드
          </button>
          <button>
            내 자기소개서 가져오기
          </button>
        </div>

        <div>
          <label>질문 항목</label>
          <div>
            <div>
              <span>① 지원 동기</span>
              <p>완료</p>
            </div>
            <div>
              <span>② 경험 및 역량</span>
              <p>완료</p>
            </div>
            <div>
              <span>③ 인성 및 협업</span>
              <p>완료</p>
            </div>
            <div>
              <span>④ 입사 후 포부</span>
              <p>미입력</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3>근거 문장</h3>
        <div>
          <p>① 지원 동기</p>
          <div>
            <span>[1-1]</span> 사용자의 불편을 데이터로 확인하고 개선하는 일에 관심이 많습니다.
            <span>[1-2]</span> 근거를 바탕으로 결정하는 개발자가 되고 싶습니다.
          </div>
        </div>
        <div>
          <p>② 경험 및 역량</p>
          <div>
            <span>[2-1]</span> 팀원 4명이 역할을 나눠 문제를 정리했습니다.
            <span>[2-2]</span> 사용자 피드백을 모아 화면 흐름을 다시 설계했습니다.
            <span>[2-3]</span> 그 결과 팀원 모두가 기능을 더 쉽게 이해할 수 있었습니다.
          </div>
        </div>
        <div>
          <p>③ 인성 및 협업</p>
          <div>
            <span>[3-1]</span> 꼼꼼하게 확인하는 편이지만 결정이 늦어질 때가 있습니다.
          </div>
        </div>
      </div>

      <div>
        <div>
          <h3>AI·개발·데이터 &gt; 백엔드개발자</h3>
          <button>대화 저장</button>
        </div>
        <div>
          <div>
            <span>경험 및 역량</span>
            <span>근거 [2-2]</span>
            <div>
              사용자 피드백을 모아 화면 흐름을 다시 설계했다고 하셨는데, 피드백은 어떤 방식으로 수집하셨나요?
            </div>
          </div>
          <div>
            설문 폼을 만들어 팀원 6명과 함께 2주 동안 응답을 모았고, 자주 나온 불편을 3가지로 정리했습니다.
          </div>
          <div>
            <div>
              <span>⚠️</span>
              <h4>서류와 다른 부분이 있어요</h4>
            </div>
            <p>
              자기소개서 <span>팀원 4명</span> · 답변 <span>팀원 6명</span>
            </p>
          </div>
        </div>
        <div>
          <textarea
            placeholder="답변을 입력하세요"
          ></textarea>
          <button>전송</button>
        </div>
      </div>
    </div>
  </>)
}
export default Interview