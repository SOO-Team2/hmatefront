// useState: 값을 기억해 두고, 값이 바뀌면 화면을 다시 그려 주는 React 기능
import { useState } from "react";

function Cl() {
  // 오른쪽 첨삭 패널이 열려 있는지 (false = 닫힘)
  const [showFeedback, setShowFeedback] = useState(false);
  // 패널 안의 "문장 다듬기" 카드가 보이는지 (true = 보임)
  const [showCard, setShowCard] = useState(true);
  // 항목 4개에 입력한 글자 (처음엔 빈 글자 "")
  const [motive, setMotive] = useState(""); // ① 지원 동기
  const [growth, setGrowth] = useState(""); // ② 성장 과정
  const [strength, setStrength] = useState(""); // ③ 성격의 장단점
  const [goal, setGoal] = useState(""); // ④ 입사 후 포부

  // 네 항목을 이어 붙인 뒤 공백(띄어쓰기, 줄바꿈)을 지운 전체 글자수
  // /\s/g : 공백을 전부 찾는 규칙, replace(..., "") : 찾은 공백을 지움
  const total = (motive + growth + strength + goal).replace(/\s/g, "").length;

  return (
    <main>
      <div>
        <h1>자기소개서</h1>
        <span>
          비회원 맛보기 <strong>{total} / 200자</strong>
        </span>
      </div>
      <section>
        <label>제목</label>
        <div>
          <input
            type="text"
            placeholder="제목을 입력하거나 '제목 추천'을 눌러보세요."
          />
          <button type="button">제목 추천</button>
        </div>

        <div>
          <h2>① 지원 동기</h2>
          <textarea
            placeholder="지원 동기를 작성해 주세요."
            value={motive}
            onChange={(e) => {
              // next: 방금 입력해서 완성된 새 글자
              const next = e.target.value;
              // 새 글자를 저장했을 때의 전체 합계가 200자 이하일 때만 저장
              // (넘으면 저장하지 않으므로 입력이 막힌 것처럼 보임)
              if (
                (next + growth + strength + goal).replace(/\s/g, "").length <=
                200
              ) {
                setMotive(next);
              }
            }}
          ></textarea>
          <p>
            공백 포함 <strong>{motive.length}자</strong> 공백 제외{" "}
            <strong>{motive.replace(/\s/g, "").length}자</strong>
          </p>
        </div>
        <div>
          <h2>② 성장 과정</h2>
          <textarea
            placeholder="성장 과정을 작성해 주세요."
            value={growth}
            onChange={(e) => {
              const next = e.target.value;
              if (
                (motive + next + strength + goal).replace(/\s/g, "").length <=
                200
              ) {
                setGrowth(next);
              }
            }}
          ></textarea>
          <p>
            공백 포함 <strong>{growth.length}자</strong> 공백 제외{" "}
            <strong>{growth.replace(/\s/g, "").length}자</strong>
          </p>
        </div>

        <div>
          <h2>③ 성격의 장단점</h2>
          <textarea
            placeholder="성격의 장단점을 작성해 주세요."
            value={strength}
            onChange={(e) => {
              const next = e.target.value;
              if (
                (motive + growth + next + goal).replace(/\s/g, "").length <= 200
              ) {
                setStrength(next);
              }
            }}
          ></textarea>
          <p>
            공백 포함 <strong>{strength.length}자</strong> 공백 제외{" "}
            <strong>{strength.replace(/\s/g, "").length}자</strong>
          </p>
        </div>

        <div>
          <h2>④ 입사 후 포부</h2>
          <textarea
            placeholder="입사 후 포부를 작성해 주세요."
            value={goal}
            onChange={(e) => {
              const next = e.target.value;
              if (
                (motive + growth + strength + next).replace(/\s/g, "").length <=
                200
              ) {
                setGoal(next);
              }
            }}
          ></textarea>
          <p>
            공백 포함 <strong>{goal.length}자</strong> 공백 제외{" "}
            <strong>{goal.replace(/\s/g, "").length}자</strong>
          </p>
        </div>
        <div>
          <div>
            {/* 누르면 패널을 열고, 숨겼던 카드도 다시 보이게 함 */}
            <button
              type="button"
              onClick={() => {
                setShowFeedback(true);
                setShowCard(true);
              }}
            >
              AI 첨삭 받기
            </button>
            <button type="button">맞춤법 검사</button>
          </div>
          <button type="button">답변 저장</button>
        </div>
      </section>
      {/* 오른쪽 첨삭 패널: showFeedback이 true일 때만 보임 */}
      {showFeedback && (
        <aside>
          <div>
            <h2>자소서 첨삭</h2>
            <button type="button" onClick={() => setShowFeedback(false)}>
              ✕
            </button>
          </div>

          {/* 카드 1: 수정 필요 (항상 보임) */}
          <div>
            <span>수정 필요</span>
            <p>
              <strong>수정안</strong> · 저는 근거로 결정하는 개발자가 되고자
              지원했습니다. 사용자 피드백으로 화면 흐름을 다시 설계한 경험이 그
              출발점입니다.
            </p>
            <p>
              <strong>수정 이유</strong> · 지원 이유가 마지막 문장에 있어요. 첫
              문장으로 올리면 핵심이 바로 보여요.
            </p>
          </div>

          {/* 카드 2: 문장 다듬기 ("무시"를 누르면 showCard가 false가 되어 사라짐) */}
          {showCard && (
            <div>
              <span>문장 다듬기</span>
              <p>
                {/* del: 취소선, 고치기 전 문장 */}
                <del>
                  이 경험을 통해 문제를 작게 쪼개고 근거를 바탕으로 결정하는
                  습관을 갖게 되었고 입사 후에도 이런 방식으로 서비스를 개선하는
                  데 기여하고 싶습니다.
                </del>
              </p>
              <p>
                <strong>수정안</strong> · 이 경험으로 문제를 작게 나누고 근거로
                결정하는 습관을 얻었습니다. 입사 후에도 같은 방식으로 서비스
                개선에 기여하겠습니다.
              </p>
              <p>
                <strong>수정 이유</strong> · 한 문장에 '배운 점'과 '포부'가 함께
                있어요. 두 문장으로 나누면 전달력이 높아져요.
              </p>
              <div>
                <button type="button">적용</button>
                <button type="button" onClick={() => setShowCard(false)}>
                  무시
                </button>
              </div>
            </div>
          )}
        </aside>
      )}
    </main>
  );
}

// 다른 파일(App.jsx)에서 <Cl />로 가져다 쓸 수 있게 내보냄
export default Cl;
