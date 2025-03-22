"use client"

import { Link } from "react-router-dom"
import { supabase } from "@/Client"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import {MessageSquare} from "lucide-react"

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function fetchSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => {
        authListener?.subscription.unsubscribe()
      }
    }
    fetchSession()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Modified to match the black and purple theme
  return (
    <header className="py-2 sm:py-3 bg-black shadow-xl justify-between flex w-full border-b border-purple-900/50">
      
      <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-6 w-6 text-purple-500" />
                <span className="text-xl font-bold text-purple-500">InterviewPro</span>
              </div>

      <div className="justify-end flex p-1 mx-2 sm:mx-6 space-x-4 cursor-pointer">
        <Link to="/" className="text-purple-400 hover:text-purple-300 transition-colors">
          <p>Home</p>
        </Link>
        <Link to="/interview" className="text-purple-400 hover:text-purple-300 transition-colors">
          <p>Interview</p>
        </Link>
        <Link to="/history" className="text-purple-400 hover:text-purple-300 transition-colors">
          <p>History</p>
        </Link>
        {user ? (
          <button
            className="cursor-pointer text-purple-400 hover:text-purple-300 transition-colors"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        ) : (
          <Link to="/signin" className="text-purple-400 hover:text-purple-300 transition-colors">
            <p>Sign In</p>
          </Link>
        )}
      </div>
    </header>
  )
}

export default Navbar

