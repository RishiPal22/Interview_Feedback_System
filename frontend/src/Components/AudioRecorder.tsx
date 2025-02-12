import { useReactMediaRecorder } from "react-media-recorder";

const AudioRecorder = () => {
  const { startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ video: true });

  return (
    <div>
      <h2>Audio Recorder</h2>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
       onClick={startRecording}> Start Recording</button><br/>
      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
       onClick={stopRecording}> Stop Recording</button>

      {mediaBlobUrl && (
        <video src={mediaBlobUrl} controls />
      )}
    </div>
  );
};

export default AudioRecorder;
