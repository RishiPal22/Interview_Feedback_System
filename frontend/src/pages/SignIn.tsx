"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../Client"
import { Link } from "react-router-dom"
import { useError } from "../context/UseError"
import AudioRecorder from "../Components/AudioRecorder"

function SignIn() {
  const { error, setError } = useError()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [userData, setUserData] = useState({ username: "", email: "", userId: "" })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })
    console.log(data)
    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      const { user } = data
      setUserData({
        username: user.user_metadata?.username || "",
        email: user.email || "",
        userId: user.id || "",
      })
      navigate("/")
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #000000, #2d1b4e)",
          padding: "14px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "440px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(128, 90, 213, 0.2)",
            padding: "32px",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: "32px",
              fontWeight: "bold",
              background: "linear-gradient(to right, #a78bfa, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0 0 16px 0",
              textAlign: "center",
            }}
          >
            Login your account
          </h1>

          <hr
            style={{
              border: "none",
              height: "1px",
              backgroundColor: "rgba(128, 90, 213, 0.3)",
              width: "100%",
              margin: "0 0 20px 0",
            }}
          />

          {error && (
            <p
              style={{
                color: "#f87171",
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                padding: "10px 16px",
                borderRadius: "8px",
                width: "100%",
                textAlign: "center",
                marginBottom: "16px",
                border: "1px solid rgba(220, 38, 38, 0.2)",
              }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                margin: "8px",
                padding: "8px",
                width: "100%",
              }}
              onSubmit={handleSignIn}
            >
              <input
                value={formData.email}
                placeholder="Email"
                style={{
                  width: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(128, 90, 213, 0.5)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "16px",
                  color: "white",
                  outline: "none",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
                onChange={handleChange}
                type="email"
                id="email"
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b5cf6"
                  e.target.style.boxShadow = "0 0 0 2px rgba(139, 92, 246, 0.25)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(128, 90, 213, 0.5)"
                  e.target.style.boxShadow = "none"
                }}
              />

              <input
                value={formData.password}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(128, 90, 213, 0.5)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "16px",
                  color: "white",
                  outline: "none",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
                placeholder="Password"
                onChange={handleChange}
                type="password"
                id="password"
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b5cf6"
                  e.target.style.boxShadow = "0 0 0 2px rgba(139, 92, 246, 0.25)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(128, 90, 213, 0.5)"
                  e.target.style.boxShadow = "none"
                }}
              />

              <button
                style={{
                  width: "100%",
                  background: "linear-gradient(to right, #8b5cf6, #6d28d9)",
                  color: "white",
                  fontWeight: "500",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  transform: "scale(1)",
                  boxShadow: "0 4px 6px rgba(139, 92, 246, 0.25)",
                  opacity: isLoading ? "0.7" : "1",
                  fontSize: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = "linear-gradient(to right, #7c3aed, #5b21b6)"
                    e.currentTarget.style.transform = "scale(1.02)"
                    e.currentTarget.style.boxShadow = "0 6px 10px rgba(139, 92, 246, 0.3)"
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "linear-gradient(to right, #8b5cf6, #6d28d9)"
                  e.currentTarget.style.transform = "scale(1)"
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(139, 92, 246, 0.25)"
                }}
                onMouseDown={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = "scale(0.98)"
                  }
                }}
                onMouseUp={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = "scale(1.02)"
                  }
                }}
                type="submit"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <p
                style={{
                  color: "#d1d5db",
                  fontSize: "14px",
                  margin: "8px 0 0 0",
                }}
              >
                Don't have an account?{" "}
                <Link to="/signup">
                  <span
                    style={{
                      color: "#a78bfa",
                      fontWeight: "500",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = "#d8b4fe"
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = "#a78bfa"
                    }}
                  >
                    SignUp
                  </span>
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      {userData.username && (
        <AudioRecorder username={userData.username} email={userData.email} userId={userData.userId} />
      )}
    </>
  )
}

export default SignIn

