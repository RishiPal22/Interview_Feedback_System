import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import SignIn from './pages/SignIn'
import Signup from './pages/Signup'
import Home from './pages/Home'

function App() {
 
  

  return (
    <>
      <BrowserRouter>  {/* Ensure routing works properly */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>

      

    </>
  )
}

export default App
