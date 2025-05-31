"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Play, CheckCircle, AlertCircle, ImageIcon, TrendingUp, Target, Clock, Zap } from "lucide-react"

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

      // Delay fetching to ensure the new video is available in Supabase
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
          console.log("New Video URL fetched:", fullVideoUrl)
        } else {
          console.error("No video URL found for the user.")
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

        console.log("Extracted frames:", data)

        // Update the database with confidence, relevancy, and question
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
        } else {
          console.log("Video record updated successfully.")
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
    if (score >= 80) return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30"
    if (score >= 60) return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
    return "text-red-400 bg-red-500/20 border-red-500/30"
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Video Analysis Results
        </h2>
        <p className="text-gray-400">AI-powered frame extraction and confidence analysis</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin border-t-purple-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold text-white">Processing Your Video</h3>
              <p className="text-purple-300 font-medium">{processingStage}</p>

              {/* Animated progress bar */}
              <div className="w-80 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-400">
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
        </div>
      )}

      {/* Results Section */}
      {extractedFrames.length > 0 && (
        <div className="space-y-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Confidence Score Card */}
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur rounded-xl p-8 border border-gray-700/50 shadow-2xl transition-all duration-300 hover:shadow-purple-500/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl backdrop-blur">
                    <TrendingUp className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Confidence Score</h3>
                </div>
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>

              {averageConfidence !== null && (
                <div className="space-y-6">
                  <div className="flex items-end space-x-3">
                    <span className="text-5xl font-bold text-white tracking-tight">{averageConfidence.toFixed(1)}</span>
                    <span className="text-2xl text-gray-400 mb-1">%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur">
                    <div
                      className={`h-full ${getProgressColor(averageConfidence)} transition-all duration-1000 ease-out rounded-full shadow-lg`}
                      style={{ width: `${averageConfidence}%` }}
                    ></div>
                  </div>

                  <div className={`inline-flex px-4 py-2 rounded-lg text-sm font-medium border backdrop-blur-sm ${getScoreColor(averageConfidence)}`}>
                    {averageConfidence >= 80 ? "Excellent" : averageConfidence >= 60 ? "Good" : "Needs Improvement"}
                  </div>
                </div>
              )}
            </div>

            {/* Frames Gallery */}
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur rounded-xl p-8 border border-gray-700/50 shadow-2xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-pink-500/10 rounded-xl backdrop-blur">
                  <ImageIcon className="w-7 h-7 text-pink-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">Extracted Frames</h3>
                  <p className="text-gray-400 text-sm">AI-powered key moments from your interview</p>
                </div>
                <span className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg text-sm font-medium backdrop-blur">
                  {extractedFrames.length} frames
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {extractedFrames.map((frame, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={frame || "/placeholder.svg"}
                        alt={`Frame ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-medium tracking-wide">Frame {index + 1}</span>
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && extractedFrames.length === 0 && (
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur rounded-xl p-12 border border-gray-700/50 shadow-2xl text-center transition-all duration-300 hover:shadow-purple-500/10">
          <div className="space-y-6">
            <div className="w-24 h-24 mx-auto bg-gray-700/50 rounded-2xl flex items-center justify-center backdrop-blur">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">No Frames Extracted Yet</h3>
              <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                Start recording your video to see AI-powered frame extraction and analysis results here.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoFrames
