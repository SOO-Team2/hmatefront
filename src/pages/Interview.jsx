import { useState } from "react";
import ClModal from "../components/modals/ClModal";
import ResumeModal from "../components/modals/ResumeModal";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const CATEGORIES = [
  "지원 동기",
  "경험 및 역량",
  "인성 및 협업",
  "입사 후 포부",
];
const JOB_CATS = {
  "기획·전략": [
    "경영·비즈니스기획",
    "웹기획",
    "마케팅기획",
    "PL·PM·PO",
    "컨설턴트",
    "AI기획자",
    "AI사업전략",
  ],
  "인사·HR": [
    "인사담당자",
    "HRD·HRM",
    "노무관리자",
    "잡매니저",
    "헤드헌터",
    "직업상담사",
  ],
  "회계·세무": [
    "회계담당자",
    "경리",
    "세무담당자",
    "재무담당자",
    "감사",
    "IR·공시",
    "회계사",
    "세무사",
    "관세사",
  ],
  "마케팅·광고·MD": [
    "AE(광고기획자)",
    "브랜드마케터",
    "퍼포먼스마케터",
    "CRM마케터",
    "온라인마케터",
    "콘텐츠마케터",
    "홍보",
    "설문·리서치",
    "MD",
    "카피라이터",
    "크리에이티브디렉터",
    "채널관리자",
    "그로스해커",
  ],
  "AI·개발·데이터": [
    "백엔드개발자",
    "프론트엔드개발자",
    "웹개발자",
    "앱개발자",
    "시스템엔지니어",
    "네트워크엔지니어",
    "DBA",
    "데이터엔지니어",
    "데이터사이언티스트",
    "보안엔지니어",
    "소프트웨어개발자",
    "게임개발자",
    "하드웨어개발자",
    "AI/ML엔지니어",
    "클라우드엔지니어",
    "웹퍼블리셔",
    "IT컨설팅",
    "QA",
    "AI/ML연구원",
    "데이터분석가",
    "데이터라벨러",
    "프롬프트엔지니어",
    "AI보안전문가",
    "MLOps엔지니어",
    "AI서비스개발자",
  ],
  디자인: [
    "그래픽디자이너",
    "3D디자이너",
    "제품디자이너",
    "산업디자이너",
    "광고디자이너",
    "시각디자이너",
    "영상디자이너",
    "웹디자이너",
    "UI·UX디자이너",
    "패션디자이너",
    "편집디자이너",
    "실내디자이너",
    "공간디자이너",
    "캐릭터디자이너",
    "환경디자이너",
    "아트디렉터",
    "일러스트레이터",
  ],
  "엔지니어링·설계": [
    "전기·전자엔지니어",
    "기계엔지니어",
    "설계엔지니어",
    "설비엔지니어",
    "반도체엔지니어",
    "화학엔지니어",
    "공정엔지니어",
    "하드웨어엔지니어",
    "통신엔지니어",
    "RF엔지니어",
    "필드엔지니어",
    "R&D·연구원",
    "AI로봇엔지니어",
  ],
};

