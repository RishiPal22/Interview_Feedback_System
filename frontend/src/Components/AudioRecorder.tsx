import { useEffect, useRef, useState } from 'react';
import { supabase } from "@/Client";
import { useReactMediaRecorder } from "react-media-recorder";
import { Camera, StopCircle, Disc, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { GoogleGenerativeAI } from '@google/generative-ai';

interface VideoRecorderProps {
  username: string;
  email: string;
  userId: string;
}

const VideoRecorder = ({ username, email, userId }: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const { startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = 
    useReactMediaRecorder({
      audio: true,
      // video: true,
      onStart: () => setIsRecording(true),
      onStop: () => setIsRecording(false)
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

            // Fetch the file from Supabase and convert it to base64
            const { data: fileData, error: fileError } = await supabase
              .storage
              .from("videosstore")
              .download(videoUrl);

            if (fileError) {
              console.error("Error downloading video:", fileError.message);
            } else {
              const base64Buffer = await fileData.arrayBuffer();
              const base64AudioFile = btoa(
                new Uint8Array(base64Buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
              );

              // Initialize a Gemini model appropriate for your use case.
              const apiKey = import.meta.env.VITE_API_KEY;
              if (!apiKey) {
                throw new Error('API_KEY is not defined in the environment variables');
              }
              const genAI = new GoogleGenerativeAI(apiKey);
              const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
              });

              // Generate content using a prompt and the metadata of the uploaded file.
              const result = await model.generateContent([
                {
                  inlineData: {
                    mimeType: "audio/mp3",
                    data: base64AudioFile
                  }
                },
                { text: "Please summarize the audio." },
              ]);

              // Print the response.
              const responseText = await result.response.text();
              setResult(responseText);
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
        audio: true 
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
      stream.getTracks().forEach(track => track.stop());
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
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full text-white">
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  <span className="text-sm">Recording</span>
                </div>
              )}
            </div>
          )}

          {/* Recorded Video Playback */}
          {mediaBlobUrl && (
            <div className="rounded-lg overflow-hidden bg-gray-900 aspect-video">
              <video
                src={mediaBlobUrl}
                controls
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Display Result */}
          {result && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-lg font-bold">Transcription Result:</h2>
              <p>{result}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4 justify-center flex-wrap">
            {!isRecording && !mediaBlobUrl && !showPreview && (
              <button
                onClick={startPreview}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5" />
                Preview Camera
              </button>
            )}

            {showPreview && !isRecording && (
              <button
                onClick={stopPreview}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <EyeOff className="w-5 h-5" />
                Stop Preview
              </button>
            )}

            {!isRecording && !mediaBlobUrl && (
              <button
                onClick={handleStartRecording}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Disc className="w-5 h-5" />
                Start Recording
              </button>
            )}

            {isRecording && (
              <button
                onClick={handleStopRecording}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <StopCircle className="w-5 h-5" />
                Stop Recording
              </button>
            )}

            {mediaBlobUrl && (
              <button
                onClick={handleNewRecording}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Camera className="w-5 h-5" />
                New Recording
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoRecorder;