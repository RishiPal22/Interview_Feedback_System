import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { supabase } from '../Client'
import { useError } from '../context/UseError';
import { Link } from 'react-router-dom';
function Signup() {

    const navigate = useNavigate();
    const { error, setError } = useError();


    const [formData, setFormData] = useState({ email: '', password: '', username: '' })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
    }

    
    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        if (!formData.email || !formData.password || !formData.username) {
            setError('Please fill in all fields')
            return
        }
    
        const {error} = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: { username: formData.username } // Store username as metadata
            }
        });

        if(error) {
            setError(error.message)
        }
        else{
            navigate('/')
          }


    };
    return (
        <>
            <div className='flex flex-col h-screen w-screen items-center justify-start sm:justify-center my-3.5'>

                <div className='flex flex-col sm:h-[450px] sm:w-140 w-80 bg-gray-200 items-center p-8 sm:p-8'>
                    <h1 className='text-gray-800 text-2xl sm:text-5xl  '>Create your account</h1>
                    <hr className="border-gray-400 sm:my-2 my-4 w-full" />
                    {error && <p className='text-red-500'>{error}</p>}
                    <div className='flex flex-col items-center justify-center h-full w-full'>
                        <form className='flex flex-col items-center justify-center gap-4 m-2 p-2 w-80 sm:w-96' onSubmit={handleSignUp}>
                            <input value={formData.username}
                                onChange={handleChange} placeholder='Username' type='text' id='username'
                                className="border bg-white sm:w-80 w-48 border-gray-300 box-border p-2 shadow-md focus:ring-2 focus:ring-blue-400  focus:outline-none rounded-lg"
                                required />
                            <input value={formData.email} placeholder='email'
                                className="border sm:w-80 w-48 bg-white border-gray-300 box-border p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-lg"

                                onChange={handleChange} type='email' id='email' />
                            <input value={formData.password}
                                className="border sm:w-80 w-48 bg-white border-gray-300 box-border p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-lg"
                                placeholder='password'
                                onChange={handleChange} type='password' id='password' />
                            <button className='bg-blue-500 sm:w-80 w-48 rounded-lg uppercase hover:opacity-90 p-1' type='submit'>Sign up</button>
                            <p>Already have an account? <Link to='/signin'><span className='text-blue-700' >SignIn</span></Link></p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Signup;