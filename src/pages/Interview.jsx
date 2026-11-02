import { useState } from "react"
import "./Interview.css"

const CATEGORIES = ["지원 동기", "경험 및 역량", "인성 및 협업", "입사 후 포부"]

function Interview() {
  const [catMajor, setCatMajor] = useState("") // 직무 대분류
  const [catMinor, setCatMinor] = useState("")   // 직무 소분류
  const [resumeFile, setResumeFile] = useState(null) // 이력서 PDF
  const [clFile, setClFile] = useState(null)         // 자기소개서 PDF
  const [messages, setMessages] = useState([])       // 질문·답변
  const [evidences, setEvidences] = useState([])     // 근거 문장

  const pdfSelect = (e, docType) => {
    const file = e.target.files[0] //<input type="file">
    if (!file) return

    if (docType === "resume") setResumeFile(file)
    if (docType === "cl") setClFile(file)
  }

  const askQuestion = async () => {
    const selects = document.querySelectorAll("select")
    setCatMajor(selects[0].value)
    setCatMinor(selects[1].value)

    const formData = new FormData()
    formData.append("job", selects[1].value)
    if (resumeFile) formData.append("resume", resumeFile)
    if (clFile) formData.append("cl", clFile)

    const res = await fetch("http://127.0.0.1:8000/pdf", {
      method: "POST",
      body: formData, //FormData는 headers 쓰면 안 됨
    })
    const data = await res.json()
    setEvidences([data.evidences || []])
    setMessages([{ type: "question", category: CATEGORIES[0], text: data.question }])
  }

  const submitAnswer = async (e) => {
    const textarea = e.currentTarget.previousElementSibling
    const text = textarea.value
    if (!text.trim() || messages.at(-1)?.type !== "question") return
    textarea.value = ""

    setMessages((prev) => [...prev, { type: "answer", text }])

    const nextCategory = CATEGORIES[evidences.length]
    if (!nextCategory) return

    const res = await fetch("http://127.0.0.1:8000/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: nextCategory, job: catMinor }),
    })
    const data = await res.json()
    setEvidences((prev) => [...prev, data.evidences || []])
    setMessages((prev) => [
      ...prev,
      { type: "question", category: nextCategory, text: data.question },
    ])
  }

  return (
    <div id="iv">
      <header id="iv-head">
        <h1>AI 면접</h1>
      </header>

      <div id="iv-setup">
        <div className="field">
          <label>직무</label>
          <div className="row">
            <select>
              <option>AI·개발·데이터</option>
            </select>
            <select>
              <option>백엔드개발자</option>
              <option>프론트엔드개발자</option>
              <option>웹개발자</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>이력서</label>
          <div className="row">
            {resumeFile ? (
              <span>{resumeFile.name}</span>
            ) : (
              <button type="button" onClick={(e) => e.currentTarget.nextElementSibling.click()}> {/* 현재 누른 버튼의 다음 태그 클릭 */}
                PDF 업로드
              </button>
            )}
            <input type="file" accept=".pdf" hidden onChange={(e) => pdfSelect(e, "resume")} />
            <button type="button">
              내 이력서 가져오기
            </button>
          </div>
        </div>

        <div className="field">
          <label>자기소개서</label>
          <div className="row">
            {clFile ? (
              <span>{clFile.name}</span>
            ) : (
              <button type="button" onClick={(e) => e.currentTarget.nextElementSibling.click()}>
                PDF 업로드
              </button>
            )}
            <input type="file" accept=".pdf" hidden onChange={(e) => pdfSelect(e, "cl")} />
            <button type="button">
              내 자기소개서 가져오기
            </button>
          </div>
        </div>

        <button type="button" className="btn-main" onClick={askQuestion}>질문 생성</button>

        <div className="field">
          <label>질문 항목</label>
          <div className="q-list">
            <div className="q-item">
              <span>① 지원 동기</span>
              <p>{messages[1] ? "완료" : "미입력"}</p>
            </div>
            <div className="q-item">
              <span>② 경험 및 역량</span>
              <p>{messages[3] ? "완료" : "미입력"}</p>
            </div>
            <div className="q-item">
              <span>③ 인성 및 협업</span>
              <p>{messages[5] ? "완료" : "미입력"}</p>
            </div>
            <div className="q-item">
              <span>④ 입사 후 포부</span>
              <p>{messages[7] ? "완료" : "미입력"}</p>
            </div>
          </div>
        </div>
      </div>

      <div id="iv-ev">
        <h3>근거 문장</h3>
        {evidences[0]?.length > 0 && (
          <div className="ev-group">
            <p>① 지원 동기</p>
            <div className="q-list">
              {evidences[0].map((ev, i) => (
                <div key={i} className="ev-item">
                  <span>[1-{i + 1}]</span> {ev}
                </div>
              ))}
            </div>
          </div>
        )}
        {evidences[1]?.length > 0 && (
          <div className="ev-group">
            <p>② 경험 및 역량</p>
            <div className="q-list">
              {evidences[1].map((ev, i) => (
                <div key={i} className="ev-item">
                  <span>[2-{i + 1}]</span> {ev}
                </div>
              ))}
            </div>
          </div>
        )}
        {evidences[2]?.length > 0 && (
          <div className="ev-group">
            <p>③ 인성 및 협업</p>
            <div className="q-list">
              {evidences[2].map((ev, i) => (
                <div key={i} className="ev-item">
                  <span>[3-{i + 1}]</span> {ev}
                </div>
              ))}
            </div>
          </div>
        )}
        {evidences[3]?.length > 0 && (
          <div className="ev-group">
            <p>④ 입사 후 포부</p>
            <div className="q-list">
              {evidences[3].map((ev, i) => (
                <div key={i} className="ev-item">
                  <span>[4-{i + 1}]</span> {ev}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div id="iv-chat">
        <div id="chat-head">
          <h3>{catMajor} &gt; {catMinor}</h3>
          <button type="button">대화 저장</button>
        </div>
        <div id="chat-list">
          {messages.map((msg, i) =>
            msg.type === "question" ? (
              <div key={i} className="msg-q">
                <span>{msg.category}</span>
                {evidences[CATEGORIES.indexOf(msg.category)]?.length > 0 && (
                  <span>근거 [{CATEGORIES.indexOf(msg.category) + 1}-1]</span>
                )}
                <div>{msg.text}</div>
              </div>
            ) : (
              <div key={i} className="msg-a">{msg.text}</div>
            )
          )}
          <div id="warn-box">
            <div>
              <span>⚠️</span>
              <h4>서류와 다른 부분이 있어요</h4>
            </div>
            <p>
              자기소개서 <span>팀원 4명</span> · 답변 <span>팀원 6명</span>
            </p>
          </div>
        </div>
        <div id="chat-input">
          <textarea
            placeholder="답변을 입력하세요"
          ></textarea>
          <button type="button" className="btn-main" onClick={submitAnswer}>
            전송
          </button>
        </div>
      </div>
    </div>
  )
}
export default Interview