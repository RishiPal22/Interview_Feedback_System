"use client";

import { useEffect, useState } from "react";
import { supabase } from "../Client";
import AudioRecorder from "../Components/AudioRecorder";
import { User, Mail, Loader2, MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../Components/ui/avatar";
import { Button } from "../Components/ui/button";
import { Separator } from "../Components/ui/separator";

function Interview() {
  const [userData, setUserData] = useState({ username: "", email: "", userId: "" });
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false); // New state for processing

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const { user } = session;
          setUserData({
            username: user.user_metadata.username || "",
            email: user.email || "",
            userId: user.id || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch("/questions.json");
        const data = await response.json();
        setAvailableQuestions(data.map((q: { question: string }) => q.question));
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    }
    fetchQuestions();
  }, []);

  const getNextQuestion = () => {
    if (availableQuestions.length === 0) {
      setQuestion("No more questions available.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const nextQuestion = availableQuestions[randomIndex];

    // Remove the selected question from available questions
    setAvailableQuestions(availableQuestions.filter((_, i) => i !== randomIndex));
    setQuestion(nextQuestion);
  };

  const getInitials = (name: string): string => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="bg-[#121212] min-h-screen text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-gradient-to-r from-purple-600 to-purple-400 text-transparent bg-clip-text">
            <h1 className="text-4xl font-bold mb-3">Interview Session</h1>
          </div>
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
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full blur opacity-70"></div>
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

            {/* Audio Recorder Card */}
            <Card className="bg-[#1E1E1E] border-[#333] shadow-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  {/* Buttons Container */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        if (!showQuestion && question === "") getNextQuestion(); // Only fetch a new question if it's empty
                        setShowQuestion(!showQuestion);
                      }}
                      disabled={processing} // Disable button while processing
                      className={`bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 ${processing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      <MessageSquare className="h-5 w-5" />
                      {showQuestion ? "Hide Question" : "Show Question"}
                    </Button>

                    {showQuestion && (
                      <Button
                        disabled={processing} // Disable button while processing
                        onClick={getNextQuestion}
                        className={`bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
                          processing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <MessageSquare className="h-5 w-5" />
                        Next Question
                      </Button>
                    )}
                  </div>

                  {/* Question Text Below Buttons */}
                  {showQuestion && (
                    <div className="mt-4 bg-[#252525] px-5 py-3 rounded-lg shadow-md border border-purple-500 animate-fade-in text-center">
                      <p className="text-lg text-purple-300 font-semibold">{question}</p>
                    </div>
                  )}
                </div>


                {/* Audio Recorder */}
                <div className="mt-6 bg-[#252525] p-5 rounded-lg">
                  {userData.username ? (
                    <AudioRecorder username={userData.username} email={userData.email} userId={userData.userId} interviewQuestion={question} setProcessing={setProcessing} />
                  ) : (
                    <div className="text-center py-12 bg-[#252525] rounded-lg">
                      <p className="text-purple-200 mb-4">Please complete your profile to access the recorder</p>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white border-none">Update Profile</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Separator className="my-10 bg-[#333]" />
      </div>
    </div>
  );
}

export default Interview;
