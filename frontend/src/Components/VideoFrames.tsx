// import { useEffect, useRef, useState } from "react";

// interface VideoFramesProps {
//   mediaBlobUrl: string | null;
// }

// const VideoFrames = ({ mediaBlobUrl }: VideoFramesProps) => {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [extractedFrames, setExtractedFrames] = useState<string[]>([]);

//   useEffect(() => {
//     if (mediaBlobUrl && videoRef.current && canvasRef.current) {
//       const video = videoRef.current;
//       video.src = mediaBlobUrl;
//       video.play();

//       const canvas = canvasRef.current;
//       const context = canvas.getContext("2d");

//       const extractFrames = () => {
//         if (!video.duration) return;

//         // Generate two unique random times within the current 10-second window
//         const time1 = Math.random() * Math.min(10, video.duration - 1);
//         let time2;

//         do {
//           time2 = Math.random() * Math.min(10, video.duration - 1);
//         } while (Math.abs(time1 - time2) < 0.5); // Ensure frames are at least 0.5s apart

//         // Clear previous frames before extracting new ones
//         setExtractedFrames([]);

//         [time1, time2].forEach((time) => {
//           setTimeout(() => {
//             video.currentTime = time;
//             video.onseeked = () => {
//               if (context) {
//                 context.drawImage(video, 0, 0, canvas.width, canvas.height);
//                 const frameData = canvas.toDataURL("image/png");

//                 setExtractedFrames((prevFrames) => {
//                   if (prevFrames.length < 2) {
//                     return [...prevFrames, frameData]; // Ensure only two frames are stored
//                   }
//                   return prevFrames;
//                 });
//               }
//             };
//           }, time * 1000);
//         });
//       };

//       const interval = setInterval(extractFrames, 10000);

//       return () => clearInterval(interval);
//     }
//   }, [mediaBlobUrl]);

//   return (
//     <div>
//       <video ref={videoRef} className="hidden" />
//       <canvas ref={canvasRef} width={640} height={360} className="hidden" />
//       <div className="grid grid-cols-2 gap-2 mt-4">
//         {extractedFrames.map((frame, index) => (
//           <img key={index} src={frame} alt={`Extracted Frame ${index}`} className="rounded-lg shadow" />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default VideoFrames;


import { useEffect, useState } from "react";

interface VideoFramesProps {
  mediaBlobUrl: string | null;
}

const VideoFrames = ({ mediaBlobUrl }: VideoFramesProps) => {
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const FASTAPI_URL = "http://127.0.0.1:8000/process-video"; // Change if deployed

  useEffect(() => {
    const fetchFrames = async () => {
      if (!mediaBlobUrl) return;
      setLoading(true);
      
      try {
        // Extract file name from URL
        const videoFileName = mediaBlobUrl.split("/").pop();
        console.log(videoFileName);
        // const videoFileName = 'https://ezxqwbvzmieuieumdkca.supabase.co/storage/v1/object/public/videosstore//RishiPal23_6575.mp4'
        ;

        // Send request to FastAPI
        const response = await fetch(FASTAPI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_url: videoFileName }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch frames");
        }

        const data = await response.json();
        setExtractedFrames(data.frames); // Store frame URLs from API response
      } catch (error) {
        console.error("Error fetching frames:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFrames();
  }, [mediaBlobUrl]);

  return (
    <div>
      {loading ? <p>Processing video and extracting frames...</p> : null}

      <div className="grid grid-cols-2 gap-2 mt-4">
        {extractedFrames && extractedFrames.map((frame, index) => (
          <img
            key={index}
            src={frame}
            alt={`Extracted Frame ${index}`}
            className="rounded-lg shadow"
          />
        ))}
      </div>
    </div>
  );
};

export default VideoFrames;

