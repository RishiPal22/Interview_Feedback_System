import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import SignIn from './pages/SignIn'
import Signup from './pages/Signup'
import Home from './pages/Home'
import { ErrorProvider } from './context/ErrorProvider'
import Interview from './pages/Interview'
import Navbar from './Components/Navbar'

function App() {
 
  

  return (
    <>
    <ErrorProvider>

      <BrowserRouter>  {/* Ensure routing works properly */}
      <Navbar/>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/interview" element={<Interview />} />
      </Routes>
    </BrowserRouter>
    </ErrorProvider>

      

    </>
  )
}

export default App
