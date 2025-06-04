"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "../Client"
// import VideoRecorder from "../Components/VideoRecorder"
import VideoRecorder from "../Components/AudioRecorder"
import { User, Mail, Loader2, MessageSquare, Video, Camera, Play } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../Components/ui/avatar"
import { Button } from "../Components/ui/button"
import { Separator } from "../Components/ui/separator"
import { Badge } from "../Components/ui/badge"

function Interview() {
  const [userData, setUserData] = useState({ username: "", email: "", userId: "" })
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState("")
  const [showQuestion, setShowQuestion] = useState(false)
  const [availableQuestions, setAvailableQuestions] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
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
    if (availableQuestions.length === 0 || questionsAnswered >= 2) {
      setIsCompleted(true)
      setShowQuestion(false)
      return
    }
    const randomIndex = Math.floor(Math.random() * availableQuestions.length)
    const nextQuestion = availableQuestions[randomIndex]
    setAvailableQuestions(availableQuestions.filter((_, i) => i !== randomIndex))
    setQuestion(nextQuestion)
    setShowQuestion(true)
    setHasRecorded(false)
    setQuestionsAnswered((prev) => prev + 1)
  }

  const getInitials = (name: string): string => {
    return name ? name.charAt(0).toUpperCase() : "U"
  }

  const startInterview = async () => {
    try {
      setIsInterviewStarted(true)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      if (question === "") {
        getNextQuestion()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Could not access camera. Please check your permissions.")
      setIsInterviewStarted(false)
    }
  }

  const stopInterview = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setIsInterviewStarted(false)
    setShowQuestion(false)
  }

  const handleNewSession = () => {
    setQuestionsAnswered(0)
    setIsCompleted(false)
    setAvailableQuestions([]) // Optionally reload questions
    setShowQuestion(false)
    setIsInterviewStarted(false)
    setQuestion("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Interview Session
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Record your interview responses with our professional video recording platform. Get AI-powered analysis and
            feedback on your performance.
          </p>
        </div>

        {loading ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span className="text-lg">Loading your profile...</span>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
            {/* Profile Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-8">
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30" />
                    <Avatar className="h-24 w-24 relative border-4 border-background">
                      <AvatarImage src={`https://avatar.vercel.sh/${userData.username}`} alt={userData.username} />
                      <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {getInitials(userData.username)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{userData.username || "Anonymous User"}</CardTitle>
                  <CardDescription>{userData.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{userData.username || "No username set"}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{userData.email || "No email available"}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Session Status</h4>
                    <Badge variant={isInterviewStarted ? "default" : "secondary"} className="w-full justify-center">
                      {isInterviewStarted ? "Interview Active" : "Ready to Start"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Interview Area */}
            <div className="space-y-6">
              {!isInterviewStarted ? (
                /* Welcome Screen */
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-6 relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30" />
                      <div className="relative bg-background p-6 rounded-full border">
                        <Video className="h-12 w-12 text-blue-600" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl mb-2">Ready to Start Your Interview?</CardTitle>
                    <CardDescription className="text-base">
                      Click the button below to begin your interview session. Make sure your camera and microphone are
                      ready.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 justify-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <Camera className="h-4 w-4 text-blue-600" />
                        <span>Camera Access</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                        <span>AI Analysis</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <Play className="h-4 w-4 text-purple-600" />
                        <span>Video Recording</span>
                      </div>
                    </div>

                    <Button
                      onClick={startInterview}
                      disabled={!userData.username}
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
                    >
                      <Video className="h-5 w-5 mr-2" />
                      Start Interview Session
                    </Button>

                    {!userData.username && (
                      <p className="text-red-500 text-sm">Please complete your profile to start the interview</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* Interview Session */
                <div className="space-y-6">
                  {/* Question Display */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <CardTitle className="text-lg">Interview Question</CardTitle>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={getNextQuestion}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          disabled={!hasRecorded}
                        >
                          <MessageSquare className="h-4 w-4" />
                          Next Question
                        </Button>
                        <Button onClick={stopInterview} variant="destructive" size="sm">
                          End Session
                        </Button>
                      </div>
                    </CardHeader>
                    {showQuestion && question && (
                      <CardContent>
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-lg font-medium text-center">{question}</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Video Recorder Component */}
                  {userData.username && !isCompleted && (
                    <VideoRecorder
                      username={userData.username}
                      email={userData.email}
                      userId={userData.userId}
                      interviewQuestion={question}
                      setProcessing={setProcessing}
                      setHasRecorded={setHasRecorded}
                      getNextQuestion={getNextQuestion}
                      questionsAnswered={questionsAnswered}
                      maxQuestions={5}
                    />
                  )}
                  {isCompleted && (
                    <Card className="text-center">
                      <CardHeader>
                        <CardTitle>Congratulations!</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg mb-4">You have completed all 3 interview questions.</p>
                        <Button onClick={handleNewSession}>Start New Session</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Interview
