import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import ClModal from "../components/modals/ClModal";
import ResumeModal from "../components/modals/ResumeModal";
import { CATEGORIES, JOB_CATS } from "../constants/interviewData";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Interview() {
  const [jobCat, setJobCat] = useState({
    major: "기획·전략",
    minor: "경영·비즈니스기획",
  }); // 직무 대분류·소분류
  const [activeModal, setActiveModal] = useState(null); // 모달 열림 ("resume" | "cl" | null)
  const [resume, setResume] = useState(null); // 이력서 ({ file } 또는 { text })
  const [cl, setCl] = useState(null); // 자기소개서 ({ file } 또는 { text })
  const [title, setTitle] = useState("기획·전략 > 경영·비즈니스기획"); //대화 제목
  const [messages, setMessages] = useState([]); // 질문·답변
  const [evidences, setEvidences] = useState([]); // 근거 문장
  const [filenames, setFilenames] = useState([]); // 해시 파일명
  const [isGenerating, setIsGenerating] = useState(false); // 질문 생성 중 여부
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0); // 현재 진행 중인 카테고리 인덱스 (0: 지원 동기 ~ 3: 입사 후 포부)
  const [isSaved, setIsSaved] = useState(false); // 이번 면접을 저장했는지
  const token = localStorage.getItem("access_token"); // 로그인 토큰 (없으면 비회원)
  const navigate = useNavigate(); // 페이지 이동 함수
  const uploadTaskRef = useRef(null); // 서류 업로드 대기

  const handleAuthError = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChange"));
    window.alert(
      "로그인이 필요하거나 로그인 세션이 만료되었습니다. 홈 화면으로 이동합니다.",
    );
    navigate("/");
  };

  // 1. 서류 사전 업로드 (면접 시작 시 백그라운드 실행)
  const uploadDocs = () => {
    if (!resume?.file && !resume?.text && !cl?.file && !cl?.cl?.text) {
      uploadTaskRef.current = null;
      return;
    }

    const currentToken = localStorage.getItem("access_token");
    const formData = new FormData();
    if (resume?.file) formData.append("resume_pdf", resume.file);
    else if (resume?.text) formData.append("my_resume", resume.text);
    if (cl?.file) formData.append("cl_pdf", cl.file);
    else if (cl?.cl) formData.append("my_cl", cl.cl.text);

    const headers = {};
    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    }

    uploadTaskRef.current = fetch(`${API_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
    })
      .then((res) => {
        if (res.status === 401 && currentToken) {
          handleAuthError();
          return null;
        }
        if (!res.ok) throw new Error("업로드 실패");
        return res.json();
      })
      .then((data) => {
        if (data?.filenames) {
          setFilenames(data.filenames);
          return data.filenames;
        }
        return [];
      })
      .catch((err) => {
        console.error("업로드 중 오류:", err);
        return [];
      });
  };

  // 2. 면접 시작 (버튼 클릭 시: 화면 초기화 + 자기소개 안내 + 서류 업로드)
  const startInterview = () => {
    setTitle(`${jobCat.major} > ${jobCat.minor}`); // 제목 변경
    setMessages([]);
    setEvidences([]);
    setFilenames([]);
    setIsSaved(false);
    // 첫 번째 카테고리(지원 동기)부터 시작
    setCurrentCategoryIndex(0);

    // 서류 등록 시 청킹/임베딩 시작
    uploadDocs();

    // 질문 준비 중 표시 후 자기소개 질문
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setMessages([
        {
          type: "question",
          text: `안녕하세요, 지원자님. 면접에 앞서 간단한 자기소개 부탁드립니다.`,
        },
      ]);
    }, 2000);
  };

  // 질문과 그 뒤 답변을 한 쌍으로 묶어서 저장한다
  const saveInterview = async () => {
    const dialogues = [];
    messages.forEach((msg) => {
      if (msg.type === "question") {
        dialogues.push({ question: msg.text, answer: null });
      } else if (msg.type === "answer" && dialogues.length) {
        dialogues.at(-1).answer = msg.text; // 바로 앞 질문에 답변 붙이기
      }
    });
    if (!dialogues.length) {
      window.alert("저장할 대화가 없어요.");
      return;
    }

        const [major, minor] = title.split(" > "); // 면접 시작할 때의 직무
    const currentToken = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_URL}/interview/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ cat_major: major, cat_minor: minor, dialogues }),
      });
      if (res.status === 401) {
        handleAuthError();
        return;
      }
      if (!res.ok) {
        // 403(저장 동의 안 함) 같은 경우 서버 안내 문장을 그대로 보여 준다
        const data = await res.json().catch(() => ({}));
        window.alert(
          typeof data.detail === "string"
            ? data.detail
            : "저장하지 못했습니다. 다시 시도해 주세요.",
        );
        return;
      }
      setIsSaved(true);
      window.alert("대화를 저장했어요. 마이페이지에서 볼 수 있어요.");
    } catch {
      window.alert("저장하지 못했습니다. 다시 시도해 주세요.");
    }
  };


  // 답변과 서류를 비교해서, 결과를 그 답변 메시지에 붙인다
  const verifyAnswer = async (
    answerIndex,
    text,
    targetFilenames = filenames,
  ) => {
    const currentToken = localStorage.getItem("access_token");
    const headers = { "Content-Type": "application/json" };
    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    }

    try {
      const res = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ answer: text, filenames: targetFilenames }),
      });
      if (res.status === 401 && currentToken) {
        handleAuthError();
        return;
      }
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

  // 3. 질문 생성 (자기소개 답변 제출 시: 업로드된 filenames 기반)
  const askQuestion = async (text, answerIndex, textarea) => {
    setIsGenerating(true);
    const currentToken = localStorage.getItem("access_token");
    try {
      // 1) 서류 업로드 진행 중이었다면 완료될 때까지 대기
      let targetFilenames = filenames;
      if (uploadTaskRef.current) {
        const uploaded = await uploadTaskRef.current;
        if (uploaded && uploaded.length > 0) {
          targetFilenames = uploaded;
        }
      }

      const formData = new FormData();
      formData.append("job", title.split(" > ")[1] || jobCat.minor);

      // 2) 업로드 완료된 filenames 있다면 (추출/청킹/임베딩 스킵)
      if (targetFilenames && targetFilenames.length > 0) {
        formData.append("filenames_json", JSON.stringify(targetFilenames));
      } else {
        // 업로드가 없었거나 실패했을 경우
        if (resume?.file) formData.append("resume_pdf", resume.file);
        else if (resume?.text) formData.append("my_resume", resume.text);
        if (cl?.file) formData.append("cl_pdf", cl.file);
        else if (cl?.cl) formData.append("my_cl", cl.cl.text);
      }

      const headers = {};
      if (currentToken) {
        headers.Authorization = `Bearer ${currentToken}`;
      }

      const res = await fetch(`${API_URL}/question`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (res.status === 401 && currentToken) {
        handleAuthError();
        return;
      }
      if (!res.ok) {
        throw new Error("요청에 실패했습니다.");
      }

      const data = await res.json();
      if (!data.question) {
        throw new Error("생성된 질문이 없습니다.");
      }

      const newFilenames = data.filenames || targetFilenames || [];
      const firstEvidences = data.evidences || [];
      setFilenames(newFilenames);
      setEvidences([firstEvidences]);
      setMessages((prev) => [
        ...prev,
        {
          type: "question",
          category: CATEGORIES[0],
          text: data.question,
          isFollowup: false,
          evidenceIndex: firstEvidences.length > 0 ? 1 : null,
        },
      ]);
      verifyAnswer(answerIndex, text, newFilenames);
    } catch {
      setMessages((prev) => prev.slice(0, answerIndex));
      textarea.value = text;
      window.alert(
        "질문 생성 중 오류가 발생했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswer = async (e) => {
    if (isGenerating) return;
    const token = localStorage.getItem("access_token");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const textarea =
      e.currentTarget.tagName === "TEXTAREA"
        ? e.currentTarget
        : e.currentTarget.previousElementSibling;
    const text = textarea.value;
    if (!text.trim() || messages.at(-1)?.type !== "question") return;
    textarea.value = "";

    const lastQuestionMsg = messages.at(-1); // 직전에 AI 면접관이 한 질문
    const answerIndex = messages.length;
    setMessages((prev) => [...prev, { type: "answer", text }]);

    // 자기소개 답변 후 첫 질문 생성 (/question)
    if (messages.length === 1) {
      await askQuestion(text, answerIndex, textarea);
      return;
    }

    verifyAnswer(answerIndex, text, filenames);

    setIsGenerating(true);
    try {
      const currentCategory =
        lastQuestionMsg?.category || CATEGORIES[currentCategoryIndex];
      const job = title.split(" > ")[1] || jobCat.minor;

      // [심층질문 판단] 직전 질문이 메인 질문이고, 회원이거나 심층질문이 나온 적 없을 때(/followup API 호출)
      if (
        !lastQuestionMsg?.isFollowup &&
        (token || !messages.some((m) => m.isFollowup))
      ) {
        const followupRes = await fetch(`${API_URL}/followup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            category: currentCategory,
            job,
            question: lastQuestionMsg.text,
            answer: text,
            filenames,
            used_evidences: evidences[currentCategoryIndex] || [],
          }),
        });

        if (followupRes.status === 401 && token) {
          handleAuthError();
          return;
        }

        if (!followupRes.ok) {
          throw new Error("심층 질문 요청에 실패했습니다.");
        }

        const followupData = await followupRes.json();
        // 백엔드에서 심층질문 생성이 필요하다고 판단한 경우
        if (followupData.is_followup) {
          if (!followupData.question) {
            throw new Error("심층 질문이 비어 있습니다.");
          }

          const newEvidences = followupData.evidences || [];
          const currentEvCount = evidences[currentCategoryIndex]?.length || 0;
          if (newEvidences.length > 0) {
            setEvidences((prev) =>
              prev.map((arr, idx) =>
                idx === currentCategoryIndex ? [...arr, ...newEvidences] : arr,
              ),
            );
          }

          setMessages((prev) => [
            ...prev,
            {
              type: "question",
              category: currentCategory,
              text: followupData.question,
              isFollowup: true,
              evidenceIndex:
                newEvidences.length > 0
                  ? currentEvCount + newEvidences.length
                  : null,
            },
          ]);
          return; // 카테고리를 넘기지 않고 심층질문 답변 대기
        }
      }

      // [카테고리 완료] 심층질문이 불필요하거나, 이미 심층질문 답변을 마친 경우 다음 카테고리로 진행
      const nextCategoryIndex = currentCategoryIndex + 1;
      setCurrentCategoryIndex(nextCategoryIndex);
      const nextCategory =
        (token || nextCategoryIndex < 2) && CATEGORIES[nextCategoryIndex];

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
      // 이전 대화 기록 (질문-답변 쌍)
      const previousDialogues = [];
      let lastQ = null;
      for (const m of messages) {
        if (m.type === "question" && m.text) {
          lastQ = m.text;
        } else if (m.type === "answer" && m.text && lastQ) {
          previousDialogues.push({ question: lastQ, answer: m.text });
          lastQ = null;
        }
      }
      if (lastQ && text) {
        previousDialogues.push({ question: lastQ, answer: text });
      }

      const res = await fetch(`${API_URL}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          category: nextCategory,
          job,
          filenames,
          previous_dialogues: previousDialogues,
          used_evidences: evidences.flat(),
        }),
      });

      if (res.status === 401 && token) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        throw new Error("다음 질문 요청에 실패했습니다.");
      }

      const data = await res.json();
      if (!data.question) {
        throw new Error("생성된 질문이 없습니다.");
      }

      const nextEvidences = data.evidences || [];
      setEvidences((prev) => [...prev, nextEvidences]);
      setMessages((prev) => [
        ...prev,
        {
          type: "question",
          category: nextCategory,
          text: data.question,
          isFollowup: false, // 새 카테고리의 메인 질문
          evidenceIndex: nextEvidences.length > 0 ? 1 : null,
        },
      ]);
    } catch {
      setMessages((prev) => prev.slice(0, answerIndex));
      textarea.value = text;
      setCurrentCategoryIndex(currentCategoryIndex);
      window.alert(
        "질문 생성에 실패했습니다. 답변을 확인하고 다시 시도해 주세요.",
      );
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
                value={jobCat.major}
                onChange={(e) => {
                  const major = e.target.value;
                  setJobCat({ major, minor: JOB_CATS[major][0] });
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand focus:outline-none"
              >
                {Object.keys(JOB_CATS).map((major) => (
                  <option key={major}>{major}</option>
                ))}
              </select>
              <select
                value={jobCat.minor}
                onChange={(e) =>
                  setJobCat({ ...jobCat, minor: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-brand focus:outline-none"
              >
                {JOB_CATS[jobCat.major]?.map((minor) => (
                  <option key={minor}>{minor}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field md:col-span-3 md:translate-x-2">
            <div className="row flex items-center justify-center gap-1.5">
              {resume ? (
                <div className="w-[85%] flex items-center gap-1.5">
                  {/* 넣은 이력서: 누르면 모달을 다시 열어 바꿀 수 있다 */}
                  <button
                    type="button"
                    onClick={() => setActiveModal("resume")}
                    className="flex-1 min-w-0 truncate rounded-xl border border-brand-border bg-brand-light px-3.5 py-2.5 text-xs font-semibold text-brand hover:bg-brand-soft transition-colors text-center"
                  >
                    {resume.file ? resume.file.name : "내 이력서"}
                  </button>
                  <button
                    type="button"
                    aria-label="이력서 등록 해제"
                    onClick={() => setResume(null)}
                    className="shrink-0 w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveModal("resume")}
                  className="w-[80%] rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:border-brand hover:text-brand hover:bg-brand-soft/40 transition-colors"
                >
                  이력서 등록
                </button>
              )}
            </div>
          </div>

          <div className="field md:col-span-3 md:-translate-x-6">
            <div className="row flex items-center justify-center gap-1.5">
              {cl ? (
                <div className="w-[85%] flex items-center gap-1.5">
                  {/* 넣은 자소서: 누르면 모달을 다시 열어 바꿀 수 있다 */}
                  <button
                    type="button"
                    onClick={() => setActiveModal("cl")}
                    className="flex-1 min-w-0 truncate rounded-xl border border-brand-border bg-brand-light px-3.5 py-2.5 text-xs font-semibold text-brand hover:bg-brand-soft transition-colors text-center"
                  >
                    {cl.file ? cl.file.name : cl.cl.title}
                  </button>
                  <button
                    type="button"
                    aria-label="자기소개서 등록 해제"
                    onClick={() => setCl(null)}
                    className="shrink-0 w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveModal("cl")}
                  className="w-[80%] rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:border-brand hover:text-brand hover:bg-brand-soft/40 transition-colors"
                >
                  자기소개서 등록
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-1 flex md:justify-end md:-translate-x-5">
            <button
              type="button"
              disabled={isGenerating}
              className="btn-main w-full whitespace-nowrap rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={startInterview}
            >
              {" "}
              면접 시작
            </button>
          </div>
        </div>

        <div className="field pt-1">
          <label className="block text-xs font-bold text-gray-700 mb-2.5">
            질문 항목
          </label>
          {/* 심층질문 유무와 무관하게 각 카테고리가 완료(답변 제출)되었는지를 idx < currentCategoryIndex로 판별 */}
          <div className="q-list grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map((cat, idx) => (
              <div
                key={cat}
                className={`q-item rounded-xl border p-4 ${
                  messages.some((m) => m.category === cat)
                    ? "border-brand-border bg-white"
                    : "border-dashed border-gray-300 bg-white"
                }`}
              >
                <span className="block text-sm font-extrabold text-gray-900">
                  {"①②③④"[idx]} {cat}
                </span>
                <p
                  className={`text-xs mt-1 font-bold ${
                    idx < currentCategoryIndex
                      ? "text-brand"
                      : "text-gray-400 font-medium"
                  }`}
                >
                  {idx < currentCategoryIndex ? "답변 완료" : "답변 대기"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        id="iv-ev"
        className="lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xs space-y-6"
      >
        <h3 className="text-lg font-extrabold text-gray-900">참고 문장</h3>
        {evidences.length === 0 && (
          <p className="text-xs text-gray-400 py-6 text-center">
            등록한 서류의 참고 문장이 표시됩니다.
          </p>
        )}
        {CATEGORIES.map(
          (cat, idx) =>
            evidences[idx]?.length > 0 && (
              <div key={cat} className="ev-group space-y-2.5">
                <p className="text-xs font-bold text-gray-500">
                  {"①②③④"[idx]} {cat}
                </p>
                <div className="q-list space-y-2.5">
                  {evidences[idx].map((ev, i) => (
                    <div
                      key={i}
                      className={`ev-item rounded-xl text-xs leading-relaxed ${
                        evidences.length === idx + 1 &&
                        i === evidences[idx].length - 1 &&
                        messages.at(-1)?.type !== "end"
                          ? "border border-brand-border bg-brand-soft p-3 text-gray-800"
                          : "px-1 py-0.5 text-gray-500"
                      }`}
                    >
                      <span
                        className={`font-extrabold mr-1.5 ${
                          evidences.length === idx + 1 &&
                          i === evidences[idx].length - 1 &&
                          messages.at(-1)?.type !== "end"
                            ? "text-brand"
                            : "text-gray-500"
                        }`}
                      >
                        [{idx + 1}-{i + 1}]
                      </span>{" "}
                      {ev}
                    </div>
                  ))}
                </div>
              </div>
            ),
        )}
      </div>

      <div
        id="iv-chat"
        className="lg:col-span-8 rounded-2xl border border-gray-200 bg-white shadow-2xs flex flex-col overflow-hidden"
      >
        <div
          id="chat-head"
          className="flex items-center justify-between px-6 py-4 min-h-[67px] border-b border-gray-200"
        >
          <h3 className="text-base font-extrabold text-gray-900">{title}</h3>
          {token && (
            <button
              type="button"
              onClick={saveInterview}
              disabled={isSaved || isGenerating || !messages.length}
              className="rounded-xl border border-brand bg-white px-4 py-2 text-xs font-bold text-brand hover:bg-brand-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaved ? "저장됨" : "대화 저장"}
            </button>
          )}
        </div>
        <div id="chat-list" className="p-6 space-y-4 min-h-[360px]">
          {messages.map((msg, i) =>
            msg.type === "end" && !token ? (
              <p key={i} className="text-sm text-gray-400 py-6 text-center">
                로그인 후 전체 면접을 이용할 수 있습니다.
              </p>
            ) : msg.type === "question" || msg.type === "end" ? (
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
                  {msg.evidenceIndex && (
                    <span className="inline-block rounded-md bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand">
                      참고 [{CATEGORIES.indexOf(msg.category) + 1}-
                      {msg.evidenceIndex}]
                    </span>
                  )}
                  <div
                    className={`text-sm text-gray-900 leading-relaxed ${
                      msg.category ? "pt-1" : ""
                    }`}
                  >
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
                        {[
                          ...new Set(msg.mismatches.map((item) => item.source)),
                        ].join("·")}
                        와 다른 부분이 있어요
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
              <div className="msg-q max-w-[85%] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center text-sm font-bold text-gray-800 pt-0.5">
                  <span>질문 준비 중</span>
                  <span className="dot-1">.</span>
                  <span className="dot-2">.</span>
                  <span className="dot-3">.</span>
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
            placeholder="답변을 입력해 주세요."
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                submitAnswer(e);
              }
            }}
            className="flex-1 min-h-[84px] rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 resize-none disabled:bg-gray-50 disabled:text-gray-400"
          ></textarea>
          <button
            type="button"
            disabled={
              isGenerating ||
              messages.length === 0 ||
              messages.at(-1)?.type === "end"
            }
            className="btn-main shrink-0 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={submitAnswer}
          >
            {" "}
            전송
          </button>
        </div>
      </div>
      {activeModal === "cl" && (
        <ClModal
          selectedPdf={cl?.file}
          selectedCl={cl?.cl}
          onClose={() => setActiveModal(null)}
          onSelect={setCl}
        />
      )}
      {activeModal === "resume" && (
        <ResumeModal
          selectedPdf={resume?.file}
          selectedResume={Boolean(resume?.text)}
          onClose={() => setActiveModal(null)}
          onSelect={setResume}
        />
      )}
    </div>
  );
}
export default Interview;
