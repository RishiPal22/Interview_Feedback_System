import { useState } from 'react'
import { supabase } from '../Client'
function Signup() {

    const [formData, setFormData] = useState({ email: '', password: '', username: '' })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
    }

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: { username: formData.username } // Store username as metadata
            }
        });

        if (error) {
            console.error("Sign-up error:", error.message);
        } else {
            console.log("User signed up:", data);
        }
    };
    return (
        <>
            <div className='flex flex-col sm:flex-row sm:h-screen sm:w-screen items-center justify-center'>

                <div className='flex flex-col sm:h-90 sm:w-80 bg-gray-200 items-center justify-center'>
                    <h1 className='text-gray-400 text-3xl'>Registration</h1>
                    <hr className="border-red-600 my-2" />
                    <form className='flex flex-col gap-4 m-2 p-2' onSubmit={handleSignUp}>
                        <input value={formData.username}
                            onChange={handleChange} placeholder='Username' type='text' id='username'
                            className="border bg-white border-gray-300 box-border p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-lg"
                            required />
                        <input value={formData.email} placeholder='email'
                            className="border bg-white border-gray-300 box-border p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-lg"

                            onChange={handleChange} type='email' id='email' />
                        <input value={formData.password}
                            className="border bg-white border-gray-300 box-border p-2 shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none rounded-lg"
                            placeholder='password'
                            onChange={handleChange} type='text' id='password' />
                        <button className='bg-blue-500 rounded-lg hover:opacity-95 p-1' type='submit'>Submit</button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Signup;