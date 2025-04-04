import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import SignIn from './pages/SignIn'
import Signup from './pages/Signup'
import History from './pages/History'
import Home from './pages/Home'
import { ErrorProvider } from './context/ErrorProvider'
import Interview from './pages/Interview'
import Navbar from './Components/Navbar'
import Privateroute from './Components/Privateroute'

function App() {



  return (
    <>
      <ErrorProvider>

        <BrowserRouter>  {/* Ensure routing works properly */}
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<Privateroute />}>
              <Route path="/interview" element={<Interview />} />
              <Route path="/history" element={<History />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorProvider>



    </>
  )
}

export default App
