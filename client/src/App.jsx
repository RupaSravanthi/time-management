import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Homepage from "./pages/Homepage"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Userprofile from "./pages/Userprofile"


function App() {


  return (
    <>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Userprofile />} />

      </Routes>
    </>
  )
}

export default App
