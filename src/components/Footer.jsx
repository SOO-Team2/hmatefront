// 모든 페이지 맨 아래에 보이는 공통 푸터 (App.jsx에서 <Routes> 바깥에 둠)
function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white py-8 px-6 text-xs text-gray-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 font-medium text-gray-600">
          <span className="cursor-pointer hover:text-gray-900">이용약관</span>
          <span className="text-gray-300">|</span>
          <span className="cursor-pointer hover:text-gray-900">개인정보처리방침</span>
        </div>

        <div className="flex items-center gap-4">
          <p className="font-semibold text-gray-700">TEAM 2</p>
          <p className="cursor-pointer hover:text-gray-900">문의하기</p>
        </div>

        <p className="text-gray-400">© 2026 합격 메이트. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
