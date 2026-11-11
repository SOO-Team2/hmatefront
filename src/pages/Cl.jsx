import { useEffect, useState } from "react";
import { useLocation } from "react-router";

// ---------------------------------------------------------------------------
// 설정
// ---------------------------------------------------------------------------

// 서버(FastAPI) 주소. 배포하면 주소가 바뀌어서 한곳에 모아 둔다.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const GUEST_LIMIT = 500;
const MEMBER_LIMIT = 4000;
// /\s/g : 공백을 전부 찾는 규칙, replace(..., "") : 찾은 공백을 지움
const count = (text) => text.replace(/\s/g, "").length;

function Cl() {
  // 마이페이지 "수정"으로 들어오면 그 자소서, 그냥 들어오면 undefined
  const editCl = useLocation().state?.cl;

  // ---------------------------------------------------------------------------
  // 자소서 입력
  // ---------------------------------------------------------------------------

  const [motivation, setMotivation] = useState(editCl?.motivation ?? "");
  const [experience, setExperience] = useState(editCl?.experience ?? "");
  const [personality, setPersonality] = useState(editCl?.personality ?? "");
  const [plan, setPlan] = useState(editCl?.plan ?? "");

  // 저장된 토큰. LoginModal이 "access_token" 이름으로 저장함
  const token = localStorage.getItem("access_token");

  const isMember = token !== null;
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // 이 사용자의 글자 수 한도 # 조건 ? 참일_때_값 : 거짓일_때_값
  const LIMIT = isMember ? MEMBER_LIMIT : GUEST_LIMIT;

  const total = (motivation + experience + personality + plan).length;

  const values = { motivation, experience, personality, plan };
  const setters = {
    motivation: setMotivation,
    experience: setExperience,
    personality: setPersonality,
    plan: setPlan,
  };

  // 이 칸(key)의 글을 next로 바꿔도 한도(LIMIT) 안인지
  // 전체 − 그 칸의 예전 글자 수 + 새 글자 수 ≤ LIMIT
  // 또는 글자 수가 줄어드는 변경(지우기)이면 한도를 넘은 상태여도 허용
  const inLimit = (key, next) =>
    total - values[key].length + next.length <= LIMIT ||
    next.length <= values[key].length;

  // 입력칸에 글을 쓸 때: 한도(LIMIT) 안이면 반영, 넘으면 무시 → 입력이 막힘
  const change = (key, next) => {
    if (inLimit(key, next)) {
      setters[key](next);
    }
  };

  // ---------------------------------------------------------------------------
  // 제목 추천
  // ---------------------------------------------------------------------------

  // 제목 입력칸의 글
  const [title, setTitle] = useState(editCl?.title ?? "");
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleError, setTitleError] = useState("");

  // "제목 추천" 버튼: 서버에서 추천 제목을 받아 제목 칸에 넣기
  const askTitle = async () => {
    setTitleError("");
    setTitleLoading(true);
    try {
      const res = await fetch(`${API_URL}/cl/title`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ motivation, experience, personality, plan }),
      });
      if (!res.ok) {
        setTitleError("제목을 불러오는 중 오류가 발생했습니다.");
        return;
      }
      const data = await res.json(); // 서버의 답을 읽기
      setTitle(data.titles[0]); // 제목 칸에 넣기 → 화면에 보임
    } catch {
      setTitleError("서버에 연결할 수 없습니다.");
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
    setShowFeedback(true); // 오른쪽 패널 열기
    setPanelTitle(name); // 패널 제목 정하기
    setLoading(true); // "기다리는 중" 켜기 → 버튼 꺼짐
    setError(""); // 지난 오류 문구 지우기
    setNotice(""); // 지난 안내 문구 지우기
    setFeedbacks([]); // 지난 카드 지우기
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          motivation,
          experience,
          personality,
          plan,
        }),
      });
      // 서버 오류(400, 502 등)는 catch로 안 가서, res.ok로 직접 확인
      if (!res.ok) {
        setError("결과를 불러오는 중 오류가 발생했습니다.");
        return;
      }
      const data = await res.json(); // 서버의 답을 읽기
      setFeedbacks(data.feedbacks); // 카드 목록에 넣기 → 패널에 카드가 보임
      if (data.warnings.length > 0) {
        // 빠진 결과가 있으면
        setNotice("일부 결과는 기준을 통과하지 못해 제외했습니다.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      // 성공이든 실패든 "기다리는 중" 끄기
      setLoading(false);
    }
  };

  const ignore = (card) => {
    setFeedbacks(
      feedbacks.filter((other) => other.sentence_id !== card.sentence_id),
    );
  };

  const apply = (card) => {
    const current = values[card.section]; // ① 이 카드 칸의 지금 글
    if (!current.includes(card.original)) {
      // ② 원문이 아직 있나?
      setError("원문이 이미 바뀌어서 적용할 수 없습니다.");
      return;
    }

    const next = current.replace(card.original, card.suggestion); // ③ 원문 → 수정안으로 바꾼 글
    if (!inLimit(card.section, next)) {
      // ④ 바꿔도 한도 안인가?
      setError(`적용하면 글자 수 한도(${LIMIT}자)를 넘습니다.`);
      return;
    }
    setters[card.section](next); // ⑤ 그 칸에 반영
    ignore(card); // ⑥ 다 쓴 카드는 지우기
    setError(""); // ⑦ 앞에 떴던 오류 문구 지우기
  };

  // ---------------------------------------------------------------------------
  // 마이페이지에 저장
  // ---------------------------------------------------------------------------

  // 저장 중인지, 저장 결과 문구 (빈 글자 = 없음)
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  // 이미 저장한 자소서 번호 (null = 아직 저장 안 함, 수정으로 들어오면 그 번호)
  const [savedId, setSavedId] = useState(editCl?.cl_id ?? null);
  // 마지막으로 저장한 글 (지금 글과 다르면 저장 안 한 내용이 있는 것)
  // 수정으로 들어오면 불러온 글이 곧 저장한 글이다
  const [savedText, setSavedText] = useState(
    title + motivation + experience + personality + plan,
  );
  const currentText = title + motivation + experience + personality + plan;
  const hasUnsaved = currentText !== savedText;

  // 저장 안 한 글이 있으면 페이지를 떠나기 전에 경고한다
  useEffect(() => {
    if (!hasUnsaved) return;

    // 메뉴·로고 링크를 누를 때
    const onClick = (e) => {
      const link = e.target.closest("a");
      if (!link || link.pathname === window.location.pathname) return; // 링크가 아니거나 같은 페이지면 통과
      if (
        !confirm("저장되지 않은 내용이 있습니다. 페이지를 이동하시겠습니까?")
      ) {
        e.preventDefault(); // 취소를 누르면 이동을 막는다
        e.stopPropagation();
      }
    };
    // 새로고침하거나 탭을 닫을 때
    const onUnload = (e) => e.preventDefault();

    document.addEventListener("click", onClick, true); // true: 링크가 처리하기 전에 먼저 받는다
    window.addEventListener("beforeunload", onUnload);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [hasUnsaved]);

  // "마이페이지에 저장" 버튼: 제목과 자소서 4칸을 서버에 보내 저장한다
  const save = async () => {
    setSaveMessage(""); // ① 지난 문구 지우기
    setSaving(true); // ② "저장 중" 켜기 → 버튼 꺼짐
    try {
      // ③ 처음이면 새로 저장, 저장한 적 있으면 덮어쓰기
      const res = await fetch(
        savedId ? `${API_URL}/mypage/cl/${savedId}` : `${API_URL}/cl/save`,
        {
          method: savedId ? "PUT" : "POST",
          headers: headers,
          body: JSON.stringify({
            title,
            motivation,
            experience,
            personality,
            plan,
          }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        setSavedId(data.cl_id); // 다음 저장은 이 번호에 덮어쓴다
        setSavedText(currentText); // 지금 글을 "저장한 글"로 기억한다
        setSaveMessage("저장됨"); // ④ 성공
      } else if (res.status === 401) {
        setSaveMessage("로그인 후 저장할 수 있습니다."); // ⑤ 로그인 안 함
      } else {
        setSaveMessage("저장 중 오류가 발생했습니다."); // ⑥ 그 밖의 실패 (400, 500 등)
      }
    } catch {
      // ⑦ 연결 실패 (서버 꺼짐, 와이파이 다름)
      setSaveMessage("서버에 연결할 수 없습니다.");
    } finally {
      // ⑧ 성공이든 실패든 마지막에
      setSaving(false); //  "저장 중" 끄기 → 버튼 다시 켜짐
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  // ---------------------------------------------------------------------------
  // 화면
  // ---------------------------------------------------------------------------

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-12 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          자기소개서
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-2xs">
          {isMember ? "전체 글자 수" : "비회원 글자 수"}{" "}
          <strong className="text-brand font-bold">
            {total} / {LIMIT}자
          </strong>
        </span>
      </div>

      <section
        className={`${
          showFeedback ? "lg:col-span-7" : "lg:col-span-12"
        } rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-2xs space-y-8`}
      >
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">
            제목
          </label>
          <div className="flex gap-2.5">
            <input
              type="text"
              placeholder="제목을 입력하거나 제목 추천을 받아보세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
            />
            <button
              type="button"
              onClick={askTitle}
              disabled={titleLoading || total === 0}
              className="shrink-0 rounded-xl border border-brand bg-white px-4 py-3 text-sm font-bold text-brand hover:bg-brand-soft transition-colors disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              {" "}
              제목 추천
            </button>
          </div>
          {titleError && (
            <p className="text-xs font-medium text-danger mt-2">{titleError}</p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-2.5">
          <h2 className="text-sm font-extrabold text-gray-900">① 지원 동기</h2>
          <textarea
            placeholder="지원 동기를 작성해 주세요."
            value={motivation}
            onChange={(e) => change("motivation", e.target.value)}
            className="w-full min-h-[140px] rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 resize-y"
          ></textarea>
          <p className="text-xs text-gray-500">
            공백 포함{" "}
            <strong className="font-bold text-gray-900 mr-2">
              {motivation.length}자
            </strong>{" "}
            공백 제외{" "}
            <strong className="font-bold text-gray-900">
              {count(motivation)}자
            </strong>
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-2.5">
          <h2 className="text-sm font-extrabold text-gray-900">
            ② 경험 및 역량
          </h2>
          <textarea
            placeholder="경험 및 역량을 작성해 주세요."
            value={experience}
            onChange={(e) => change("experience", e.target.value)}
            className="w-full min-h-[140px] rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 resize-y"
          ></textarea>
          <p className="text-xs text-gray-500">
            공백 포함{" "}
            <strong className="font-bold text-gray-900 mr-2">
              {experience.length}자
            </strong>{" "}
            공백 제외{" "}
            <strong className="font-bold text-gray-900">
              {count(experience)}자
            </strong>
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-2.5">
          <h2 className="text-sm font-extrabold text-gray-900">
            ③ 인성 및 협업
          </h2>
          <textarea
            placeholder="인성 및 협업을 작성해 주세요."
            value={personality}
            onChange={(e) => change("personality", e.target.value)}
            className="w-full min-h-[140px] rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 resize-y"
          ></textarea>
          <p className="text-xs text-gray-500">
            공백 포함{" "}
            <strong className="font-bold text-gray-900 mr-2">
              {personality.length}자
            </strong>{" "}
            공백 제외{" "}
            <strong className="font-bold text-gray-900">
              {count(personality)}자
            </strong>
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-2.5">
          <h2 className="text-sm font-extrabold text-gray-900">
            ④ 입사 후 포부
          </h2>
          <textarea
            placeholder="입사 후 포부를 작성해 주세요."
            value={plan}
            onChange={(e) => change("plan", e.target.value)}
            className="w-full min-h-[140px] rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 resize-y"
          ></textarea>
          <p className="text-xs text-gray-500">
            공백 포함{" "}
            <strong className="font-bold text-gray-900 mr-2">
              {plan.length}자
            </strong>{" "}
            공백 제외{" "}
            <strong className="font-bold text-gray-900">{count(plan)}자</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 기다리는 중이거나 글이 없으면 버튼을 끔 (중복 요금, 서버 거절 방지) */}
            <button
              type="button"
              onClick={() => askCards("/cl/feedback", "AI 첨삭")}
              disabled={loading || total === 0}
              className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              AI 첨삭 받기
            </button>
            <button
              type="button"
              onClick={() => askCards("/cl/spellcheck", "맞춤법 검사")}
              disabled={loading || total === 0}
              className="rounded-xl border border-brand bg-white px-5 py-3 text-sm font-bold text-brand hover:bg-brand-soft transition-colors disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
            >
              맞춤법 검사
            </button>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {saveMessage && (
              <p className="text-xs font-medium text-brand mr-2">
                {saveMessage}
              </p>
            )}
            <button
              type="button"
              onClick={save}
              disabled={saving || total === 0 || !title.trim()}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {" "}
              저장하기
            </button>
          </div>
        </div>
      </section>

      {showFeedback && (
        <aside className="lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-gray-900">
              {panelTitle}
            </h2>
            <button
              type="button"
              onClick={() => setShowFeedback(false)}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm transition-colors"
            >
              ✕
            </button>
          </div>

          {loading && (
            <p className="text-sm text-gray-500 py-8 text-center">
              작성하신 내용을 분석 중입니다.
            </p>
          )}
          {error && (
            <p className="text-xs font-medium text-danger bg-danger-bg border border-danger-border rounded-xl p-3">
              {error}
            </p>
          )}
          {notice && (
            <p className="text-xs font-medium text-warn-text bg-warn-bg border border-warn-border rounded-xl p-3">
              {notice}
            </p>
          )}
          {!loading && !error && feedbacks.length === 0 && (
            <p className="text-sm text-gray-500 py-8 text-center">
              수정 사항이 없습니다.
            </p>
          )}

          {feedbacks.map((card) => (
            <div
              key={card.sentence_id}
              className={`rounded-2xl border p-5 space-y-3 ${
                card.tag === "수정 필요"
                  ? "border-gray-200 bg-white"
                  : "border-brand-border bg-white"
              }`}
            >
              <span
                className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${
                  card.tag === "수정 필요"
                    ? "bg-warn-badge text-warn-text"
                    : "bg-brand-light text-brand"
                }`}
              >
                {card.tag}
              </span>
              <p className="text-sm text-gray-400 leading-relaxed">
                <del>{card.original}</del>
              </p>
              <p className="text-sm text-gray-900 leading-relaxed">
                <strong className="text-brand font-bold">수정안</strong> ·{" "}
                {card.suggestion}
              </p>
              {panelTitle !== "맞춤법 검사" && (
                <p className="rounded-xl bg-gray-100 p-3.5 text-xs text-gray-700 leading-relaxed">
                  <strong className="font-bold text-gray-900">수정 이유</strong>{" "}
                  · {card.reason}
                </p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => apply(card)}
                  className="rounded-lg bg-brand px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-hover transition-colors"
                >
                  적용
                </button>
                <button
                  type="button"
                  onClick={() => ignore(card)}
                  className="rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
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
