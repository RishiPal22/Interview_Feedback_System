"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Play, ImageIcon, TrendingUp, Target, Clock, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { Progress } from "@/Components/ui/progress"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const FASTAPI_URL = "http://127.0.0.1:8000/process-video"

interface VideoFramesProps {
  userId: string
  recordingStopped: boolean
  question: string
  relevancy: number | null
}

const VideoFrames = ({ userId, recordingStopped, question, relevancy }: VideoFramesProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [extractedFrames, setExtractedFrames] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [averageConfidence, setAverageConfidence] = useState<number | null>(null)
  const [processingStage, setProcessingStage] = useState<string>("")

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!userId) return

      setProcessingStage("Fetching video from storage...")

      setTimeout(async () => {
        const { data, error } = await supabase
          .from("videos")
          .select("id, video_url")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.error("Error fetching video URL:", error.message)
          setProcessingStage("Error fetching video")
          return
        }

        if (data && data.video_url) {
          const fullVideoUrl = `https://ezxqwbvzmieuieumdkca.supabase.co/storage/v1/object/public/videosstore/${data.video_url}`
          setVideoUrl(fullVideoUrl)
          setProcessingStage("Video retrieved successfully")
        } else {
          setProcessingStage("No video found")
        }
      }, 2000)
    }

    if (recordingStopped) {
      fetchVideoUrl()
    }
  }, [userId, recordingStopped])

  useEffect(() => {
    const fetchFrames = async () => {
      if (!videoUrl || !recordingStopped) return
      setLoading(true)
      setProcessingStage("Analyzing video content...")

      try {
        const response = await fetch(FASTAPI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            video_url: videoUrl,
            relevancy_score: relevancy,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch frames")
        }

        setProcessingStage("Extracting key frames...")
        const data = await response.json()
        setExtractedFrames(data.frames)
        setAverageConfidence(data.average_confidence_percentage)
        setProcessingStage("Analysis complete")

        const { error: updateError } = await supabase
          .from("videos")
          .update({
            confidence_percentage: data.average_confidence_percentage,
            relevancy_score: data.relevancy_score,
            question: question,
          })
          .eq("video_url", videoUrl.split("/").pop())

        if (updateError) {
          console.error("Error updating video record:", updateError.message)
        }
      } catch (error) {
        console.error("Error fetching frames:", error)
        setProcessingStage("Analysis failed")
      } finally {
        setLoading(false)
      }
    }

    fetchFrames()
  }, [videoUrl, recordingStopped, question, relevancy])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200"
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Video Analysis Results</h2>
        <p className="text-muted-foreground">AI-powered frame extraction and confidence analysis</p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold">Processing Your Video</h3>
                <p className="text-blue-600 font-medium">{processingStage}</p>
                <Progress value={75} className="w-64" />
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Analyzing frames</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Calculating confidence</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {extractedFrames.length > 0 && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confidence Score Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Confidence Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {averageConfidence !== null && (
                  <>
                    <div className="flex items-end space-x-2">
                      <span className="text-4xl font-bold">{averageConfidence.toFixed(1)}</span>
                      <span className="text-xl text-muted-foreground mb-1">%</span>
                    </div>
                    <Progress value={averageConfidence} className="h-3" />
                    <Badge className={getScoreColor(averageConfidence)}>
                      {averageConfidence >= 80 ? "Excellent" : averageConfidence >= 60 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Frames Count Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Extracted Frames</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end space-x-2">
                  <span className="text-4xl font-bold">{extractedFrames.length}</span>
                  <span className="text-xl text-muted-foreground mb-1">frames</span>
                </div>
                <p className="text-sm text-muted-foreground">Key moments captured from your interview session</p>
                <Badge variant="secondary">Analysis Complete</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Frames Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Key Frame Analysis</span>
                <Badge variant="outline">{extractedFrames.length} frames extracted</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {extractedFrames.map((frame, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-100 rounded-lg overflow-hidden border hover:border-blue-300 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={frame || "/placeholder.svg?height=120&width=160"}
                        alt={`Frame ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="p-2 bg-white/90 backdrop-blur-sm rounded-full">
                            <Play className="w-4 h-4 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Frame Number */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!loading && extractedFrames.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No Frames Extracted Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Complete your video recording to see AI-powered frame extraction and analysis results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default VideoFrames
