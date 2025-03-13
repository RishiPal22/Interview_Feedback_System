# import cv2
# import random
# import os
# import base64
# from supabase import create_client
# from fastapi import FastAPI, Body
# from dotenv import load_dotenv
# from fastapi.middleware.cors import CORSMiddleware

# # Load environment variables
# load_dotenv()

# # Initialize FastAPI
# app = FastAPI()

# # CORS settings
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],  # Update with frontend URL if deployed
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Supabase Setup
# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_KEY")
# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# def extract_random_frames(video_path, num_frames=2, interval=5):
#     cap = cv2.VideoCapture(video_path)
    
#     if not cap.isOpened():
#         print(f"Error: Unable to open video {video_path}")
#         return []

#     total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
#     fps = int(cap.get(cv2.CAP_PROP_FPS))

#     print("total frames", total_frames)
#     print(fps)

#     if fps == 0 or total_frames == 0:
#         print("Error: FPS or total frames is zero, invalid video")
#         cap.release()
#         return []

#     duration = total_frames // fps

#     print("duration is ", duration)
#     extracted_frames = []

#     for sec in range(0, duration, interval):
#         for _ in range(num_frames):
#             random_frame = random.randint(sec * fps, min((sec + interval) * fps - 1, total_frames - 1))
#             cap.set(cv2.CAP_PROP_POS_FRAMES, random_frame)
#             ret, frame = cap.read()
#             if ret:
#                 _, buffer = cv2.imencode(".jpg", frame)
#                 frame_base64 = base64.b64encode(buffer).decode("utf-8")
#                 extracted_frames.append(f"data:image/jpeg;base64,{frame_base64}")
#             else:
#                 print(f"Warning: Failed to read frame {random_frame}")

#     cap.release()
#     return extracted_frames

# @app.post("/process-video")
# async def process_video(data: dict = Body(...)):
#     print("Received request:", data)

#     video_filename = data.get("video_url")  # Ensure it's just the filename
#     if not video_filename:
#         return {"error": "Missing video_url"}

#     # Ensure file extension
#     if not video_filename.lower().endswith((".mp4", ".avi", ".mov", ".mkv")):
#         return {"error": "Unsupported video format"}

#     full_video_path = f"temp_{video_filename}"  # Save as temp file

#     try:
#         # Check if video exists in Supabase
#         video_files = supabase.storage.from_("videosstore").list()
#         available_files = [file["name"] for file in video_files]
#         print("Available files in Supabase:", available_files)

#         if video_filename not in available_files:
#             return {"error": "Video not found in Supabase"}

#         # Download video from Supabase
#         video_data = supabase.storage.from_("videosstore").download(video_filename)
        
#         with open(full_video_path, "wb") as f:
#             f.write(video_data)
        
#         print(f"Downloaded video saved as {full_video_path}")

#         # Debug: Check if OpenCV can open the video
#         cap = cv2.VideoCapture(full_video_path)
#         if not cap.isOpened():
#             print("Error: OpenCV cannot open the downloaded video")
#             return {"error": "Invalid video format or corrupted file"}
#         cap.release()

#         # Extract frames (2 per 5 seconds)
#         frames = extract_random_frames('https://ezxqwbvzmieuieumdkca.supabase.co/storage/v1/object/public/videosstore//RishiPal23_4606.mp4', num_frames=2, interval=5)
#         print("Extracted frames:", len(frames))
        
#         # Cleanup
#         os.remove(full_video_path)
        
#         return {"frames": frames if frames else "No frames extracted"}

#     except Exception as e:
#         print(f"Error processing video: {e}")
#         return {"error": str(e)}



import cv2
import random
import base64
import os
import numpy as np
import requests
from supabase import create_client
from fastapi import FastAPI, Body
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update with frontend URL if deployed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def extract_random_frames_from_url(video_url, num_frames=2, interval=5):
    try:
        # Fetch video as a byte stream
        response = requests.get(video_url, stream=True)
        if response.status_code != 200:
            return {"error": "Failed to fetch video from URL"}

        # Convert byte stream to a NumPy array
        video_bytes = np.asarray(bytearray(response.content), dtype=np.uint8)
        video = cv2.imdecode(video_bytes, cv2.IMREAD_UNCHANGED)

        # Open the video stream in OpenCV
        cap = cv2.VideoCapture(video_url)

        if not cap.isOpened():
            return {"error": "Cannot open video stream"}

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))

        if fps == 0 or total_frames == 0:
            cap.release()
            return {"error": "Invalid video (FPS or total frames is zero)"}

        duration = total_frames // fps
        extracted_frames = []

        for sec in range(0, duration, interval):
            for _ in range(num_frames):
                random_frame = random.randint(sec * fps, min((sec + interval) * fps - 1, total_frames - 1))
                cap.set(cv2.CAP_PROP_POS_FRAMES, random_frame)
                ret, frame = cap.read()
                if ret:
                    _, buffer = cv2.imencode(".jpg", frame)
                    frame_base64 = base64.b64encode(buffer).decode("utf-8")
                    extracted_frames.append(f"data:image/jpeg;base64,{frame_base64}")

        cap.release()
        return extracted_frames if extracted_frames else {"error": "No frames extracted"}

    except Exception as e:
        return {"error": str(e)}

@app.post("/process-video")
async def process_video(data: dict = Body(...)):
    print("Received request:", data)

    video_url = data.get("video_url")  # Ensure it's a valid URL
    if not video_url:
        return {"error": "Missing video_url"}

    # Extract frames without saving the video
    frames = extract_random_frames_from_url(video_url, num_frames=2, interval=5)
    
    return {"frames": frames}
