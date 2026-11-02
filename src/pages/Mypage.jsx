import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

const API_URL = "http://127.0.0.1:8000";

const SECTIONS = [
  ["motivation", "지원 동기"],
  ["growth", "성장 과정"],
  ["personality", "성격의 장단점"],
  ["plan", "입사 후 포부"],
];

const RESUME_FIELDS = [
  ["name", "이름", 50],
  ["school", "학교", 100],
  ["major", "전공", 100],
  ["skill", "보유 기술 (예: Python, SQL, Django)", 255],
];
const CERT_FIELDS = [
  ["cert", "자격증명", 100],
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

  // 현재 선택된 사이드바 탭(시작탭 : Cl)
  const [activeTab, setActiveTab] = useState("cl");

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

  // 로그인 안 했으면 마이페이지 대신 안내만
  if (!token) {
    return (
      <main>
        <p>로그인 후 이용할 수 있어요.</p>
      </main>
    );
  }

  return (
    <div>
      {/* 1. 좌측 사이드바 (프로필 및 탭 메뉴) */}
      <aside>
        <div>
          <h2>{user?.id}님</h2>
        </div>

        <nav>
          <button type="button" onClick={() => setActiveTab("resume")}>
            이력서
          </button>
          <button type="button" onClick={() => setActiveTab("cl")}>
            자기소개서
          </button>
          <button type="button" onClick={() => setActiveTab("history")}>
            면접 기록
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
                <button type="button">새 자기소개서 작성 →</button>
              </Link>
            </div>
            {cls.length === 0 && <p>저장한 자기소개서가 없어요.</p>}

            {cls.map((cl) =>
              editingId === cl.cl_id ? (
                /* 수정 중인 카드: 입력칸 */
                <div key={cl.cl_id}>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                  />
                  {SECTIONS.map(([key, label]) => (
                    <div key={key}>
                      <h4>{label}</h4>
                      <textarea
                        value={editForm[key]}
                        onChange={(e) =>
                          setEditForm({ ...editForm, [key]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                  <button type="button" onClick={saveEdit}>
                    저장
                  </button>
                  <button type="button" onClick={() => setEditingId(null)}>
                    취소
                  </button>
                </div>
              ) : (
                /* 보통 카드: 보기 */
                <div key={cl.cl_id}>
                  <div>
                    <h3>{cl.title}</h3>
                    <button type="button" onClick={() => startEdit(cl)}>
                      수정
                    </button>
                    <button type="button" onClick={() => deleteCl(cl.cl_id)}>
                      삭제
                    </button>
                  </div>

                  {/* 4칸 중 내용이 있는 칸만 보여준다 */}
                  {SECTIONS.map(
                    ([key, label]) =>
                      cl[key] && (
                        <div key={key}>
                          <h4>{label}</h4>
                          <p>{cl[key]}</p>
                        </div>
                      ),
                  )}
                </div>
              ),
            )}
          </section>
        )}

        {/* 이력서 탭*/}
        {activeTab === "resume" && (
          <section>
            <h2>이력서</h2>

            {/* 이름, 학교, 전공, 보유 기술 */}
            {RESUME_FIELDS.map(([key, label, max]) => (
              <div key={key}>
                <p>{label}</p>
                <input
                  type="text"
                  maxLength={max}
                  value={resume[key] ?? ""}
                  onChange={(e) => changeResume(key, e.target.value)}
                />
              </div>
            ))}

            {/* 자격증 (여러 개) */}
            <div>
              <p>자격증</p>
              <button
                type="button"
                onClick={() => addItem("certificates", { cert: "", org: "" })}
              >
                + 추가
              </button>
              {resume.certificates.map((item, i) => (
                <div key={i}>
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
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => removeItem("certificates", i)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            {/* 경력 (여러 개) */}
            <div>
              <p>경력</p>
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
              >
                + 추가
              </button>
              {resume.careers.map((item, i) => (
                <div key={i}>
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
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => removeItem("careers", i)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={saveResume}>
              저장
            </button>
            {resumeMessage && <p>{resumeMessage}</p>}
          </section>
        )}
        {/* 면접 기록 탭 */}
        {activeTab === "history" && (
          <section>
            <div>
              <h2>면접 기록</h2>
            </div>

            {interviews.length === 0 && <p>면접 기록이 없어요.</p>}

            {/* 서버에서 받은 면접마다 카드 하나씩 */}
            {interviews.map((iv) => (
              <div key={iv.interview_id}>
                <div>
                  <span>
                    {iv.cat_major} &gt; {iv.cat_minor}
                  </span>
                  <span>{formatDate(iv.created_at)}</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => toggleDialogues(iv.interview_id)}
                  >
                    {openId === iv.interview_id ? "대화 닫기" : "대화 보기"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteInterview(iv.interview_id)}
                  >
                    삭제
                  </button>
                </div>

                {/* 펼친 카드만 질문·답변을 보여준다 */}
                {openId === iv.interview_id &&
                  dialogues.map((d, i) => (
                    <div key={i}>
                      <p>Q. {d.question}</p>
                      <p>A. {d.answer ?? "(답변 없음)"}</p>
                    </div>
                  ))}
              </div>
            ))}
          </section>
        )}

        {/* 회원정보 수정 탭 */}
        {activeTab === "profile" && (
          <section>
            <h2>회원정보 수정</h2>

            <div>
              <div>
                <h3>문서 저장 동의</h3>
                <p>{saveAgreed ? "동의함" : "동의 안 함"}</p>
              </div>
              <button type="button" onClick={toggleAgreement}>
                동의 변경
              </button>
            </div>

            <ul>
              <li>
                내 문서는 본인만 조회할 수 있어요. 다른 회원은 접근할 수 없어요.
              </li>
              <li>문서를 삭제하면 DB에서 바로 삭제되며 되돌릴 수 없어요.</li>
              <li>
                회원 탈퇴 시 자소서 · 이력서 · 문장 · 대화 기록이 모두 삭제돼요.
              </li>
            </ul>

            <button type="button" onClick={withdraw}>
              회원 탈퇴
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default Mypage;
