"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "../Client"
import AudioRecorder from "../Components/AudioRecorder"
import { User, Mail, Loader2, MessageSquare, Video } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../Components/ui/avatar"
import { Button } from "../Components/ui/button"
import { Separator } from "../Components/ui/separator"

function Interview() {
  const [userData, setUserData] = useState({ username: "", email: "", userId: "" })
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState("")
  const [showQuestion, setShowQuestion] = useState(false)
  const [availableQuestions, setAvailableQuestions] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { user } = session
          setUserData({
            username: user.user_metadata.username || "",
            email: user.email || "",
            userId: user.id || "",
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch("/questions.json")
        const data = await response.json()
        setAvailableQuestions(data.map((q: { question: string }) => q.question))
      } catch (error) {
        console.error("Error fetching questions:", error)
      }
    }
    fetchQuestions()
  }, [])

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  const getNextQuestion = () => {
    if (availableQuestions.length === 0) {
      setQuestion("No more questions available.")
      return
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length)
    const nextQuestion = availableQuestions[randomIndex]

    setAvailableQuestions(availableQuestions.filter((_, i) => i !== randomIndex))
    setQuestion(nextQuestion)
  }

  const getInitials = (name: string): string => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  const startInterview = async () => {
    try {
      setIsFlipped(true)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      if (question === "") {
        getNextQuestion()
        setShowQuestion(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Could not access camera. Please check your permissions.")
      setIsFlipped(false)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setIsFlipped(false)
  }

  return (
    <div className="bg-[#121212] min-h-screen text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl font-bold mb-3 text-transparent bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text">
            Interview Session
          </h1>
          <p className="text-purple-200 text-center max-w-md opacity-80">
            Record your interview responses with our professional audio recording tool.
          </p>
        </div>

        {loading ? (
          <Card className="w-full bg-[#1E1E1E] border-[#333] shadow-xl">
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <span className="ml-2 text-lg text-purple-200">Loading your profile...</span>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
            {/* Profile Card */}
            <Card className="bg-[#1E1E1E] border-[#333] shadow-xl overflow-hidden">
              <CardHeader className="border-b border-[#333] bg-[#252525]">
                <CardTitle className="text-white">Profile</CardTitle>
                <CardDescription className="text-purple-300">Your interview account details</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6 pt-8">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full blur opacity-70" />
                  <Avatar className="h-28 w-28 relative border-2 border-purple-500">
                    <AvatarImage src={`https://avatar.vercel.sh/${userData.username}`} alt={userData.username} />
                    <AvatarFallback className="text-2xl bg-[#252525] text-purple-300">
                      {getInitials(userData.username)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="w-full space-y-3 bg-[#252525] p-4 rounded-lg">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-5 w-5 text-purple-400" />
                    <span className="font-medium text-white">{userData.username || "No username set"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-5 w-5 text-purple-400" />
                    <span className="text-gray-300">{userData.email || "No email available"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interview Card Flip */}
            <div className="relative h-[500px] w-full perspective-1000">
              <div
                className={`relative w-full h-full transition-transform duration-700 ${
                  isFlipped ? "rotate-y-180" : ""
                } [transform-style:preserve-3d]`}
              >
                {/* Front */}
                <Card className="absolute w-full h-full [backface-visibility:hidden] bg-[#1E1E1E] border-[#333] shadow-xl">
                  <CardHeader className="border-b border-[#333] bg-[#252525]">
                    <CardTitle className="text-white">Interview Session</CardTitle>
                    <CardDescription className="text-purple-300">Ready to start your interview?</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-[400px] p-6">
                    <div className="text-center space-y-6">
                      <div className="flex justify-center">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full blur opacity-70" />
                          <div className="relative bg-[#252525] p-6 rounded-full">
                            <Video className="h-16 w-16 text-purple-400" />
                          </div>
                        </div>
                      </div>
                      <p className="text-purple-200 text-lg">
                        Click the button below to start your interview session.
                        <br />
                        Make sure your camera and microphone are ready.
                      </p>
                      <Button
                        onClick={startInterview}
                        disabled={!userData.username}
                        className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-8 py-6 text-lg rounded-lg shadow-lg"
                      >
                        Start Interview
                      </Button>
                      {!userData.username && (
                        <p className="text-red-400 text-sm">Please complete your profile to start the interview</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Back */}
                <Card className="absolute w-full h-full [backface-visibility:hidden] rotate-y-180 bg-[#1E1E1E] border-[#333] shadow-xl overflow-hidden">
                  <CardHeader className="border-b border-[#333] bg-[#252525] flex flex-row justify-between items-start">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Button
                        onClick={() => {
                          getNextQuestion()
                          setShowQuestion(true)
                        }}
                        disabled={processing}
                        className={`bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 ${
                          processing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Next</span>
                      </Button>


                      {userData.username && (
                        <div className="flex-shrink-0 w-full sm:w-auto">
                          <AudioRecorder
                            username={userData.username}
                            email={userData.email}
                            userId={userData.userId}
                            interviewQuestion={question}
                            setProcessing={setProcessing}
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 overflow-y-auto max-h-[calc(500px-80px)]">
                    {showQuestion && (
                      <div className="mb-4 bg-[#252525] px-5 py-3 rounded-lg shadow-md border border-purple-500 animate-fade-in text-center">
                        <p className="text-lg text-purple-300 font-semibold">{question}</p>
                      </div>
                    )}

                    <div className="relative mb-4 bg-black rounded-lg overflow-hidden aspect-video">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        <Separator className="my-10 bg-[#333]" />
      </div>
    </div>
  )
}

export default Interview
