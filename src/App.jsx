import { Route, Routes } from "react-router"
import Header from "./components/Header"
import Home from "./pages/Home"
import Cl from "./pages/Cl"
import Interview from "./pages/Interview"
import Mypage from "./pages/Mypage"
import Footer from "./components/Footer"

function App() {
  return (
    <div>
      <Header />

      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/cl' element={<Cl />}/>
        <Route path='/interview' element={<Interview />}/>
        <Route path='/mypage' element={<Mypage />}/>
      </Routes>

      <Footer />
    </div>
  )
}
export default App