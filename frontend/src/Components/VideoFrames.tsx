import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const FASTAPI_URL = "http://127.0.0.1:8000/process-video";

interface VideoFramesProps {
  userId: string;
  recordingStopped: boolean;
  question: string; // Add question as a prop
  relevancy: number | null;
  
}

const VideoFrames = ({ userId, recordingStopped, question, relevancy }: VideoFramesProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [averageConfidence, setAverageConfidence] = useState<number | null>(null);

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!userId) return;

      // Delay fetching to ensure the new video is available in Supabase
      setTimeout(async () => {
        const { data, error } = await supabase
          .from("videos")
          .select("id, video_url")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }) // Get the latest video
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching video URL:", error.message);
          return;
        }

        if (data && data.video_url) {
          const fullVideoUrl = `https://ezxqwbvzmieuieumdkca.supabase.co/storage/v1/object/public/videosstore/${data.video_url}`;
          setVideoUrl(fullVideoUrl);
          console.log("New Video URL fetched:", fullVideoUrl);
        } else {
          console.error("No video URL found for the user.");
        }
      }, 2000); // Delay by 2 seconds
    };

    if (recordingStopped) {
      fetchVideoUrl();
    }
  }, [userId, recordingStopped]);

  useEffect(() => {
    const fetchFrames = async () => {
      if (!videoUrl || !recordingStopped) return;
      setLoading(true);

      try {
        const response = await fetch(FASTAPI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            video_url: videoUrl,
            relevancy_score: relevancy, // Pass relevancy_score to the backend
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch frames");
        }

        const data = await response.json();
        setExtractedFrames(data.frames);
        setAverageConfidence(data.average_confidence_percentage);

        console.log("Extracted frames:", data);

        // Update the database with confidence, relevancy, and question
        const { error: updateError } = await supabase
          .from("videos")
          .update({
            confidence_percentage: data.average_confidence_percentage,
            relevancy_score: data.relevancy_score, // Ensure relevancy_score is passed here
            question: question, // Insert the question into the database
          })
          .eq("video_url", videoUrl.split("/").pop()); // Match the video by its URL

        if (updateError) {
          console.error("Error updating video record:", updateError.message);
        } else {
          console.log("Video record updated successfully.");
        }
      } catch (error) {
        console.error("Error fetching frames:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFrames();
  }, [videoUrl, recordingStopped, question, relevancy]);

  return (
    <div>
      {loading && <p>Processing video...</p>}
      {extractedFrames.length > 0 ? (
        <div className="flex flex-col items-center justify-center mt-4">
          <div className="grid grid-cols-2 gap-2 mt-4">
            <h3 className="bg-gray-200 p-4 rounded-lg text-center">
              Average Confidence: {averageConfidence ? `${averageConfidence.toFixed(2)}%` : "Calculating..."}
            </h3>
          </div>
          {extractedFrames.map((frame, index) => (
            <img key={index} src={frame} alt={`Frame ${index}`} className="rounded-lg shadow" />
          ))}
        </div>
      ) : (
        <p>No frames extracted yet.</p>
      )}
    </div>
  );
};

export default VideoFrames;



