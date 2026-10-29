import { useState } from "react";

// ---------------------------------------------------------------------------
// 설정
// ---------------------------------------------------------------------------

// 서버(FastAPI) 주소. 배포하면 주소가 바뀌어서 한곳에 모아 둔다.
const API_URL = "http://192.168.1.13:8000";
// 비회원 맛보기 글자 수 한도 (공백 제외)
// 서버(routes/cl.py)의 GUEST_MAX_TOTAL_CHARS, MEMBER_MAX_TOTAL_CHARS도 같이 바꿀 것
const GUEST_LIMIT = 500;
// 회원 글자 수 한도 (공백 제외)
const MEMBER_LIMIT = 7000;
// /\s/g : 공백을 전부 찾는 규칙, replace(..., "") : 찾은 공백을 지움
const count = (text) => text.replace(/\s/g, "").length;

function Cl() {
  // ---------------------------------------------------------------------------
  // 자소서 입력
  // ---------------------------------------------------------------------------

  // 항목 4개에 입력한 글자 (처음엔 빈 글자 "")
  const [motivation, setMotivation] = useState("");
  const [growth, setGrowth] = useState("");
  const [personality, setPersonality] = useState("");
  const [plan, setPlan] = useState("");

  // 회원인지 (TODO: auth.py이 생기면 실제 로그인 여부로 바꾸기)
  const isMember = false;
  // 이 사용자의 글자 수 한도 # 조건 ? 참일_때_값 : 거짓일_때_값
  const LIMIT = isMember ? MEMBER_LIMIT : GUEST_LIMIT;

  const total = count(motivation + growth + personality + plan);

  const values = { motivation, growth, personality, plan };
  const setters = {
    motivation: setMotivation,
    growth: setGrowth,
    personality: setPersonality,
    plan: setPlan,
  };

  // 이 칸(key)의 글을 next로 바꿔도 한도(LIMIT) 안인지
  // 전체 − 그 칸의 예전 글자 수 + 새 글자 수 ≤ 500
  const inLimit = (key, next) =>
    total - count(values[key]) + count(next) <= LIMIT;

  // 입력칸에 글을 쓸 때: 500자 안이면 반영, 넘으면 무시 → 입력이 막힘
  const change = (key, next) => {
    if (inLimit(key, next)) {
      setters[key](next);
    }
  };

  // ---------------------------------------------------------------------------
  // 제목 추천
  // ---------------------------------------------------------------------------

  // 제목 입력칸의 글
  const [title, setTitle] = useState("");
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleError, setTitleError] = useState("");

  // "제목 추천" 버튼: 서버에서 추천 제목을 받아 제목 칸에 넣기
  const askTitle = async () => {
    setTitleError("");
    setTitleLoading(true);
    try {
      const res = await fetch(`${API_URL}/cl/title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivation, growth, personality, plan }),
      });
      if (!res.ok) {
        setTitleError("제목을 불러오지 못했습니다.");
        return;
      }
      const data = await res.json();    // 서버의 답을 읽기
      setTitle(data.titles[0]);         // 제목 칸에 넣기 → 화면에 보임
    } catch {
      setTitleError("서버에 연결할 수 없습니다. 서버가 켜져 있는지 확인해 주세요.");
    } finally {
      setTitleLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 첨삭·맞춤법 패널
  // ---------------------------------------------------------------------------

  // 오른쪽 첨삭 패널이 열려 있는지 (false = 닫힘)
  const [showFeedback, setShowFeedback] = useState(false);
  // 패널 제목
  const [panelTitle, setPanelTitle] = useState("");
  // 서버가 돌려준 첨삭 카드 목록. 카드를 "무시" or "적용"하면 여기서 빠진다
  const [feedbacks, setFeedbacks] = useState([]);
  // 서버 응답을 기다리는 중인지
  const [loading, setLoading] = useState(false);
  // 패널에 보여줄 오류 메시지 (빈 글자 = 오류 없음)
  const [error, setError] = useState("");
  // 기준을 통과 못 해 빠진 결과가 있을 때 보여줄 안내 (빈 글자 = 없음)
  const [notice, setNotice] = useState("");

  // path: "/cl/feedback"(첨삭), "/cl/spellcheck"(맞춤법)
  // name: 패널 제목에 보여줄 이름
  const askCards = async (path, name) => {
    setShowFeedback(true);  // 오른쪽 패널 열기
    setPanelTitle(name);    // 패널 제목 정하기
    setLoading(true);       // "기다리는 중" 켜기 → 버튼 꺼짐
    setError("");           // 지난 오류 문구 지우기
    setNotice("");          // 지난 안내 문구 지우기
    setFeedbacks([]);       // 지난 카드 지우기
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivation,
          growth,
          personality,
          plan,
        }),
      });
      // 서버 오류(400, 502 등)는 catch로 안 가서, res.ok로 직접 확인
      if (!res.ok) {
        setError("결과를 불러오지 못했습니다.");
        return;
      }
      const data = await res.json();  // 서버의 답을 읽기
      setFeedbacks(data.feedbacks);   // 카드 목록에 넣기 → 패널에 카드가 보임
      if (data.warnings.length > 0) { // 빠진 결과가 있으면
        setNotice("일부 결과는 기준을 통과하지 못해 제외했어요.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다. 서버가 켜져 있는지 확인해 주세요.");
    } finally {     // 성공이든 실패든 "기다리는 중" 끄기
      setLoading(false);
    }
  };

  const ignore = (card) => {
    setFeedbacks(feedbacks.filter((other) => other.sentence_id !== card.sentence_id));
  };

  const apply = (card) => {
    const current = values[card.section];       // ① 이 카드 칸의 지금 글
    if (!current.includes(card.original)) {     // ② 원문이 아직 있나?
      setError("원문이 이미 바뀌어서 적용할 수 없습니다.");
      return;
    }

    const next = current.replace(card.original, card.suggestion); // ③ 원문 → 수정안으로 바꾼 글
    if (!inLimit(card.section, next)) {                           // ④ 바꿔도 200자 안인가?
      setError(`적용하면 글자 수 한도(${LIMIT}자)를 넘어요.`);
      return;
    }
    setters[card.section](next);          // ⑤ 그 칸에 반영
    ignore(card);                         // ⑥ 다 쓴 카드는 지우기
    setError("");                         // ⑦ 앞에 떴던 오류 문구 지우기
  };

  // ---------------------------------------------------------------------------
  // 마이페이지에 저장
  // ---------------------------------------------------------------------------

  // 저장 중인지, 저장 결과 문구 (빈 글자 = 없음)
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // "마이페이지에 저장" 버튼: 제목과 자소서 4칸을 서버에 보내 저장한다
  // auth.py이 생기면 로그인 정보도 같이 보내기
  const save = async () => {
    setSaveMessage("");               // ① 지난 문구 지우기
    setSaving(true);                  // ② "저장 중" 켜기 → 버튼 꺼짐
    try {
      const res = await fetch(`${API_URL}/cl/save`, {   // ③ /cl/save로
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, motivation, growth, personality, plan }),
      });
      if (res.ok) {
        setSaveMessage("마이페이지에 저장했어요.");     // ④ 성공
      } else if (res.status === 401) {
        setSaveMessage("로그인 후 저장할 수 있어요.");   // ⑤ 로그인 안 함
      } else {
        setSaveMessage("저장하지 못했습니다.");         // ⑥ 그 밖의 실패 (400, 500 등)
      }
    } catch {                                   // ⑦ 연결 실패 (서버 꺼짐, 와이파이 다름)
      setSaveMessage("서버에 연결할 수 없습니다. 서버가 켜져 있는지 확인해 주세요.");
    } finally {                                 // ⑧ 성공이든 실패든 마지막에
      setSaving(false);                         //  "저장 중" 끄기 → 버튼 다시 켜짐
    }
  };

  // ---------------------------------------------------------------------------
  // 화면
  // ---------------------------------------------------------------------------

  return (
    <main>
      <div>
        <h1>자기소개서</h1>
        <span>
          {isMember ? "글자 수" : "비회원 맛보기"} <strong>{total} / {LIMIT}자</strong>
        </span>
      </div>
      <section>
        <label>제목</label>
        <div>
          <input
            type="text"
            placeholder="제목을 입력하거나 '제목 추천'을 눌러보세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <button
            type="button"
            onClick={askTitle}
            disabled={titleLoading || total === 0}
          >
            제목 추천
          </button>
        </div>
        {titleError && <p>{titleError}</p>}

        <div>
          <h2>① 지원 동기</h2>
          <textarea
            placeholder="지원 동기를 작성해 주세요."
            value={motivation}
            onChange={(e) => change("motivation", e.target.value)}
          ></textarea>
          <p>
            공백 포함 <strong>{motivation.length}자</strong> 공백 제외{" "}
            <strong>{count(motivation)}자</strong>
          </p>
        </div>
        <div>
          <h2>② 성장 과정</h2>
          <textarea
            placeholder="성장 과정을 작성해 주세요."
            value={growth}
            onChange={(e) => change("growth", e.target.value)}
          ></textarea>
          <p>
            공백 포함 <strong>{growth.length}자</strong> 공백 제외{" "}
            <strong>{count(growth)}자</strong>
          </p>
        </div>

        <div>
          <h2>③ 성격의 장단점</h2>
          <textarea
            placeholder="성격의 장단점을 작성해 주세요."
            value={personality}
            onChange={(e) => change("personality", e.target.value)}
          ></textarea>
          <p>
            공백 포함 <strong>{personality.length}자</strong> 공백 제외{" "}
            <strong>{count(personality)}자</strong>
          </p>
        </div>

        <div>
          <h2>④ 입사 후 포부</h2>
          <textarea
            placeholder="입사 후 포부를 작성해 주세요."
            value={plan}
            onChange={(e) => change("plan", e.target.value)}
          ></textarea>
          <p>
            공백 포함 <strong>{plan.length}자</strong> 공백 제외{" "}
            <strong>{count(plan)}자</strong>
          </p>
        </div>
        <div>
          <div>
            {/* 기다리는 중이거나 글이 없으면 버튼을 끔 (중복 요금, 서버 거절 방지) */}
            <button
              type="button"
              onClick={() => askCards("/cl/feedback", "자소서 첨삭")}
              disabled={loading || total === 0}
            >
              AI 첨삭 받기
            </button>
            <button
              type="button"
              onClick={() => askCards("/cl/spellcheck", "맞춤법 검사")}
              disabled={loading || total === 0}
            >
              맞춤법 검사
            </button>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving || total === 0 || !title.trim()}
          >
            마이페이지에 저장
          </button>
          {saveMessage && <p>{saveMessage}</p>}
        </div>
      </section>

      {showFeedback && (
        <aside>
          <div>
            <h2>{panelTitle}</h2>
            <button type="button" onClick={() => setShowFeedback(false)}>
              ✕
            </button>
          </div>

          {loading && <p>결과를 만드는 중입니다…</p>}
          {error && <p>{error}</p>}
          {notice && <p>{notice}</p>}
          {!loading && !error && feedbacks.length === 0 && (
            <p>남은 결과가 없습니다.</p>
          )}

          {feedbacks.map((card) => (
            <div key={card.sentence_id}>
              <span>{card.tag}</span>
              <p>
                <del>{card.original}</del>
              </p>
              <p>
                <strong>수정안</strong> · {card.suggestion}
              </p>
              <p>
                <strong>수정 이유</strong> · {card.reason}
              </p>
              <div>
                <button type="button" onClick={() => apply(card)}>
                  적용
                </button>
                <button type="button" onClick={() => ignore(card)}>
                  무시
                </button>
              </div>
            </div>
          ))}
        </aside>
      )}
    </main>
  );
}

export default Cl;
