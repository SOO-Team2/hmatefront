import { Route, Routes } from "react-router"
import Header from "./components/Header"
import Home from "./pages/Home"
import Cl from "./pages/Cl"
import Interview from "./pages/Interview"
import Mypage from "./pages/Mypage"
import Footer from "./components/Footer"

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-gray-900">
      <Header />

      <div className="flex-1">
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/cl' element={<Cl />}/>
          <Route path='/interview' element={<Interview />}/>
          <Route path='/mypage' element={<Mypage />}/>
        </Routes>
      </div>

      <Footer />
    </div>
  )
}
export default App
