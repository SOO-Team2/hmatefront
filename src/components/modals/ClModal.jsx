import { useState, useEffect } from "react";
import Modal from "./Modal";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// onClose: 모달 닫기, onSelect: 고른 자소서를 부모에게 넘기기
// 저장된 자소서를 고르면 { cl: { title, text } }, PDF를 올리면 { file }을 넘긴다
function ClModal({ onClose, onSelect }) {
  // 서버에서 받은 내 자소서 목록
  const [cls, setCls] = useState([]);
  // 저장된 토큰. 없으면 처음부터 로그인 안내를 보여 준다
  const token = localStorage.getItem("access_token");
  const [message, setMessage] = useState(
    token ? "불러오는 중" : "로그인 후 이용할 수 있어요.",
  );

  // 모달이 열리면 한 번 내 자소서를 불러온다 ( /mypage/cl)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/mypage/cl`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setMessage("목록을 불러오지 못했습니다.");
          return;
        }
        const data = await res.json();
        setCls(data);
        setMessage(
          data.length === 0
            ? "저장한 자기소개서가 없어요."
            : "",
        );
      } catch {
        setMessage("서버에 연결할 수 없습니다. 서버가 켜져 있는지 확인해 주세요.");
      }
    };
    if (token) load();
  }, [token]);

  // 카드를 누르면 4칸을 "제목 + 내용"으로 이어 붙여 부모에게 넘기고 닫는다 (빈 칸은 뺌)
  const pick = (cl) => {
    const text = [
      ["지원 동기", cl.motivation],
      ["경험 및 역량", cl.experience],
      ["인성 및 협업", cl.personality],
      ["입사 후 포부", cl.plan],
    ]
      .filter(([, body]) => body)
      .map(([label, body]) => `[${label}]\n${body}`)
      .join("\n\n");
    onSelect({ cl: { title: cl.title, text } });
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
        <h2 className="text-xl font-extrabold text-gray-900">자기소개서 선택</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 1. 내 자기소개서 불러오기 */}
      <div className="space-y-3">
        <p className="text-xs font-extrabold text-gray-500">
          내 자기소개서 불러오기
        </p>

        {message && (
          <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-xs text-gray-500 text-center leading-relaxed">
            {message}
          </p>
        )}

        {/* 카드를 누르면 넘기고 닫음 */}
        {cls.length > 0 && (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {cls.map((cl) => (
              <button
                key={cl.cl_id}
                type="button"
                onClick={() => pick(cl)}
                className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 hover:border-brand hover:bg-brand-soft transition-colors"
              >
                <p className="text-sm font-extrabold text-gray-900">{cl.title}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {cl.motivation || cl.experience || cl.personality || cl.plan}
                </p>
              </button>
            ))}
          </div>
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

export default ClModal;
