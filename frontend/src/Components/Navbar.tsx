import { Link } from "react-router-dom";
import { supabase } from "@/Client";
import { useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchSession() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }
  fetchSession();
  }, []);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className='py-2 sm:py-3 bg-slate-200 shadow-2xl justify-between flex w-full'>
      <h1 className='flex justify-between items-center border-black'>
        <p className='text-gray-900 font-serif text-sm sm:text-3xl font-medium mx-2 sm:mx-6 align-middle'>Interview Feedback</p>
      </h1>

      <div className='justify-end flex p-1 mx-2 sm:mx-6 space-x-4 cursor-pointer'>
        <Link to="/"><p>Home</p></Link>
        <Link to="/interview"><p>Interview</p></Link>
        <Link to="/history"><p>History</p></Link>
        {user ? (
          <button className="cursor-pointer" onClick={handleSignOut}>Sign Out</button>
        ) : (
          <Link to='/signin'><p>Sign In</p></Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
