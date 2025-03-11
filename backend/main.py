import cv2
import random
import os
from supabase import create_client
from fastapi import FastAPI, Body
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Ensure this is correctly set
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def extract_random_frames(video_path, num_frames=2, interval=10):
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    if fps == 0:
        cap.release()
        return []

    duration = total_frames // fps  # Total video duration in seconds

    extracted_frames = []
    for sec in range(0, duration, interval):  # Process every 10 seconds
        for _ in range(num_frames):  # Extract 2 frames per interval
            random_frame = random.randint(sec * fps, (sec + interval) * fps - 1)
            cap.set(cv2.CAP_PROP_POS_FRAMES, random_frame)
            ret, frame = cap.read()
            if ret:
                frame_path = f"frame_{random_frame}.jpg"
                cv2.imwrite(frame_path, frame)
                extracted_frames.append(frame_path)

    cap.release()
    return extracted_frames  # Return all extracted frames

def upload_frames_to_supabase(frames):
    frame_urls = []
    for frame in frames:
        with open(frame, "rb") as f:
            file_name = f"frames/{frame}"
            res = supabase.storage.from_("videosstore").upload(file_name, f)
            if res:
                frame_url = f"{SUPABASE_URL}/storage/v1/object/public/videosstore/{file_name}"
                frame_urls.append(frame_url)
        os.remove(frame)  # Cleanup local file
    return frame_urls

# @app.post("/process-video")
# async def process_video(data: dict = Body(...)):
#     print("Received request:", data)

#     video_url = data.get("video_url")
#     if not video_url:
#         return {"error": "Missing video_url"}

#     try:
#         # Download video from Supabase
#         video_data = supabase.storage.from_("videosstore").download(video_url)
#         with open("temp_video.mp4", "wb") as f:
#             f.write(video_data)

#         # Extract frames (2 per 10 seconds)
#         frames = extract_random_frames("temp_video.mp4")

#         # Upload frames to Supabase & get URLs
#         frame_urls = upload_frames_to_supabase(frames)

#         return {"frames": frame_urls}
#     except Exception as e:
#         print(f"Error processing video: {e}")
#         return {"error": str(e)}

@app.post("/process-video")
async def process_video(data: dict = Body(...)):
    print("Received request:", data)

    video_filename = data.get("video_url")  # Ensure it's just the filename
    if not video_filename:
        return {"error": "Missing video_url"}

    # Construct the full path expected by Supabase
    full_video_path = f"videosstore/{video_filename}"
    print(f"Attempting to download: {full_video_path}")

    try:
        # Check if video exists in Supabase
        video_files = supabase.storage.from_("videosstore").list()
        available_files = [file["name"] for file in video_files]
        print("Available files in Supabase:", available_files)

        if video_filename not in available_files:
            return {"error": "Video not found in Supabase"}

        # Download video from Supabase
        video_data = supabase.storage.from_("videosstore").download(full_video_path)
        with open("temp_video.mp4", "wb") as f:
            f.write(video_data)

        # Extract frames (2 per 10 seconds)
        frames = extract_random_frames("temp_video.mp4")

        # Upload frames to Supabase & get URLs
        frame_urls = upload_frames_to_supabase(frames)

        return {"frames": frame_urls}

    except Exception as e:
        print(f"Error processing video: {e}")
        return {"error": str(e)}