function Interview() {
  const [catMajor, setCatMajor] = useState("기획·전략"); // 직무 대분류
  const [catMinor, setCatMinor] = useState("경영·비즈니스기획"); // 직무 소분류
  const [resumePdf, setResumePdf] = useState(null); // 이력서 PDF
  const [clPdf, setClPdf] = useState(null); // 자기소개서 PDF
  const [title, setTitle] = useState("기획·전략 > 경영·비즈니스기획"); //대화 제목
  const [messages, setMessages] = useState([]); // 질문·답변
  const [evidences, setEvidences] = useState([]); // 근거 문장
  const [filenames, setFilenames] = useState([]); // 해시 파일명
  const [isGenerating, setIsGenerating] = useState(false); // 질문 생성 중 여부
  // [꼬리질문/진행도 관리] 현재 진행 중인 카테고리 인덱스 (0: 지원 동기 ~ 3: 입사 후 포부)
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  // [꼬리질문/진행도 관리] 답변이 완료된 카테고리 인덱스 목록 ([0, 1, ...])
  const [completedCategories, setCompletedCategories] = useState([]);
  const [firstQuestion, setFirstQuestion] = useState(null); // 자기소개 뒤에 보여 줄 첫 질문

  const [showResumeModal, setShowResumeModal] = useState(false); // 이력서 모달 열림
  const [showClModal, setShowClModal] = useState(false); // 자기소개서 모달 열림
  const [myResume, setMyResume] = useState(""); // 내 이력서 합친 글
  const [myCl, setMyCl] = useState(null); // 내 자기소개서

  const askQuestion = async () => {
    setTitle(`${catMajor} > ${catMinor}`); //제목 변경
    setIsGenerating(true);
    // [꼬리질문/진행도 초기화] 새 질문 생성 시 1번째 카테고리(지원 동기)부터 시작
    setCurrentCategoryIndex(0);
    setCompletedCategories([]);

    try {
      const formData = new FormData();
      formData.append("job", catMinor);
      if (resumePdf) formData.append("resume_pdf", resumePdf);
      else if (myResume) formData.append("my_resume", myResume);
      if (clPdf) formData.append("cl_pdf", clPdf);
      else if (myCl) formData.append("my_cl", myCl.text);
      const res = await fetch(`${API_URL}/question`, {
        method: "POST",
        body: formData, //FormData는 headers 쓰면 안 됨
      });
      const data = await res.json();
      setFilenames(data.filenames || []);
      setEvidences([]);
      setFirstQuestion({
        text: data.question,
        evidences: data.evidences || [],
      });
      setMessages([
        {
          type: "question",
          text: `안녕하세요. 지원자님, 자기소개 부탁드립니다.`,
        },
      ]);
    } catch {
      // 질문 생성 실패 처리
    } finally {
      setIsGenerating(false);
    }
  };
  // 답변과 서류를 비교해서, 결과를 그 답변 메시지에 붙인다
  const verifyAnswer = async (answerIndex, text) => {
    try {
      const res = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: text, filenames }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === answerIndex
            ? { ...msg, mismatches: data.mismatches || [] }
            : msg,
        ),
      );
    } catch {
      // 검증이 실패해도 면접은 계속 진행한다
    }
  };

  const submitAnswer = async (e) => {
    if (isGenerating) return;
    const textarea = e.currentTarget.previousElementSibling;
    const text = textarea.value;
    if (!text.trim() || messages.at(-1)?.type !== "question") return;
    textarea.value = "";

    const lastQuestionMsg = messages.at(-1); // 직전에 AI 면접관이 한 질문
    const newAnswerIndex = messages.length;
    setMessages((prev) => [...prev, { type: "answer", text }]);
    verifyAnswer(newAnswerIndex, text);

    // [자기소개 답변 처리] 자기소개 답변이면 미리 만들어 둔 첫 질문(지원 동기)을 보여 준다
    if (firstQuestion) {
      setEvidences([firstQuestion.evidences]);
      setMessages((prev) => [
        ...prev,
        {
          type: "question",
          category: CATEGORIES[0],
          text: firstQuestion.text,
          isFollowup: false,
        },
      ]);
      setFirstQuestion(null);
      return;
    }

    setIsGenerating(true);
    try {
      const currentCategory =
        lastQuestionMsg?.category || CATEGORIES[currentCategoryIndex];
      const job = title.split(" > ")[1] || catMinor;

      // [꼬리질문 판단] 직전 질문이 메인 질문인 경우(/followup API 호출)
      // 백엔드에서 답변 내용을 분석해 꼬리질문이 필요한지 판단
      if (!lastQuestionMsg?.isFollowup) {
        const followupRes = await fetch(`${API_URL}/followup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: currentCategory,
            job,
            question: lastQuestionMsg.text,
            answer: text,
            filenames,
          }),
        });

        if (followupRes.ok) {
          const followupData = await followupRes.json();
          // 백엔드에서 꼬리질문 생성이 필요하다고 판단한 경우
          if (followupData.is_followup && followupData.question) {
            setMessages((prev) => [
              ...prev,
              {
                type: "question",
                category: currentCategory,
                text: followupData.question,
                isFollowup: true, // 꼬리질문 플래그 등록
              },
            ]);
            return; // 카테고리를 넘기지 않고 꼬리질문 답변 대기
          }
        }
      }

      // [카테고리 완료] 꼬리질문이 불필요하거나, 이미 꼬리질문 답변을 마친 경우 현재 카테고리 완료
      setCompletedCategories((prev) =>
        prev.includes(currentCategoryIndex)
          ? prev
          : [...prev, currentCategoryIndex],
      );

      const nextCategoryIndex = currentCategoryIndex + 1;
      const nextCategory = CATEGORIES[nextCategoryIndex];

      // [면접 종료] 4개 카테고리(지원동기, 경험, 인성, 포부)를 모두 마쳤을 때
      if (!nextCategory) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              type: "end",
              text: "지원자님의 경험과 생각을 잘 들었습니다. 이것으로 면접을 마치겠습니다. 수고 많으셨습니다.",
            },
          ]);
        }, 1000);
        return;
      }

      // [다음 카테고리 이동] 다음 카테고리 메인 질문 생성 (/answer API 호출)
      setCurrentCategoryIndex(nextCategoryIndex);
      const res = await fetch(`${API_URL}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: nextCategory,
          job,
          filenames,
        }),
      });
      const data = await res.json();
      setEvidences((prev) => [...prev, data.evidences || []]);
      setMessages((prev) => [
        ...prev,
        {
          type: "question",
          category: nextCategory,
          text: data.question,
          isFollowup: false, // 새 카테고리의 메인 질문
        },
      ]);
    } catch {
      // 답변에 따른 다음 질문 생성 실패 처리
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      id="iv"
      className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
    >
      <header id="iv-head" className="lg:col-span-12">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          AI 면접
        </h1>
      </header>

      <div
        id="iv-setup"
        className="lg:col-span-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="field md:col-span-5">
            <label className="block text-xs font-bold text-gray-700 mb-2">
              직무
            </label>
            <div className="row grid grid-cols-2 gap-2.5">
              <select
                value={catMajor}
                onChange={(e) => {
                  const selectedMajor = e.target.value;
                  setCatMajor(selectedMajor);
                  setCatMinor(JOB_CATS[selectedMajor][0]);
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand focus:outline-none"
              >
                {Object.keys(JOB_CATS).map((major) => (
                  <option key={major}>{major}</option>
                ))}
              </select>
              <select
                value={catMinor}
                onChange={(e) => setCatMinor(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand focus:outline-none"
              >
                {JOB_CATS[catMajor]?.map((minor) => (
                  <option key={minor}>{minor}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field md:col-span-2">
            <div className="row flex items-center justify-end gap-1.5">
              {resumePdf || myResume ? (
                <>
                  {/* 넣은 이력서: 누르면 모달을 다시 열어 바꿀 수 있다 */}
                  <button
                    type="button"
                    onClick={() => setShowResumeModal(true)}
                    className="flex-1 min-w-0 truncate rounded-xl border border-brand-border bg-brand-light px-3.5 py-2.5 text-xs font-semibold text-brand hover:bg-brand-soft transition-colors text-left"
                  >
                    {resumePdf ? resumePdf.name : "내 이력서"}
                  </button>
                  <button
                    type="button"
                    aria-label="이력서 선택 해제"
                    onClick={() => {
                      setResumePdf(null);
                      setMyResume("");
                    }}
                    className="shrink-0 w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center text-xs transition-colors"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResumeModal(true)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:border-brand hover:text-brand hover:bg-brand-soft/40 transition-colors"
                >
                  + 이력서 추가
                </button>
              )}
            </div>
          </div>

          <div className="field md:col-span-2">
            <div className="row flex items-center justify-center gap-1.5">
              {clPdf || myCl ? (
                <>
                  {/* 넣은 자소서: 누르면 모달을 다시 열어 바꿀 수 있다 */}
                  <button
                    type="button"
                    onClick={() => setShowClModal(true)}
                    className="flex-1 min-w-0 truncate rounded-xl border border-brand-border bg-brand-light px-3.5 py-2.5 text-xs font-semibold text-brand hover:bg-brand-soft transition-colors text-left"
                  >
                    {clPdf ? clPdf.name : myCl.title}
                  </button>
                  <button
                    type="button"
                    aria-label="자기소개서 선택 해제"
                    onClick={() => {
                      setClPdf(null);
                      setMyCl(null);
                    }}
                    className="shrink-0 w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center text-xs transition-colors"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClModal(true)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:border-brand hover:text-brand hover:bg-brand-soft/40 transition-colors"
                >
                  + 자기소개서 추가
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-1 flex md:justify-end">
            <button
              type="button"
              disabled={isGenerating}
              className="btn-main w-full whitespace-nowrap rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={askQuestion}
            >
              {isGenerating ? "생성 중…" : "질문 생성"}
            </button>
          </div>
        </div>

        <div className="field pt-1">
          <label className="block text-xs font-bold text-gray-700 mb-2.5">
            질문 항목
          </label>
          {/* 꼬리질문 유무와 무관하게 각 카테고리가 완료(답변 제출)되었는지를 completedCategories로 판별 */}
          <div className="q-list grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              className={`q-item rounded-xl border p-4 ${
                completedCategories.includes(0)
                  ? "border-brand-border bg-white"
                  : "border-dashed border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-extrabold text-gray-900">
                ① 지원 동기
              </span>
              <p
                className={`text-xs mt-1 font-bold ${
                  completedCategories.includes(0)
                    ? "text-brand"
                    : "text-gray-400 font-medium"
                }`}
              >
                {completedCategories.includes(0) ? "완료" : "미입력"}
              </p>
            </div>
            <div
              className={`q-item rounded-xl border p-4 ${
                completedCategories.includes(1)
                  ? "border-brand-border bg-white"
                  : "border-dashed border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-extrabold text-gray-900">
                ② 경험 및 역량
              </span>
              <p
                className={`text-xs mt-1 font-bold ${
                  completedCategories.includes(1)
                    ? "text-brand"
                    : "text-gray-400 font-medium"
                }`}
              >
                {completedCategories.includes(1) ? "완료" : "미입력"}
              </p>
            </div>
            <div
              className={`q-item rounded-xl border p-4 ${
                completedCategories.includes(2)
                  ? "border-brand-border bg-white"
                  : "border-dashed border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-extrabold text-gray-900">
                ③ 인성 및 협업
              </span>
              <p
                className={`text-xs mt-1 font-bold ${
                  completedCategories.includes(2)
                    ? "text-brand"
                    : "text-gray-400 font-medium"
                }`}
              >
                {completedCategories.includes(2) ? "완료" : "미입력"}
              </p>
            </div>
            <div
              className={`q-item rounded-xl border p-4 ${
                completedCategories.includes(3)
                  ? "border-brand-border bg-white"
                  : "border-dashed border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-extrabold text-gray-900">
                ④ 입사 후 포부
              </span>
              <p
                className={`text-xs mt-1 font-bold ${
                  completedCategories.includes(3)
                    ? "text-brand"
                    : "text-gray-400 font-medium"
                }`}
              >
                {completedCategories.includes(3) ? "완료" : "미입력"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        id="iv-ev"
        className="lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs space-y-5"
      >
        <h3 className="text-lg font-extrabold text-gray-900">근거 문장</h3>
        {evidences.length === 0 && (
          <p className="text-xs text-gray-400 py-6 text-center">
            질문을 생성하면 근거 문장이 표시됩니다.
          </p>
        )}
        {evidences[0]?.length > 0 && (
          <div className="ev-group space-y-2">
            <p className="text-xs font-bold text-gray-500">① 지원 동기</p>
            <div className="q-list space-y-2">
              {evidences[0].map((ev, i) => (
                <div
                  key={i}
                  className="ev-item rounded-xl border border-brand-border bg-brand-soft p-3 text-xs text-gray-800 leading-relaxed"
                >
                  <span className="font-extrabold text-brand mr-1.5">
                    [1-{i + 1}]
                  </span>{" "}
                  {ev}
                </div>
              ))}
            </div>
          </div>
        )}
        {evidences[1]?.length > 0 && (
          <div className="ev-group space-y-2">
            <p className="text-xs font-bold text-gray-500">② 경험 및 역량</p>
            <div className="q-list space-y-2">
              {evidences[1].map((ev, i) => (
                <div
                  key={i}
                  className="ev-item rounded-xl border border-brand-border bg-brand-soft p-3 text-xs text-gray-800 leading-relaxed"
                >
                  <span className="font-extrabold text-brand mr-1.5">
                    [2-{i + 1}]
                  </span>{" "}
                  {ev}
                </div>
              ))}
            </div>
          </div>
        )}
        {evidences[2]?.length > 0 && (
          <div className="ev-group space-y-2">
            <p className="text-xs font-bold text-gray-500">③ 인성 및 협업</p>
            <div className="q-list space-y-2">
              {evidences[2].map((ev, i) => (
                <div
                  key={i}
                  className="ev-item rounded-xl border border-brand-border bg-brand-soft p-3 text-xs text-gray-800 leading-relaxed"
                >
                  <span className="font-extrabold text-brand mr-1.5">
                    [3-{i + 1}]
                  </span>{" "}
                  {ev}
                </div>
              ))}
            </div>
          </div>
        )}
        {evidences[3]?.length > 0 && (
          <div className="ev-group space-y-2">
            <p className="text-xs font-bold text-gray-500">④ 입사 후 포부</p>
            <div className="q-list space-y-2">
              {evidences[3].map((ev, i) => (
                <div
                  key={i}
                  className="ev-item rounded-xl border border-brand-border bg-brand-soft p-3 text-xs text-gray-800 leading-relaxed"
                >
                  <span className="font-extrabold text-brand mr-1.5">
                    [4-{i + 1}]
                  </span>{" "}
                  {ev}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        id="iv-chat"
        className="lg:col-span-8 rounded-2xl border border-gray-200 bg-white shadow-2xs flex flex-col overflow-hidden"
      >
        <div
          id="chat-head"
          className="flex items-center justify-between px-6 py-4 border-b border-gray-200"
        >
          <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
          <button
            type="button"
            className="rounded-xl border border-brand bg-white px-4 py-2 text-xs font-bold text-brand hover:bg-brand-soft transition-colors"
          >
            대화 저장
          </button>
        </div>
        <div id="chat-list" className="p-6 space-y-4 min-h-[360px]">
          {messages.map((msg, i) =>
            msg.type === "question" || msg.type === "end" ? (
              <div key={i} className="flex items-start gap-3">
                <img
                  src="/interviewer.svg"
                  alt="면접관"
                  className="w-10 h-10 shrink-0 rounded-full"
                />
                <div className="msg-q max-w-[85%] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs space-y-2">
                  {msg.category && ( //면접 종료 시 배지 숨김
                    <span className="inline-block rounded-md bg-brand px-2.5 py-0.5 text-xs font-bold text-white mr-1.5">
                      {msg.category}
                    </span>
                  )}
                  {evidences[CATEGORIES.indexOf(msg.category)]?.length > 0 && (
                    <span className="inline-block rounded-md bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand">
                      근거 [{CATEGORIES.indexOf(msg.category) + 1}-1]
                    </span>
                  )}
                  <div className="text-sm text-gray-900 leading-relaxed pt-1">
                    {msg.text}
                  </div>
                </div>
              </div>
            ) : (
              <div key={i} className="space-y-2">
                <div className="msg-a ml-auto w-fit max-w-[80%] rounded-2xl bg-brand px-5 py-3.5 text-sm text-white leading-relaxed shadow-2xs">
                  {msg.text}
                </div>
                {msg.mismatches?.length > 0 && (
                  <div
                    id="warn-box"
                    className="rounded-2xl border border-warn-border bg-warn-bg p-4 space-y-1 text-warn-text"
                  >
                    <div className="flex items-center gap-2">
                      <span>⚠️</span>
                      <h4 className="text-sm font-extrabold">
                      {[...new Set(msg.mismatches.map((item) => item.source))].join("·")}와 다른 부분이 있어요
                      </h4>
                    </div>
                    {msg.mismatches.map((item, j) => (
                      <p key={j} className="text-xs pl-6">
                        {item.source}{" "}
                        <span className="font-extrabold">{item.document}</span>{" "}
                        · 답변{" "}
                        <span className="font-extrabold">{item.answer}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}

          {/* AI 면접관 말풍선 */}
          {isGenerating && (
            <div className="flex items-start gap-3 animate-fadeIn">
              <img
                src="/interviewer.svg"
                alt="면접관"
                className="w-10 h-10 shrink-0 rounded-full animate-pulse"
              />
              <div className="msg-q max-w-[85%] rounded-2xl border border-brand/20 bg-brand-light/40 p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-md bg-brand px-2.5 py-0.5 text-xs font-bold text-white">
                    AI 면접관
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800 pt-0.5">
                  <svg
                    className="animate-spin h-4 w-4 text-brand"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    {" "}
                    {/* 로딩 스피너 */}
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span>질문 생성 중입니다...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div
          id="chat-input"
          className="border-t border-gray-200 p-4 flex items-end gap-3 bg-white"
        >
          <textarea
            placeholder={
              isGenerating
                ? "질문을 생성하고 있습니다. 잠시만 기다려 주세요..."
                : "답변을 입력하세요"
            }
            disabled={isGenerating}
            className="flex-1 min-h-[84px] rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 resize-none disabled:bg-gray-50 disabled:text-gray-400"
          ></textarea>
          <button
            type="button"
            disabled={isGenerating || messages.length === 0}
            className="btn-main shrink-0 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={submitAnswer}
          >
            {isGenerating ? "생성 중…" : "전송"}
          </button>
        </div>
      </div>
      {showClModal && (
        <ClModal
          onClose={() => setShowClModal(false)}
          onSelect={({ file, cl }) => {
            setClPdf(file ?? null);
            setMyCl(cl ?? null);
          }}
        />
      )}
      {showResumeModal && (
        <ResumeModal
          onClose={() => setShowResumeModal(false)}
          onSelect={({ file, text }) => {
            // 한쪽을 넣으면 다른 쪽은 비운다 (PDF ↔ 양식 바꿀 때 예전 값이 남지 않게)
            setResumePdf(file ?? null);
            setMyResume(text ?? "");
          }}
        />
      )}
    </div>
  );
}
export default Interview;
