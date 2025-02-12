import { Link } from "react-router-dom";

const Navbar = () => {
  return(<>
    <header className='py-2 sm:py-3 bg-slate-200 shadow-2xl justify-between flex w-full'>
        <h1 className='flex justify-between items-center border-black' >
          <p className='text-gray-900 font-serif text-sm sm:text-3xl font-medium mx-2 sm:mx-6 align-middle'>Interview Feedback</p>
        </h1>

        <div className='justify-end flex p-1 mx-2 sm:mx-6 space-x-4 cursor-pointer'>
          <Link to="/"><p>Home</p></Link>
          <Link to="/interview"><p>Interview</p></Link>
          <Link to="/history"><p>History</p></Link>
          <Link to='/signin'><p>SignIn</p></Link>
        </div>
        </header>
        
  </>

  )
}

export default Navbar;
