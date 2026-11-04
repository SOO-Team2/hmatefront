import { useState } from "react";
import ClModal from "../components/modals/ClModal";
import ResumeModal from "../components/modals/ResumeModal";

const CATEGORIES = ["지원 동기", "경험 및 역량", "인성 및 협업", "입사 후 포부"]
const JOB_CATS = {
  "기획·전략": ["경영·비즈니스기획", "웹기획", "마케팅기획", "PL·PM·PO", "컨설턴트", "AI기획자", "AI사업전략"],
  "인사·HR": ["인사담당자", "HRD·HRM", "노무관리자", "잡매니저", "헤드헌터", "직업상담사"],
  "회계·세무": ["회계담당자", "경리", "세무담당자", "재무담당자", "감사", "IR·공시", "회계사", "세무사", "관세사"],
  "마케팅·광고·MD": ["AE(광고기획자)", "브랜드마케터", "퍼포먼스마케터", "CRM마케터", "온라인마케터", "콘텐츠마케터", "홍보", "설문·리서치", "MD", "카피라이터", "크리에이티브디렉터", "채널관리자", "그로스해커"],
  "AI·개발·데이터": ["백엔드개발자", "프론트엔드개발자", "웹개발자", "앱개발자", "시스템엔지니어", "네트워크엔지니어", "DBA", "데이터엔지니어", "데이터사이언티스트", "보안엔지니어", "소프트웨어개발자", "게임개발자", "하드웨어개발자", "AI/ML엔지니어", "클라우드엔지니어", "웹퍼블리셔", "IT컨설팅", "QA", "AI/ML연구원", "데이터분석가", "데이터라벨러", "프롬프트엔지니어", "AI보안전문가", "MLOps엔지니어", "AI서비스개발자"],
  "디자인": ["그래픽디자이너", "3D디자이너", "제품디자이너", "산업디자이너", "광고디자이너", "시각디자이너", "영상디자이너", "웹디자이너", "UI·UX디자이너", "패션디자이너", "편집디자이너", "실내디자이너", "공간디자이너", "캐릭터디자이너", "환경디자이너", "아트디렉터", "일러스트레이터"],
  "엔지니어링·설계": ["전기·전자엔지니어", "기계엔지니어", "설계엔지니어", "설비엔지니어", "반도체엔지니어", "화학엔지니어", "공정엔지니어", "하드웨어엔지니어", "통신엔지니어", "RF엔지니어", "필드엔지니어", "R&D·연구원", "AI로봇엔지니어"],
}

