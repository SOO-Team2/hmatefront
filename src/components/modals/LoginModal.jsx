import Modal from "./Modal"

function LoginModal() {
  return (
    <Modal>
      <div>
        <button>← 홈으로</button>

        <h2>로그인</h2>

        <div>
          <p>아이디</p>
          <input type="text" placeholder="아이디를 입력하세요" />
        </div>

        <div>
          <p>비밀번호</p>
          <input type="password" placeholder="비밀번호를 입력하세요" />
        </div>

        <button>로그인</button>

        <div>
          <button>아이디 찾기</button>
          <span>|</span>
          <button>비밀번호 찾기</button>
        </div>

        <div>
          <p>아직 회원이 아니신가요?</p>
          <button>회원가입</button>
        </div>
      </div>
    </Modal>
  )
}

export default LoginModal
