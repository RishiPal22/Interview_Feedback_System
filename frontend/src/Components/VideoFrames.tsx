import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const FASTAPI_URL = "http://127.0.0.1:8000/process-video"; 

interface VideoFramesProps {
  userId: string; // The ID of the logged-in user
  recordingStopped: boolean; // New prop to indicate if recording has stopped
}

const VideoFrames = ({ userId, recordingStopped }: VideoFramesProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("videos")
        .select("video_url")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1); // Ensure only one row is returned

      if (error) {
        console.error("Error fetching video URL:", error.message);
        return;
      }

      if (data && data.length > 0) {
        setVideoUrl(data[0].video_url);
      } else {
        console.error("No video URL found for the user.");
      }
    };

    fetchVideoUrl();

    // **Subscribe to changes in the "videos" table**
    const subscription = supabase
      .channel("video_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "videos", filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log("New video added:", payload);
          fetchVideoUrl(); // Fetch the new video URL when a new video is uploaded
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]); // ✅ Runs when `userId` changes

  useEffect(() => {
    const fetchFrames = async () => {
      if (!videoUrl || !recordingStopped) return; // Fetch frames only if recording has stopped
      setLoading(true);

      try {
        const response = await fetch(FASTAPI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_url: videoUrl }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch frames");
        }

        const data = await response.json();
        setExtractedFrames(data.frames);
        console.log("Extracted frames:", data);
      } catch (error) {
        console.error("Error fetching frames:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFrames();
  }, [videoUrl, recordingStopped]); // ✅ Runs whenever `videoUrl` or `recordingStopped` updates

  return (
    <div>
      {loading && <p>Processing video...</p>}
      {extractedFrames.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 mt-4">
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


