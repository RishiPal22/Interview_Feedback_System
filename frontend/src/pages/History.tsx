import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface VideoData {
  id: string;
  question: string;
  relevancy_score: number | null;
  confidence_percentage: number | null;
  created_at: string;
}

function History() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);

      // Fetch the logged-in user's ID from Supabase auth
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error fetching user:", userError?.message);
        setLoading(false);
        return;
      }

      // Query the videos table for the logged-in user's data
      const { data, error } = await supabase
        .from("videos")
        .select("id, question, relevancy_score, confidence_percentage, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error.message);
      } else {
        setVideos(data || []);
      }

      setLoading(false);
    };

    fetchVideos();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      {loading ? (
        <p>Loading...</p>
      ) : videos.length > 0 ? (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Question</th>
              <th className="border border-gray-300 px-4 py-2">Relevancy Score</th>
              <th className="border border-gray-300 px-4 py-2">Confidence (%)</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(video.created_at).toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">{video.question || "N/A"}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {video.relevancy_score !== null ? `${video.relevancy_score}%` : "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {video.confidence_percentage !== null ? `${video.confidence_percentage}%` : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No history available.</p>
      )}
    </div>
  );
}

export default History;