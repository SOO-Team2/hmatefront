import { useState, useEffect } from "react";
import Modal from "./Modal";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// onClose: 모달 닫기, onSelect: 고른 자소서를 부모에게 넘기기
function ClModal({ onClose, onSelect }) {
  // 서버에서 받은 내 자소서 목록
  const [cls, setCls] = useState([]);
  // 저장된 토큰. 없으면 처음부터 로그인 안내를 보여 준다
  const token = localStorage.getItem("access_token");
  const [message, setMessage] = useState(
    token ? "불러오는 중…" : "로그인 후 이용할 수 있어요.",
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
        setMessage(data.length === 0 ? "저장한 자기소개서가 없어요." : "");
      } catch {
        setMessage("서버에 연결할 수 없습니다.");
      }
    };
    if (token) load();
  }, [token]);

  // 카드를 누르면 4칸을 "제목 + 내용"으로 이어 붙여 부모에게 넘기고 닫는다 (빈 칸은 뺌)
  const pick = (cl) => {
    const text = [
      ["지원 동기", cl.motivation],
      ["성장 과정", cl.growth],
      ["성격의 장단점", cl.personality],
      ["입사 후 포부", cl.plan],
    ]
      .filter(([, body]) => body)
      .map(([label, body]) => `[${label}]\n${body}`)
      .join("\n\n");
    onSelect({ title: cl.title, text });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold text-gray-900">내 자기소개서</h2>
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

      {/* 카드를 누르면 그 자소서를 넘기고 닫는다 */}
      <div className="space-y-2.5">
        {cls.map((cl) => (
          <button
            key={cl.cl_id}
            type="button"
            onClick={() => pick(cl)}
            className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 hover:border-brand hover:bg-brand-soft transition-colors"
          >
            <p className="text-sm font-extrabold text-gray-900">{cl.title}</p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {cl.motivation || cl.growth || cl.personality || cl.plan}
            </p>
          </button>
        ))}
      </div>
    </Modal>
  );
}

export default ClModal;
