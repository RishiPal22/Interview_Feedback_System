import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const FASTAPI_URL = "http://127.0.0.1:8000/process-video";

interface VideoFramesProps {
  userId: string;
  recordingStopped: boolean;
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
        .limit(1)
        .single(); // Fetch only one record

      if (error) {
        console.error("Error fetching video URL:", error.message);
        return;
      }

      if (data && data.video_url) {
        // Construct the full Supabase storage URL
        const fullVideoUrl = `https://ezxqwbvzmieuieumdkca.supabase.co/storage/v1/object/public/videosstore/${data.video_url}`;
        setVideoUrl(fullVideoUrl);
        console.log("Video URL fetched:", fullVideoUrl);
      } else {
        console.error("No video URL found for the user.");
      }
    };

    fetchVideoUrl();

    const subscription = supabase
      .channel("video_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "videos", filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log("New video added:", payload);
          fetchVideoUrl();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  useEffect(() => {
    const fetchFrames = async () => {
      if (!videoUrl || !recordingStopped) return;
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
  }, [videoUrl, recordingStopped]);

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