function Interview() {
  const [catMajor, setCatMajor] = useState("기획·전략") // 직무 대분류
  const [catMinor, setCatMinor] = useState("경영·비즈니스기획")   // 직무 소분류
  const [resumeFile, setResumeFile] = useState(null) // 이력서 PDF
  const [clFile, setClFile] = useState(null)         // 자기소개서 PDF
  const [title, setTitle] = useState("기획·전략 > 경영·비즈니스기획") //대화 제목
  const [messages, setMessages] = useState([])       // 질문·답변
  const [evidences, setEvidences] = useState([])     // 근거 문장
  const [filenames, setFilenames] = useState([])     // 해시 파일명

  const [showClModal, setShowClModal] = useState(false); // 자소서 모달 열림
  const [myCl, setMyCl] = useState(null); // 모달에서 고른 자소서
  const [myResume, setMyResume] = useState(""); // 마이페이지 양식 이력서를 합친 글
  const [showResumeModal, setShowResumeModal] = useState(false); // 이력서 모달 열림
  const pdfSelect = (e, docType) => {
    const file = e.target.files[0]; //<input type="file">
    if (!file) return;

    if (docType === "resume") setResumeFile(file);
    if (docType === "cl") setClFile(file);
  };

  const askQuestion = async () => {
    setTitle(`${catMajor} > ${catMinor}`) //제목 변경

    const formData = new FormData();
    formData.append("job", catMinor);
    if (resumeFile) formData.append("resume", resumeFile);
    else if (myResume) formData.append("resume_saved", myResume);
    if (clFile) formData.append("cl", clFile);
    else if (myCl) formData.append("cl_saved", myCl.text);
    const res = await fetch("http://127.0.0.1:8000/question", {
      method: "POST",
      body: formData, //FormData는 headers 쓰면 안 됨
    });
    const data = await res.json();
    setFilenames(data.filenames || []);
    setEvidences([data.evidences || []]);
    setMessages([
      { type: "question", category: CATEGORIES[0], text: data.question },
    ]);
  };

  const submitAnswer = async (e) => {
    const textarea = e.currentTarget.previousElementSibling;
    const text = textarea.value;
    if (!text.trim() || messages.at(-1)?.type !== "question") return;
    textarea.value = "";

    setMessages((prev) => [...prev, { type: "answer", text }]);

    const nextCategory = CATEGORIES[evidences.length];
    if (!nextCategory) return;

    const res = await fetch("http://127.0.0.1:8000/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: nextCategory,
        job: title.split(" > ")[1],
        filenames,
      }),
    })
    const data = await res.json()
    setEvidences((prev) => [...prev, data.evidences || []])
    setMessages((prev) => [
      ...prev,
      { type: "question", category: nextCategory, text: data.question },
    ]);
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
                  const selectedMajor = e.target.value
                  setCatMajor(selectedMajor)
                  setCatMinor(JOB_CATS[selectedMajor][0])
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

          <div className="field md:col-span-3">
            <label className="block text-xs font-bold text-gray-700 mb-2">
              이력서
            </label>
            <div className="row flex items-center gap-2">
              {resumeFile || myResume ? (
                // 넣은 이력서: 누르면 모달을 다시 열어 바꿀 수 있다
                <button
                  type="button"
                  onClick={() => setShowResumeModal(true)}
                  className="truncate rounded-xl border border-brand-border bg-brand-light px-3 py-2.5 text-xs font-semibold text-brand hover:bg-brand-soft transition-colors"
                >
                  {resumeFile ? resumeFile.name : "내 이력서"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => e.currentTarget.nextElementSibling.click()}
                  className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {/* 현재 누른 버튼의 다음 태그 클릭 */}
                  PDF 업로드
                </button>
              )}
              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={(e) => pdfSelect(e, "resume")}
              />
              {/* 이력서를 넣기 전에만 보임 */}
              {!resumeFile && !myResume && (
                <button
                  type="button"
                  onClick={() => setShowResumeModal(true)}
                  className="rounded-xl border border-brand bg-white px-3.5 py-2.5 text-xs font-bold text-brand hover:bg-brand-soft transition-colors"
                >
                  내 이력서 가져오기
                </button>
              )}
            </div>
          </div>

          <div className="field md:col-span-3">
            <label className="block text-xs font-bold text-gray-700 mb-2">
              자기소개서
            </label>
            <div className="row flex items-center gap-2">
              {clFile ? (
                  <button
    type="button"
    onClick={() => setShowClModal(true)}
               className="truncate rounded-xl border border-brand-border bg-brand-light px-3 py-2.5 text-xs font-semibold text-brand">
                  {clFile.name}
                   </button>
          
              ) : myCl ? (
                // 고른 자소서 제목: 누르면 모달을 다시 열어 바꿀 수 있다
                <button
                  type="button"
                  onClick={() => setShowClModal(true)}
                  className="truncate rounded-xl border border-brand-border bg-brand-light px-3 py-2.5 text-xs font-semibold text-brand hover:bg-brand-soft transition-colors"
                >
                  {myCl.title}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => e.currentTarget.nextElementSibling.click()}
                  className="rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  PDF 업로드
                </button>
              )}
              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={(e) => pdfSelect(e, "cl")}
              />
              {/* 자소서를 고르기 전에만 보인다 */}
              {!clFile && !myCl && (
                <button
                  type="button"
                  onClick={() => setShowClModal(true)}
                  className="rounded-xl border border-brand bg-white px-3.5 py-2.5 text-xs font-bold text-brand hover:bg-brand-soft transition-colors"
                >
                  내 자기소개서 가져오기
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-1 flex md:justify-end">
            <button
              type="button"
              className="btn-main w-full md:w-auto whitespace-nowrap rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-hover transition-colors"
              onClick={askQuestion}
            >
              질문 생성
            </button>
          </div>
        </div>

        <div className="field pt-1">
          <label className="block text-xs font-bold text-gray-700 mb-2.5">
            질문 항목
          </label>
          <div className="q-list grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              className={`q-item rounded-xl border p-4 ${
                messages[1]
                  ? "border-brand-border bg-white"
                  : "border-dashed border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-extrabold text-gray-900">
                ① 지원 동기
              </span>
              <p
                className={`text-xs mt-1 font-bold ${
                  messages[1] ? "text-brand" : "text-gray-400 font-medium"
                }`}
              >
                {messages[1] ? "완료" : "미입력"}
              </p>
            </div>
            <div
              className={`q-item rounded-xl border p-4 ${
                messages[3]
                  ? "border-brand-border bg-white"
                  : "border-dashed border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-extrabold text-gray-900">
                ② 경험 및 역량
              </span>
              <p
                className={`text-xs mt-1 font-bold ${
                  messages[3] ? "text-brand" : "text-gray-400 font-medium"
                }`}
              >
                {messages[3] ? "완료" : "미입력"}
              </p>
            </div>
            <div
              className={`q-item rounded-xl border p-4 ${
                messages[5]
                  ? "border-brand-border bg-white"
                  : "border-dashed border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-extrabold text-gray-900">
                ③ 인성 및 협업
              </span>
              <p
                className={`text-xs mt-1 font-bold ${
                  messages[5] ? "text-brand" : "text-gray-400 font-medium"
                }`}
              >
                {messages[5] ? "완료" : "미입력"}
              </p>
            </div>
            <div
              className={`q-item rounded-xl border p-4 ${
                messages[7]
                  ? "border-brand-border bg-white"
                  : "border-dashed border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-extrabold text-gray-900">
                ④ 입사 후 포부
              </span>
              <p
                className={`text-xs mt-1 font-bold ${
                  messages[7] ? "text-brand" : "text-gray-400 font-medium"
                }`}
              >
                {messages[7] ? "완료" : "미입력"}
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
          <h3 className="text-base font-extrabold text-gray-900">
            {title}
          </h3>
          <button
            type="button"
            className="rounded-xl border border-brand bg-white px-4 py-2 text-xs font-bold text-brand hover:bg-brand-soft transition-colors"
          >
            대화 저장
          </button>
        </div>
        <div id="chat-list" className="p-6 space-y-4 min-h-[360px]">
          {messages.map((msg, i) =>
            msg.type === "question" ? (
              <div
                key={i}
                className="msg-q max-w-[85%] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs space-y-2"
              >
                <span className="inline-block rounded-md bg-brand px-2.5 py-0.5 text-xs font-bold text-white mr-1.5">
                  {msg.category}
                </span>
                {evidences[CATEGORIES.indexOf(msg.category)]?.length > 0 && (
                  <span className="inline-block rounded-md bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand">
                    근거 [{CATEGORIES.indexOf(msg.category) + 1}-1]
                  </span>
                )}
                <div className="text-sm text-gray-900 leading-relaxed pt-1">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div
                key={i}
                className="msg-a ml-auto max-w-[80%] rounded-2xl bg-brand px-5 py-3.5 text-sm text-white leading-relaxed shadow-2xs"
              >
                {msg.text}
              </div>
            ),
          )}
        </div>
        <div
          id="chat-input"
          className="border-t border-gray-200 p-4 flex items-end gap-3 bg-white"
        >
          <textarea
            placeholder="답변을 입력하세요"
            className="flex-1 min-h-[84px] rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 resize-none"
          ></textarea>
          <button
            type="button"
            className="btn-main shrink-0 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-hover transition-colors"
            onClick={submitAnswer}
          >
            전송
          </button>
        </div>
      </div>
      {showClModal && (
        <ClModal
          onClose={() => setShowClModal(false)}
          onSelect={(cl) => {
            setMyCl(cl);
            setClFile(null);
          }}
        />
      )}
      {showResumeModal && (
        <ResumeModal
          onClose={() => setShowResumeModal(false)}
          onSelect={({ file, text }) => {
            // 한쪽을 넣으면 다른 쪽은 비운다 (PDF ↔ 양식 바꿀 때 예전 값이 남지 않게)
            setResumeFile(file ?? null);
            setMyResume(text ?? "");
          }}
        />
      )}
    </div>
  );
}
export default Interview;
