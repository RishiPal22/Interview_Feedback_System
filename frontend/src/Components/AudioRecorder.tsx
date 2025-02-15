import { supabase } from "@/Client";
import { useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

interface AudioRecorderProps {
  username: string;
  email: string;
  userId: string;
}

const AudioRecorder = ({ username, email, userId }: AudioRecorderProps) => {
  const { startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true });

  useEffect(() => {
    async function sendVideo() {
      if (mediaBlobUrl) {
        try {
          const response = await fetch(mediaBlobUrl);
          const blob = await response.blob();
          const randomNum = Math.floor(Math.random() * 10000);
          const fileName = `${username}_${randomNum}.mp4`;
          const { data, error } = await supabase.storage.from("videosstore").upload(fileName, blob);
          if (error) {
            console.error("Error uploading new video:", error.message);
          } else {
            const videoUrl = data.path;
            await supabase.from("videos").insert({
              user_id: userId,
              username,
              email,
              video_url: videoUrl,
            });
          }
        } catch (error) {
          console.error("Error fetching video blob:", error);
        }
      }
    }
    sendVideo();
  }, [mediaBlobUrl, username, email, userId]);

  return (
    <div>
      <h2>Video Recorder</h2>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={startRecording}> Start Recording</button><br />
      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={stopRecording}> Stop Recording</button>

      {mediaBlobUrl && (
        <video src={mediaBlobUrl} controls />
      )}
    </div>
  );
};

export default AudioRecorder;
