import Modal from "./Modal"

function SignupModal() {
  return (
    <Modal>
      <div>
        <button>← 로그인</button>

        <h2>회원가입</h2>
        <p>계정 정보를 입력하고 약관에 동의해 주세요.</p>

        <div>
          <p>아이디</p>
          <input type="text" placeholder="영문, 숫자 조합" />
        </div>

        <div>
          <p>비밀번호</p>
          <input type="password" placeholder="비밀번호" />
        </div>

        <div>
          <p>비밀번호 확인</p>
          <input type="password" placeholder="비밀번호 다시 입력" />
        </div>

        <div>
          <p>이메일</p>
          <input type="text" placeholder="name@example.com" />
        </div>

        <div>
          <div>
            <input type="checkbox" />
            <span>전체 동의</span>
          </div>

          <div>
            <input type="checkbox" />
            <span>[필수] 서비스 이용약관 동의</span>
            <button>보기</button>
          </div>

          <div>
            <input type="checkbox" />
            <span>[필수] 개인정보 수집·이용 동의</span>
            <button>보기</button>
          </div>

          <div>
            <div>
              <input type="checkbox" />
              <span>[선택] 문서 저장 동의</span>
            </div>
            <p>내 이력서 · 자기소개서 · 면접 대화를 마이페이지에서 확인하실 수 있어요.</p>
          </div>
        </div>

        <button>가입하기</button>

        <p>필수 항목 동의 후 가입이 가능합니다.</p>
      </div>
    </Modal>
  )
}

export default SignupModal
