import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Client";
import { Link } from "react-router-dom";
import { useError } from "../context/UseError";
import AudioRecorder from "../Components/AudioRecorder";

function SignIn() {
  const { error, setError } = useError();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [userData, setUserData] = useState({ username: '', email: '', userId: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });
    console.log(data);
    if (error) {
      setError(error.message);
    } else {
      const { user } = data;
      setUserData({
        username: user.user_metadata?.username || '',
        email: user.email || '',
        userId: user.id || '',
      });
      navigate('/');
    }
  };

  return (
    <>
      <div className='flex flex-col h-screen w-screen items-center justify-start sm:justify-center my-3.5'>
        <div className='flex flex-col sm:h-[400px] sm:w-140 w-80 bg-gray-200 items-center p-8 sm:p-8'>
          <h1 className='text-gray-800 text-2xl sm:text-5xl'>Login your account</h1>
          <hr className="border-gray-400 sm:my-2 my-4 w-full" />
          {error && <p className='text-red-500'>{error}</p>}
          <div className='flex flex-col items-center justify-center h-full w-full'>
            <form className='flex flex-col items-center justify-center gap-4 m-2 p-2 w-80 sm:w-96' onSubmit={handleSignIn}>
              <input value={formData.email} placeholder='email'
                className="border sm:w-80 w-48 bg-white border-gray-300 box-border p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-lg"
                onChange={handleChange} type='email' id='email' />
              <input value={formData.password}
                className="border sm:w-80 w-48 bg-white border-gray-300 box-border p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-lg"
                placeholder='password'
                onChange={handleChange} type='text' id='password' />
              <button className='bg-blue-500 sm:w-80 w-48 rounded-lg uppercase hover:opacity-95 p-1' type='submit'>Sign in</button>
              <p>Dont have an account? <Link to='/signup'><span className='text-blue-700'>SignUp</span></Link></p>
            </form>
          </div>
        </div>
      </div>
      {userData.username && <AudioRecorder username={userData.username} email={userData.email} userId={userData.userId} />}
    </>
  );
}

export default SignIn;