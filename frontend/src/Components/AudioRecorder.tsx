import { useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Adjust the import path as needed
import { supabase } from "@/Client";
import { useReactMediaRecorder } from "react-media-recorder";
import { Camera, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import VideoFrames from "./VideoFrames";

interface VideoRecorderProps {
  username: string;
  email: string;
  userId: string;
  interviewQuestion: string;
  setProcessing: (value: boolean) => void; // New prop to set processing state
}

const VideoRecorder = ({ username, email, userId, interviewQuestion, setProcessing }: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [relevancy, setRelevancy] = useState<number | null>(null);
  const [recordingStopped, setRecordingStopped] = useState(false);
  const [processing, setLocalProcessing] = useState(false);
  const [countdown, setCountdown] = useState(20); // Countdown timer state
  const countdownRef = useRef<NodeJS.Timeout | null>(null); // Ref to manage the timer
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const { startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      video: true,
      onStart: () => {
        setIsRecording(true);
        startCountdown(); // Start the countdown when recording begins
      },
      onStop: () => {
        setIsRecording(false);
        stopCountdown(); // Stop the countdown when recording stops
        setRecordingStopped(true);
      },
    });

  const startCountdown = () => {
    setCountdown(20); // Reset the countdown to 20 seconds
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopRecording(); // Stop recording when the timer reaches 0
          stopCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  useEffect(() => {
    async function sendVideo() {
      if (mediaBlobUrl) {
        setProcessing(true); // Set processing to true when video analysis starts
        setLocalProcessing(true); // Set processing to true when video analysis starts
        try {
          const response = await fetch(mediaBlobUrl);
          const blob = await response.blob();
          const randomNum = Math.floor(Math.random() * 10000);
          const fileName = `${username}_${randomNum}.mp4`;

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
              const userQuestion = interviewQuestion;

              // Generate content with the user's audio response
              const result = await model.generateContent([
                {
                  inlineData: {
                    mimeType: "audio/mp3",
                    data: base64AudioFile,
                  },
                },
                { text: `The user was asked: "${userQuestion}". Please transcribe.` },
              ]);

              // Process AI response
              const responseText = await result.response.text();
              setResult(responseText);

              // Generate expected answer using the model
              const expectedAnswerResult = await model.generateContent([
                { text: `Provide a brief answer for: "${userQuestion}"` },
              ]);
              const expectedAnswer = await expectedAnswerResult.response.text();
                console.log("Expected Answer:", expectedAnswer);

              // Check relevancy
              const similarityResult = await model.generateContent([
                {
                  text: `Compare the user's response and the expected answer. 
                  Give a relevance score from 0 to 100%. And please check it logically.
                  User response: "${responseText}". 
                  Expected answer: "${expectedAnswer}". 
                  Provide only the percentage as output.`,
                },
              ]);

              const relevancyScore = await similarityResult.response.text();
                console.log("Relevancy Score:", relevancyScore);

              setRelevancy(parseFloat(relevancyScore));
            }
          }
        } catch (error) {
          console.error("Error processing video:", error);
        } finally {
          setProcessing(false); // Set processing to false when video analysis is complete
          setLocalProcessing(false); // Set processing to false when video analysis is complete
        }
      }
    }
    sendVideo();
  }, [mediaBlobUrl, username, email, userId, interviewQuestion, setProcessing]);

  const startPreview = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
console.log("MediaStream received:", mediaStream); // Debugging log
      console.log("Video Preview Ref:", videoPreviewRef.current); // Debugging log

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
        videoPreviewRef.current.play();
        setStream(mediaStream);
      }
      setShowPreview(true);
// stopPreview();
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
    stopCountdown(); // Stop the countdown manually if recording is stopped early

    // Add debounce to delay frame extraction
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timeout = setTimeout(() => {
      setRecordingStopped(true);
    }, 5000); // Adjust the delay as needed
    setDebounceTimeout(timeout);
  };

  const handleNewRecording = () => {
    clearBlobUrl();
    stopPreview();
    setResult(null);
    setRelevancy(null);
    setRecordingStopped(false);
    setCountdown(20); // Reset the countdown for a new recording
  };

  useEffect(() => {
    if (showPreview) {
      startPreview();
    }
  }, [showPreview]);

  useEffect(() => {
    return () => {
      stopCountdown(); // Cleanup the timer on component unmount
    };
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-6 h-6  text-purple-400" />
          <span className="text-white">Video Recorder</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timer Display */}
          {isRecording && (
            <div className="text-center text-lg font-bold text-red-500">
              Recording ends in: {countdown}s
            </div>
          )}

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

            {/* Frames getting displayed which are extracted. */}
            {userId && recordingStopped && (
              <VideoFrames
                userId={userId}
                recordingStopped={recordingStopped}
                question={interviewQuestion}
                relevancy={relevancy}
              />
            )}

            {isRecording && (
              <button onClick={handleStopRecording} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                Stop Recording
              </button>
            )}
            {mediaBlobUrl && (
              <button
                onClick={handleNewRecording}
                disabled={processing}
                className={`bg-green-500 text-white px-4 py-2 rounded-lg ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
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