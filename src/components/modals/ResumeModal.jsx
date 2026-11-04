import { useState, useEffect } from "react";
import Modal from "./Modal";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// onClose: 모달 닫기, onSelect: 고른 이력서를 부모에게 넘기기
// PDF를 고르면 { file }, 기본 양식을 고르면 { text }를 넘긴다
function ResumeModal({ onClose, onSelect }) {
  // 서버에서 받은 내 이력서 (null = 아직 없음)
  const [resume, setResume] = useState(null);
  // 고른 방식 ("pdf" = PDF 첨부, "form" = 기본 양식)
  const [mode, setMode] = useState("pdf");
  // 저장된 토큰. 없으면 처음부터 로그인 안내를 보여 준다
  const token = localStorage.getItem("access_token");
  const [message, setMessage] = useState(
    token ? "불러오는 중…" : "로그인 후 이용할 수 있어요.",
  );

  // 모달이 열리면 한 번 내 이력서를 불러온다 (Mypage와 같은 /mypage/resume)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/mypage/resume`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.ok ? await res.json() : null;
        if (!data?.resume_filename && !data?.name) {
          setMessage("저장한 이력서가 없어요. 마이페이지에서 먼저 작성해 주세요.");
          return;
        }
        setResume(data);
        setMode(data.resume_filename ? "pdf" : "form"); // 있는 쪽을 먼저 선택
        setMessage("");
      } catch {
        setMessage("서버에 연결할 수 없습니다.");
      }
    };
    if (token) load();
  }, [token]);

  // 가져오기 버튼: 고른 방식대로 부모에게 넘기고 닫는다
  const pick = async () => {
    if (mode === "pdf") {
      // PDF 파일을 받아서, PDF 업로드로 고른 파일과 같은 모양(File)으로 만든다
      try {
        const res = await fetch(`${API_URL}/mypage/resume/pdf`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setMessage("이력서 PDF를 불러오지 못했습니다.");
          return;
        }
        const blob = await res.blob();
        onSelect({
          file: new File([blob], resume.resume_filename, {
            type: "application/pdf",
          }),
        });
      } catch {
        setMessage("서버에 연결할 수 없습니다.");
        return;
      }
    } else {
      // 양식 내용을 글 하나로 합친다 (빈 칸은 뺌)
      const text = [
        `이름: ${resume.name}`,
        `학교: ${resume.school}`,
        `전공: ${resume.major}`,
        resume.skill && `보유 기술: ${resume.skill}`,
        ...resume.certificates.map((c) => `자격증: ${c.cert} ${c.org}`),
        ...resume.careers.map(
          (c) => `경력: ${c.company} / ${c.role} (${c.start_year}~${c.end_year})`,
        ),
      ]
        .filter(Boolean)
        .join("\n");
      onSelect({ text });
    }
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-gray-900">내 이력서</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm transition-colors"
        >
          ✕
        </button>
      </div>

      {message && (
        <p className="text-sm text-gray-500 py-8 text-center">{message}</p>
      )}

      {resume && (
        <>
          {/* 마이페이지와 같은 모양의 선택 버튼 */}
          <div className="inline-flex rounded-xl bg-gray-100 p-1 mb-4">
            {[
              ["pdf", "PDF 첨부"],
              ["form", "기본 양식으로 작성"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  mode === key
                    ? "bg-white text-brand font-bold shadow-2xs"
                    : "text-gray-600 hover:text-gray-900 font-medium"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 고른 쪽 미리보기 */}
          <p className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 mb-5">
            {mode === "pdf"
              ? resume.resume_filename || "저장한 PDF가 없어요."
              : resume.name
                ? `${resume.name} · ${resume.school} · ${resume.major}`
                : "작성한 양식이 없어요."}
          </p>

          {/* 고른 쪽이 저장돼 있지 않으면 버튼을 끈다 */}
          <button
            type="button"
            onClick={pick}
            disabled={mode === "pdf" ? !resume.resume_filename : !resume.name}
            className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            가져오기
          </button>
        </>
      )}
    </Modal>
  );
}

export default ResumeModal;
