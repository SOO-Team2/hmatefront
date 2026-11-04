import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

const API_URL = "http://127.0.0.1:8000";

const SECTIONS = [
  ["motivation", "지원 동기"],
  ["growth", "성장 과정"],
  ["personality", "성격의 장단점"],
  ["plan", "입사 후 포부"],
];
// [칸 이름, 제목, 최대 글자 수, 필수인지]
const RESUME_FIELDS = [
  ["name", "이름", 50, true],
  ["school", "학교", 100, true],
  ["major", "전공", 100, true],
  ["skill", "보유 기술 (예: Python, SQL 등)", 255, false],
];
const CERT_FIELDS = [
  ["cert", "자격증명 *", 100],
  ["org", "발급 기관", 100],
];
const CAREER_FIELDS = [
  ["company", "회사", 100],
  ["role", "역할", 500],
  ["start_year", "시작 (예: 2024.03)", 7],
  ["end_year", "끝 (예: 2025.02)", 7],
];

const formatDate = (iso) => {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const day = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getFullYear()}.${mm}.${dd} (${day})`;
};

function Mypage() {
  // 저장된 토큰과 회원 정보. LoginModal 참조
  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 서버에서 받은 내 자소서 목록
  const [cls, setCls] = useState([]);
  // 내 이력서(mypage.py의 ResumeIn)
  const [resume, setResume] = useState({
    name: "",
    school: "",
    major: "",
    skill: "",
    careers: [],
    certificates: [],
    resume_filename: "",
  });
  // 내 면접 목록
  const [interviews, setInterviews] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [dialogues, setDialogues] = useState([]);

  // 마이페이지에 들어오면 한 번 내 자소서를 불러온다
  useEffect(() => {
    // 불러오기는 토큰만 있으면 돼서 여기서 따로 만든다
    const auth = { headers: { Authorization: `Bearer ${token}` } };
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/mypage/cl`, auth);
        if (res.ok) setCls(await res.json());
        // 이력서도 같이 불러온다
        const resResume = await fetch(`${API_URL}/mypage/resume`, auth);
        if (resResume.ok) {
          const data = await resResume.json();
          if (data) setResume(data);
        }
        // 면접 목록도 같이 불러온다
        const resInterview = await fetch(`${API_URL}/mypage/interview`, auth);
        if (resInterview.ok) setInterviews(await resInterview.json());
      } catch {
        // 서버가 꺼져 있으면 빈 목록 그대로
      }
    };
    if (token) load();
  }, [token]);

  // 삭제 버튼: 서버에서 지우고, 성공하면 화면 목록에서도 뺀다
  const deleteCl = async (clId) => {
    if (!confirm("삭제하면 되돌릴 수 없어요. 삭제할까요?")) return;
    try {
      const res = await fetch(`${API_URL}/mypage/cl/${clId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) setCls(cls.filter((cl) => cl.cl_id !== clId));
      else alert("삭제하지 못했습니다.");
    } catch {
      alert("서버에 연결할 수 없습니다.");
    }
  };
  // 수정 중인 자소서 번호 (null = 수정 중 아님)와 입력칸 값
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // 수정 버튼: 그 카드의 지금 내용을 입력칸에 채운다 (빈 칸은 null 대신 빈 글자로)
  const startEdit = (cl) => {
    setEditingId(cl.cl_id);
    setEditForm({
      title: cl.title,
      motivation: cl.motivation ?? "",
      growth: cl.growth ?? "",
      personality: cl.personality ?? "",
      plan: cl.plan ?? "",
    });
  };

  // 수정 저장: 서버에 보내고, 성공하면 목록에서 그 카드만 바꾼다
  const saveEdit = async () => {
    try {
      const res = await fetch(`${API_URL}/mypage/cl/${editingId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setCls(cls.map((cl) => (cl.cl_id === editingId ? updated : cl)));
        setEditingId(null);
      } else {
        alert("저장하지 못했습니다. 제목은 1~200자로 입력해 주세요.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    }
  };

  // 대화 보기 버튼: 닫혀 있으면 서버에서 대화를 받아 펼치고, 열려 있으면 닫는다
  const toggleDialogues = async (interviewId) => {
    if (openId === interviewId) {
      setOpenId(null);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/mypage/interview/${interviewId}`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setDialogues(data.dialogues);
        setOpenId(interviewId);
      } else {
        alert("대화를 불러오지 못했습니다.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    }
  };

  // 면접 삭제 버튼: 서버에서 지우고, 성공하면 화면 목록에서도 뺀다
  const deleteInterview = async (interviewId) => {
    if (!confirm("삭제하면 되돌릴 수 없어요. 삭제할까요?")) return;
    try {
      const res = await fetch(`${API_URL}/mypage/interview/${interviewId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok)
        setInterviews(
          interviews.filter((iv) => iv.interview_id !== interviewId),
        );
      else alert("삭제하지 못했습니다.");
    } catch {
      alert("서버에 연결할 수 없습니다.");
    }
  };

  // 문서 저장 동의 여부 (로그인할 때 저장된 user 정보로 시작)
  const [saveAgreed, setSaveAgreed] = useState(user?.save_agreed ?? false);
  const navigate = useNavigate();

  // 동의 변경 버튼: 지금과 반대로 바꾸고, 저장된 user 정보도 같이 고친다
  const toggleAgreement = async () => {
    try {
      const res = await fetch(`${API_URL}/mypage/agreement`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ save_agreed: !saveAgreed }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaveAgreed(data.save_agreed);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, save_agreed: data.save_agreed }),
        );
      } else {
        alert("변경하지 못했습니다.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    }
  };

  // 회원 탈퇴 버튼: 서버에서 지우고, 로그아웃한 뒤 홈으로
  const withdraw = async () => {
    if (
      !confirm(
        "탈퇴하면 자소서·이력서·면접 기록이 모두 삭제되고 되돌릴 수 없어요. 탈퇴할까요?",
      )
    )
      return;
    try {
      const res = await fetch(`${API_URL}/mypage/me`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("authChange"));
        navigate("/");
      } else {
        alert("탈퇴하지 못했습니다.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    }
  };

  // 현재 선택된 사이드바 탭(시작탭 : 이력서)
  const [activeTab, setActiveTab] = useState("resume");

  // 이력서 칸 하나 바꾸기 (이름, 학교, 전공, 기술)
  const changeResume = (key, value) => setResume({ ...resume, [key]: value });

  // 경력·자격증 목록에서 i번째 줄의 칸 하나 바꾸기
  const changeItem = (listKey, i, key, value) => {
    //예: resume.careers
    const list = resume[listKey].map(
      (
        item,
        j, //목록을 한 줄씩 돌면서 새 목록을 만들어요. j는 지금 보고 있는 줄의 번호
      ) => (j === i ? { ...item, [key]: value } : item), //: 바꿀 줄(i번째)이면 고친 줄을 넣고, 아니면 원래 줄을 그대로
    );
    setResume({ ...resume, [listKey]: list });
  };

  // + 추가: 빈 줄 하나 덧붙이기 / 삭제: i번째 줄 빼기
  const addItem = (listKey, empty) =>
    setResume({ ...resume, [listKey]: [...resume[listKey], empty] });
  const removeItem = (listKey, i) =>
    setResume({
      ...resume,
      [listKey]: resume[listKey].filter((_, j) => j !== i),
    });

  // 이력서 저장 결과 문구
  const [resumeMessage, setResumeMessage] = useState("");

  // 저장 버튼: 이력서 전체를 서버에 보낸다
  const saveResume = async () => {
    setResumeMessage("");
    try {
      const res = await fetch(`${API_URL}/mypage/resume`, {
        method: "PUT",
        headers,
        body: JSON.stringify(resume),
      });
      if (res.ok) {
        setResume(await res.json());
        setResumeMessage("저장했어요.");
      } else if (res.status === 422) {
        setResumeMessage(
          "이름·학교·전공은 꼭 입력하고, 자격증명은 비우지 말아 주세요.",
        );
      } else {
        setResumeMessage("저장하지 못했습니다.");
      }
    } catch {
      setResumeMessage("서버에 연결할 수 없습니다.");
    }
  };
  // 이력서 작성 방식 ("pdf" = PDF 첨부, "form" = 기본 양식)
  const [resumeMode, setResumeMode] = useState("form");
  // 새로 고른 이력서 PDF (저장 전)
  const [pdfFile, setPdfFile] = useState(null);

  // PDF 저장: 고른 파일을 서버에 보낸다 (파일이라 Content-Type은 브라우저가 정함)
  const savePdf = async () => {
    if (!pdfFile) {
      setResumeMessage("PDF 파일을 골라 주세요.");
      return;
    }
    setResumeMessage("");
    const form = new FormData();
    form.append("file", pdfFile);
    try {
      const res = await fetch(`${API_URL}/mypage/resume/pdf`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (res.ok) {
        setResume({ ...resume, ...(await res.json()) });
        setPdfFile(null);
        setResumeMessage("저장했어요.");
      } else {
        setResumeMessage("저장하지 못했습니다.");
      }
    } catch {
      setResumeMessage("서버에 연결할 수 없습니다.");
    }
  };

  // PDF 삭제: 서버에서 지우고, 성공하면 화면에서도 뺀다
  const deletePdf = async () => {
    if (!confirm("삭제하면 되돌릴 수 없어요. 삭제할까요?")) return;
    try {
      const res = await fetch(`${API_URL}/mypage/resume/pdf`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) setResume({ ...resume, resume_filename: "" });
      else alert("삭제하지 못했습니다.");
    } catch {
      alert("서버에 연결할 수 없습니다.");
    }
  };

  // 로그인 안 했으면 마이페이지 대신 안내만

  if (!token) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-2xs">
          <p className="text-base font-bold text-gray-700">
            로그인 후 이용할 수 있어요.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* 1. 좌측 사이드바 (프로필 및 탭 메뉴) */}
      <aside className="md:col-span-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
        <div className="pb-4 mb-3 border-b border-gray-100 px-2">
          <h2 className="text-lg font-extrabold text-gray-900">{user?.id}님</h2>
        </div>

        <nav className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("resume")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
              activeTab === "resume"
                ? "bg-brand-light text-brand font-bold"
                : "text-gray-700 hover:bg-gray-100 font-medium"
            }`}
          >
            이력서
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cl")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
              activeTab === "cl"
                ? "bg-brand-light text-brand font-bold"
                : "text-gray-700 hover:bg-gray-100 font-medium"
            }`}
          >
            자기소개서
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
              activeTab === "history"
                ? "bg-brand-light text-brand font-bold"
                : "text-gray-700 hover:bg-gray-100 font-medium"
            }`}
          >
            면접 기록
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
              activeTab === "profile"
                ? "bg-brand-light text-brand font-bold"
                : "text-gray-700 hover:bg-gray-100 font-medium"
            }`}
          >
            회원정보 수정
          </button>
        </nav>
      </aside>

      {/* 2. 우측 콘텐츠 영역 */}
      <main className="md:col-span-9 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-2xs">
        {/* 자기소개서 탭*/}
        {activeTab === "cl" && (
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                자기소개서
              </h2>
              <Link to="/cl">
                <button
                  type="button"
                  className="text-sm font-bold text-brand hover:underline"
                >
                  새 자기소개서 작성 →
                </button>
              </Link>
            </div>
            {cls.length === 0 && (
              <p className="text-sm text-gray-500 py-10 text-center">
                저장한 자기소개서가 없어요.
              </p>
            )}

            {cls.map((cl) =>
              editingId === cl.cl_id ? (
                /* 수정 중인 카드: 입력칸 */
                <div
                  key={cl.cl_id}
                  className="rounded-2xl border border-brand-border bg-white p-6 space-y-4"
                >
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-bold text-gray-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                  />
                  {SECTIONS.map(([key, label]) => (
                    <div key={key} className="space-y-1.5">
                      <h4 className="text-xs font-extrabold text-gray-800">
                        {label}
                      </h4>
                      <textarea
                        value={editForm[key]}
                        onChange={(e) =>
                          setEditForm({ ...editForm, [key]: e.target.value })
                        }
                        className="w-full min-h-[110px] rounded-xl border border-gray-200 p-3.5 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 resize-y"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-hover transition-colors"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                /* 보통 카드: 보기 */
                <div
                  key={cl.cl_id}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-base font-extrabold text-gray-900 mr-auto">
                      {cl.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => startEdit(cl)}
                      className="rounded-lg border border-brand bg-white px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand-soft transition-colors"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCl(cl.cl_id)}
                      className="rounded-lg border border-danger-border bg-white px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger-bg transition-colors"
                    >
                      삭제
                    </button>
                  </div>

                  {/* 4칸 중 내용이 있는 칸만 보여준다 */}
                  <div className="p-6 space-y-4">
                    {SECTIONS.map(
                      ([key, label]) =>
                        cl[key] && (
                          <div key={key} className="space-y-1">
                            <h4 className="text-xs font-extrabold text-gray-900">
                              {label}
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {cl[key]}
                            </p>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              ),
            )}
          </section>
        )}

        {/* 이력서 탭*/}
        {activeTab === "resume" && (
          <section className="space-y-5">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              이력서
            </h2>
            {/* 작성 방식 고르기 */}
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              {[
                ["pdf", "PDF 첨부"],
                ["form", "기본 양식으로 작성"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setResumeMode(key)}
                  className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                    resumeMode === key
                      ? "bg-white text-brand font-bold shadow-2xs"
                      : "text-gray-600 hover:text-gray-900 font-medium"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* PDF 첨부: 상자를 누르면 파일 고르기 창이 열린다 */}
            {resumeMode === "pdf" && (
              <>
                <label className="flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-5 cursor-pointer">
                  <span className="text-sm text-gray-700">
                    {pdfFile ? pdfFile.name : "이력서 PDF 파일을 첨부하세요"}
                  </span>
                  <span className="rounded-xl border border-brand bg-white px-4 py-2 text-sm font-bold text-brand hover:bg-brand-soft transition-colors">
                    PDF 첨부하기
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files[0] ?? null)}
                  />
                </label>

                {/* 저장된 PDF가 있으면 이름·날짜와 삭제 버튼 */}
                {resume.resume_filename && (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3">
                    <p className="text-sm text-gray-700">
                      {resume.resume_filename} 저장됨
                    </p>
                    <button
                      type="button"
                      onClick={deletePdf}
                      className="rounded-lg border border-danger-border bg-white px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger-bg transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </>
            )}

            {/* 기본 양식: 아래 입력칸들 */}
            {resumeMode === "form" && (
              <>
                {/* 이름, 학교, 전공, 보유 기술 */}
                {RESUME_FIELDS.map(([key, label, max, required]) => (
                  <div key={key}>
                    <p className="text-xs font-bold text-gray-800 mb-1.5">
                      {label}
                      {required && <span className="text-danger"> *</span>}
                    </p>
                    <input
                      type="text"
                      maxLength={max}
                      value={resume[key] ?? ""}
                      onChange={(e) => changeResume(key, e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                    />
                  </div>
                ))}

                {/* 자격증 (여러 개) */}
                <div className="rounded-2xl border border-gray-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-gray-900">
                      자격증
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        addItem("certificates", { cert: "", org: "" })
                      }
                      className="rounded-lg border border-brand bg-white px-3 py-1 text-xs font-bold text-brand hover:bg-brand-soft transition-colors"
                    >
                      + 추가
                    </button>
                  </div>
                  {resume.certificates.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
                    >
                      {CERT_FIELDS.map(([key, label, max]) => (
                        <input
                          key={key}
                          type="text"
                          placeholder={label}
                          maxLength={max}
                          value={item[key] ?? ""}
                          onChange={(e) =>
                            changeItem("certificates", i, key, e.target.value)
                          }
                          className="sm:col-span-2 rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none"
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => removeItem("certificates", i)}
                        className="rounded-xl border border-danger-border bg-white px-3 py-2.5 text-xs font-semibold text-danger hover:bg-danger-bg transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>

                {/* 경력 (여러 개) */}
                <div className="rounded-2xl border border-gray-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-gray-900">경력</p>
                    <button
                      type="button"
                      onClick={() =>
                        addItem("careers", {
                          company: "",
                          role: "",
                          start_year: "",
                          end_year: "",
                        })
                      }
                      className="rounded-lg border border-brand bg-white px-3 py-1 text-xs font-bold text-brand hover:bg-brand-soft transition-colors"
                    >
                      + 추가
                    </button>
                  </div>
                  {resume.careers.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-9 gap-2 items-center"
                    >
                      {CAREER_FIELDS.map(([key, label, max]) => (
                        <input
                          key={key}
                          type="text"
                          placeholder={label}
                          maxLength={max}
                          value={item[key] ?? ""}
                          onChange={(e) =>
                            changeItem("careers", i, key, e.target.value)
                          }
                          className="sm:col-span-2 rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none"
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => removeItem("careers", i)}
                        className="rounded-xl border border-danger-border bg-white px-3 py-2.5 text-xs font-semibold text-danger hover:bg-danger-bg transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 맨 아래: 저장 */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              {resumeMessage && (
                <p className="text-xs font-medium text-brand">
                  {resumeMessage}
                </p>
              )}
              <button
                type="button"
                onClick={resumeMode === "pdf" ? savePdf : saveResume}
                className="rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-hover transition-colors"
              >
                저장
              </button>
            </div>
          </section>
        )}

        {/* 면접 기록 탭 */}
        {activeTab === "history" && (
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                면접 기록
              </h2>
            </div>

            {interviews.length === 0 && (
              <p className="text-sm text-gray-500 py-10 text-center">
                면접 기록이 없어요.
              </p>
            )}

            {/* 서버에서 받은 면접마다 카드 하나씩 */}
            {interviews.map((iv) => (
              <div
                key={iv.interview_id}
                className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-gray-900">
                      {formatDate(iv.created_at)}
                    </span>
                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      {iv.cat_major} &gt; {iv.cat_minor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDialogues(iv.interview_id)}
                      className="rounded-lg border border-brand bg-white px-3.5 py-1.5 text-xs font-bold text-brand hover:bg-brand-soft transition-colors"
                    >
                      {openId === iv.interview_id ? "대화 닫기" : "대화 보기"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteInterview(iv.interview_id)}
                      className="rounded-lg border border-danger-border bg-white px-3.5 py-1.5 text-xs font-semibold text-danger hover:bg-danger-bg transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* 펼친 카드만 질문·답변을 보여준다 */}
                {openId === iv.interview_id &&
                  dialogues.map((d, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-gray-50 p-4 space-y-1.5 text-sm border border-gray-100"
                    >
                      <p className="font-bold text-gray-900">Q. {d.question}</p>
                      <p className="text-gray-700">
                        A. {d.answer ?? "(답변 없음)"}
                      </p>
                    </div>
                  ))}
              </div>
            ))}
          </section>
        )}

        {/* 회원정보 수정 탭 */}
        {activeTab === "profile" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              회원정보 수정
            </h2>

            <div className="rounded-2xl bg-gray-100/80 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  문서 저장 동의
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {saveAgreed ? "동의함" : "동의 안 함"}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleAgreement}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                동의 변경
              </button>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li>
                내 문서는 본인만 조회할 수 있어요. 다른 회원은 접근할 수 없어요.
              </li>
              <li>문서를 삭제하면 DB에서 바로 삭제되며 되돌릴 수 없어요.</li>
              <li>
                회원 탈퇴 시 자소서 · 이력서 · 문장 · 대화 기록이 모두 삭제돼요.
              </li>
            </ul>

            <button
              type="button"
              onClick={withdraw}
              className="rounded-xl border border-danger bg-white px-5 py-2.5 text-sm font-bold text-danger hover:bg-danger-bg transition-colors"
            >
              회원 탈퇴
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default Mypage;