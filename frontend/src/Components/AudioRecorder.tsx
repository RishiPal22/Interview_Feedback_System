"use client"

import { useEffect, useRef, useState } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/Client"
import { useReactMediaRecorder } from "react-media-recorder"
import { Camera, Eye, Play, Square, RotateCcw, Mic } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Progress } from "@/Components/ui/progress"
import VideoFrames from "./VideoFrames"

interface VideoRecorderProps {
  username: string
  email: string
  userId: string
  interviewQuestion: string
  setProcessing: (value: boolean) => void
  setHasRecorded: (value: boolean) => void
  getNextQuestion: () => void // <-- Add this line
}

const VideoRecorder = ({
  username,
  email,
  userId,
  interviewQuestion,
  setProcessing,
  setHasRecorded,
  getNextQuestion, 
}: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [relevancy, setRelevancy] = useState<number | null>(null)
  const [processing, setLocalProcessing] = useState(false)
  const [countdown, setCountdown] = useState(20)
  const [recordingStopped, setRecordingStopped] = useState(false)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null)

  const { startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({
    audio: true,
    video: true,
    onStart: () => {
      setIsRecording(true)
      startCountdown()
    },
    onStop: () => {
      setIsRecording(false)
      stopCountdown()
      setHasRecorded(true) // <-- Mark as recorded
    },
  })

  const startCountdown = () => {
    setCountdown(20)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopRecording()
          stopCountdown()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }

  useEffect(() => {
    async function sendVideo() {
      if (mediaBlobUrl) {
        setProcessing(true)
        setLocalProcessing(true)
        try {
          const response = await fetch(mediaBlobUrl)
          const blob = await response.blob()
          const randomNum = Math.floor(Math.random() * 10000)
          const fileName = `${username}_${randomNum}.mp4`

          const { data, error } = await supabase.storage.from("videosstore").upload(fileName, blob)

          if (error) {
            console.error("Error uploading video:", error.message)
          } else {
            const videoUrl = data.path
            await supabase.from("videos").insert({
              user_id: userId,
              username,
              email,
              video_url: videoUrl,
            })

            const { data: fileData, error: fileError } = await supabase.storage.from("videosstore").download(videoUrl)

            if (fileError) {
              console.error("Error downloading video:", fileError.message)
            } else {
              const base64Buffer = await fileData.arrayBuffer()
              const base64AudioFile = btoa(
                new Uint8Array(base64Buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
              )

              const apiKey = import.meta.env.VITE_API_KEY
              if (!apiKey) {
                throw new Error("API_KEY is not defined in the environment variables")
              }
              const genAI = new GoogleGenerativeAI(apiKey)
              const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
              })

              const userQuestion = interviewQuestion

              const result = await model.generateContent([
                {
                  inlineData: {
                    mimeType: "audio/mp3",
                    data: base64AudioFile,
                  },
                },
                { text: `The user was asked: "${userQuestion}". Please transcribe.` },
              ])

              const responseText = await result.response.text()
              setResult(responseText)

              const expectedAnswerResult = await model.generateContent([
                { text: `Provide a brief answer for: "${userQuestion}"` },
              ])
              const expectedAnswer = await expectedAnswerResult.response.text()

              const similarityResult = await model.generateContent([
                {
                  text: `Compare the user's response and the expected answer. 
                  Give a relevance score from 0 to 100%. And please check it logically.
                  User response: "${responseText}". 
                  Expected answer: "${expectedAnswer}". 
                  Provide only the percentage as output.`,
                },
              ])

              const relevancyScore = await similarityResult.response.text()
              setRelevancy(Number.parseFloat(relevancyScore))
            }
          }
        } catch (error) {
          console.error("Error processing video:", error)
        } finally {
          setProcessing(false)
          setLocalProcessing(false)
        }
      }
    }
    sendVideo()
  }, [mediaBlobUrl, username, email, userId, interviewQuestion, setProcessing])

  const startPreview = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setStream(mediaStream)
      setShowPreview(true)
    } catch (err: unknown) {
      console.error("Error accessing camera:", err)
      if (err && typeof err === "object" && "name" in err) {
        const errorName = (err as { name: string }).name
        if (errorName === "NotAllowedError") {
          alert("Please allow camera and microphone access in your browser settings.")
        } else if (errorName === "NotFoundError") {
          alert("No camera or microphone found. Please check your device connections.")
        } else {
          alert("Failed to start camera preview. Please check your camera and microphone.")
        }
      } else {
        alert("Failed to start camera preview. Please check your camera and microphone.")
      }
    }
  }

  // Add this useEffect to handle assigning the stream to the video element
  useEffect(() => {
    if (showPreview && videoPreviewRef.current && stream) {
      videoPreviewRef.current.srcObject = stream
      videoPreviewRef.current.play()
    }
  }, [showPreview, stream])

  const stopPreview = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null
    }
    setShowPreview(false)
  }

  const handleStartRecording = () => {
    if (!showPreview) {
      startPreview()
    }
    startRecording()
  }

  const handleStopRecording = () => {
    stopRecording()
    stopPreview()
    stopCountdown()

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }
    const timeout = setTimeout(() => {
      setRecordingStopped(true)
    }, 5000)
    setDebounceTimeout(timeout)
  }

  const handleNewRecording = () => {
    clearBlobUrl()
    stopPreview()
    setResult(null)
    setRelevancy(null)
    setCountdown(20)
    setRecordingStopped(false)
    getNextQuestion() // <-- Move to next question
  }

  useEffect(() => {
    return () => {
      stopCountdown()
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [stream, debounceTimeout])

  const getRelevancyColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getRelevancyLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    return "Needs Improvement"
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Recording Status Header */}
      {isRecording && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 font-semibold">Recording in Progress</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-red-500">{countdown}s</span>
                <Progress value={(countdown / 20) * 100} className="w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Display Area */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span>Video Recording</span>
            <div className="flex items-center space-x-2">
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  <Mic className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
              {showPreview && !isRecording && (
                <Badge variant="secondary">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-gray-900 overflow-hidden">
            {/* Preview Video */}
            {showPreview && !mediaBlobUrl && (
              <video ref={videoPreviewRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}

            {/* Recorded Video */}
            {mediaBlobUrl && <video src={mediaBlobUrl} controls className="w-full h-full object-cover" />}

            {/* Empty State */}
            {!showPreview && !mediaBlobUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto" />
                  <p className="text-gray-400 text-lg">Camera preview will appear here</p>
                </div>
              </div>
            )}

          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {!isRecording && !mediaBlobUrl && !showPreview && (
              <Button onClick={startPreview} variant="outline" size="lg" className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Preview Camera</span>
              </Button>
            )}

            {/* Stop Preview Button */}
            {!isRecording && !mediaBlobUrl && showPreview && (
              <Button
                onClick={stopPreview}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 bg-red-600 text-white hover:bg-red-600 hover:text-white"
              >
                <Square className="w-5 h-5" />
                <span>Stop Preview</span>
              </Button>
            )}

            {!isRecording && (showPreview || !mediaBlobUrl) && (
              <Button
                onClick={handleStartRecording}
                size="lg"
                disabled={processing}
                className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Start Recording</span>
              </Button>
            )}

            {isRecording && (
              <Button
                onClick={handleStopRecording}
                variant="destructive"
                size="lg"
                className="flex items-center space-x-2"
              >
                <Square className="w-5 h-5" />
                <span>Stop Recording</span>
              </Button>
            )}

            {mediaBlobUrl && (
              <Button
                onClick={handleNewRecording}
                disabled={processing}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>New Recording</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {(result || relevancy !== null) && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Transcription Result */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="w-5 h-5" />
                  <span>Transcription</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{result}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Relevancy Score */}
          {relevancy !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Relevancy Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{relevancy.toFixed(1)}%</div>
                  <Badge className={`${getRelevancyColor(relevancy)} text-white`}>{getRelevancyLabel(relevancy)}</Badge>
                </div>
                <Progress value={relevancy} className="h-3" />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Video Frames Analysis */}
      {userId && mediaBlobUrl && (
        <VideoFrames
          userId={userId}
          recordingStopped={true}
          question={interviewQuestion}
          relevancy={relevancy}
        />
      )}
    </div>
  )
}

export default VideoRecorder
