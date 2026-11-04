import { useState } from "react";
import ClModal from "../components/modals/ClModal";
import ResumeModal from "../components/modals/ResumeModal";

const CATEGORIES = [
  "지원 동기",
  "경험 및 역량",
  "인성 및 협업",
  "입사 후 포부",
];

function Interview() {
  const [catMajor, setCatMajor] = useState(""); // 직무 대분류
  const [catMinor, setCatMinor] = useState(""); // 직무 소분류
  const [resumeFile, setResumeFile] = useState(null); // 이력서 PDF
  const [clFile, setClFile] = useState(null); // 자기소개서 PDF
  const [messages, setMessages] = useState([]); // 질문·답변
  const [evidences, setEvidences] = useState([]); // 근거 문장

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
    const selects = document.querySelectorAll("select");
    setCatMajor(selects[0].value);
    setCatMinor(selects[1].value);

    const formData = new FormData();
    formData.append("job", selects[1].value);
    if (resumeFile) formData.append("resume", resumeFile);
    else if (myResume) formData.append("resume_saved", myResume);
    if (clFile) formData.append("cl", clFile);
    else if (myCl) {
      // 4칸을 "제목 + 내용"으로 이어 붙여 글 하나로 보낸다 (빈 칸은 뺌)
      const text = [
        ["지원 동기", myCl.motivation],
        ["성장 과정", myCl.growth],
        ["성격의 장단점", myCl.personality],
        ["입사 후 포부", myCl.plan],
      ]
        .filter(([, body]) => body)
        .map(([label, body]) => `[${label}]\n${body}`)
        .join("\n\n");
      formData.append("cl_saved", text);
    }
    const res = await fetch("http://127.0.0.1:8000/question", {
      method: "POST",
      body: formData, //FormData는 headers 쓰면 안 됨
    });
    const data = await res.json();
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
      body: JSON.stringify({ category: nextCategory, job: catMinor }),
    });
    const data = await res.json();
    setEvidences((prev) => [...prev, data.evidences || []]);
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
              <select className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand focus:outline-none">
                <option>AI·개발·데이터</option>
              </select>
              <select className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand focus:outline-none">
                <option>백엔드개발자</option>
                <option>프론트엔드개발자</option>
                <option>웹개발자</option>
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
              {/* 이력서를 넣기 전에만 보인다 */}
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
                <span className="truncate rounded-xl border border-brand-border bg-brand-light px-3 py-2.5 text-xs font-semibold text-brand">
                  {clFile.name}
                </span>
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
              {!myCl && (
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
            {catMajor || "AI·개발·데이터"} &gt; {catMinor || "백엔드개발자"}
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
          <div
            id="warn-box"
            className="rounded-2xl border border-warn-border bg-warn-bg p-4 space-y-1 text-warn-text"
          >
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <h4 className="text-sm font-extrabold">
                서류와 다른 부분이 있어요
              </h4>
            </div>
            <p className="text-xs pl-6">
              자기소개서 <span className="font-extrabold">팀원 4명</span> · 답변{" "}
              <span className="font-extrabold">팀원 6명</span>
            </p>
          </div>
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
        <ClModal onClose={() => setShowClModal(false)} onSelect={setMyCl} />
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
