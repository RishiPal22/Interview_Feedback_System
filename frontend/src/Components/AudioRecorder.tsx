import { useEffect, useRef, useState } from "react";
import { supabase } from "@/Client";
import { useReactMediaRecorder } from "react-media-recorder";
import { Camera, StopCircle, Disc, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface VideoRecorderProps {
  username: string;
  email: string;
  userId: string;
}

const VideoRecorder = ({ username, email, userId }: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [relevancy, setRelevancy] = useState<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const { startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      onStart: () => setIsRecording(true),
      onStop: () => setIsRecording(false),
    });

  useEffect(() => {
    async function sendVideo() {
      if (mediaBlobUrl) {
        try {
          const response = await fetch(mediaBlobUrl);
          const blob = await response.blob();
          const randomNum = Math.floor(Math.random() * 10000);
          const fileName = `${username}_${randomNum}.mp3`;

          const { data, error } = await supabase.storage
            .from("videosstore")
            .upload(fileName, blob);

          if (error) {
            console.error("Error uploading video:", error.message);
          } else {
            const videoUrl = data.path;
            await supabase.from("videos").insert({
              user_id: userId,
              username,
              email,
              video_url: videoUrl,
            });

            const { data: fileData, error: fileError } = await supabase.storage
              .from("videosstore")
              .download(videoUrl);

            if (fileError) {
              console.error("Error downloading video:", fileError.message);
            } else {
              const base64Buffer = await fileData.arrayBuffer();
              const base64AudioFile = btoa(
                new Uint8Array(base64Buffer).reduce(
                  (data, byte) => data + String.fromCharCode(byte),
                  ""
                )
              );

              // Initialize Gemini AI
              const apiKey = import.meta.env.VITE_API_KEY;
              if (!apiKey) {
                throw new Error(
                  "API_KEY is not defined in the environment variables"
                );
              }
              const genAI = new GoogleGenerativeAI(apiKey);
              const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
              });

              // Define the user's question
              const userQuestion = "What is the capital of France?";

              // Generate content with the user's audio response
              const result = await model.generateContent([
                {
                  inlineData: {
                    mimeType: "audio/mp3",
                    data: base64AudioFile,
                  },
                },
                { text: `The user was asked: "${userQuestion}". Please transcribe and analyze their response.` },
              ]);

              // Process AI response
              const responseText = await result.response.text();
              setResult(responseText);

              // Check relevancy
              const expectedAnswer = "Paris";
              let relevancyScore = 0;

              if (responseText.includes(expectedAnswer)) {
                relevancyScore = 100; // Correct answer
              } else if (responseText.toLowerCase().includes("france")) {
                relevancyScore = 50; // Partially relevant
              } else {
                relevancyScore = 0; // Completely irrelevant
              }

              setRelevancy(relevancyScore);
            }
          }
        } catch (error) {
          console.error("Error processing video:", error);
        }
      }
    }
    sendVideo();
  }, [mediaBlobUrl, username, email, userId]);

  const startPreview = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
      setShowPreview(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopPreview = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowPreview(false);
  };

  const handleStartRecording = () => {
    if (!showPreview) {
      startPreview();
    }
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    stopPreview();
  };

  const handleNewRecording = () => {
    clearBlobUrl();
    stopPreview();
    setResult(null);
    setRelevancy(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-6 h-6" />
          <span>Video Recorder</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Preview Window */}
          {showPreview && !mediaBlobUrl && (
            <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Recorded Video Playback */}
          {mediaBlobUrl && (
            <div className="rounded-lg overflow-hidden bg-gray-900 aspect-video">
              <video src={mediaBlobUrl} controls className="w-full h-full object-cover" />
            </div>
          )}

          {/* Display Result */}
          {result && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-lg font-bold">Transcription Result:</h2>
              <p>{result}</p>
            </div>
          )}

          {/* Display Relevancy Percentage */}
          {relevancy !== null && (
            <div className="bg-gray-200 p-4 rounded-lg text-center">
              <h2 className="text-lg font-bold">Relevancy Score:</h2>
              <p className="text-xl font-semibold">{relevancy}%</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4 justify-center flex-wrap">
            {!isRecording && !mediaBlobUrl && !showPreview && (
              <button onClick={startPreview} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                <Eye className="w-5 h-5" /> Preview Camera
              </button>
            )}

            {!isRecording && !mediaBlobUrl && (
              <button onClick={handleStartRecording} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                Start Recording
              </button>
            )}

            {isRecording && (
              <button onClick={handleStopRecording} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                Stop Recording
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoRecorder;
