import { useState, useEffect } from "react";
import Modal from "./Modal";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// onClose: 모달 닫기, onSelect: 고른 이력서를 부모에게 넘기기
// 기본 이력서를 고르면 { text }, PDF 올리면 { file } 넘김
function ResumeModal({ onClose, onSelect }) {
  // 서버에서 받은 내 이력서 (null = 아직 없음)
  const [resume, setResume] = useState(null);
  // 저장된 토큰. 없으면 처음부터 로그인 안내를 보여 준다
  const token = localStorage.getItem("access_token");
  const [message, setMessage] = useState(
    token ? "불러오는 중" : "로그인하면 저장한 이력서를 불러올 수 있어요.",
  );

  // 모달이 열리면 내 이력서 불러옴
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/mypage/resume`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.ok ? await res.json() : null;
        if (!data?.name) {
          setMessage("저장한 이력서가 없어요.");
          return;
        }
        setResume(data);
        setMessage("");
      } catch {
        setMessage("서버에 연결할 수 없습니다.");
      }
    };
    if (token) load();
  }, [token]);

  // 카드를 누르면 내용을 글 하나로 합쳐 넘기고 닫음
  const pick = () => {
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
    onClose();
  };

  // PC에서 PDF 파일 직접 업로드 후 닫음
  const uploadPdf = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onSelect({ file });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-gray-900">이력서 선택</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 1. 내 이력서 불러오기 */}
      <div className="space-y-3">
        <p className="text-xs font-extrabold text-gray-500">
          내 이력서 불러오기
        </p>

        {message && (
          <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-xs text-gray-500 text-center leading-relaxed">
            {message}
          </p>
        )}

        {/* 카드 누르면 이력서 넘기고 닫음 */}
        {resume && (
          <button
            type="button"
            onClick={pick}
            className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 hover:border-brand hover:bg-brand-soft transition-colors"
          >
            <p className="text-sm font-extrabold text-gray-900">
              {resume.name} · {resume.school} · {resume.major}
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {resume.skill
                ? `보유 기술: ${resume.skill}`
                : `경력 ${resume.careers?.length || 0}건 · 자격증 ${resume.certificates?.length || 0}건`}
            </p>
          </button>
        )}
      </div>

      {/* 구분선 */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium text-gray-400">
            OR
          </span>
        </div>
      </div>

      {/* 2. PC에서 PDF 직접 업로드 */}
      <div className="space-y-2.5">
        <p className="text-xs font-extrabold text-gray-500">
          내 PC에서 직접 업로드
        </p>
        <label className="flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3.5 cursor-pointer hover:border-brand hover:bg-brand-soft/50 transition-colors">
          <span className="text-xs font-medium text-gray-600">
            PDF 파일을 업로드합니다
          </span>
          <span className="shrink-0 rounded-lg border border-brand bg-white px-3 py-1.5 text-xs font-bold text-brand">
            PDF 업로드
          </span>
          <input
            type="file"
            accept=".pdf"
            hidden
            onChange={uploadPdf}
          />
        </label>
      </div>
    </Modal>
  );
}

export default ResumeModal;
