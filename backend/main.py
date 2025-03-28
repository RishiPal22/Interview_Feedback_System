import os
import random
import base64
import requests
import imageio
import io
import tempfile
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace  # For emotional analysis

# Initialize FastAPI
app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from this origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

def extract_frames(video_url, num_frames=2, interval=5):
    """
    Extracts frames from the video at specified intervals.
    Returns a list of frames (as base64-encoded images) and their metadata.
    """
    try:
        # Fetch video from URL
        response = requests.get(video_url, stream=True)
        if response.status_code != 200:
            return {"error": "Failed to fetch video from URL"}

        # Define a custom temporary directory
        custom_temp_dir = "C:\\Temp"  # Change this to a valid directory on your system
        temp_dir = None

        # Try to use the custom temporary directory
        try:
            if not os.path.exists(custom_temp_dir):
                os.makedirs(custom_temp_dir)  # Create the directory if it doesn't exist
            temp_dir = custom_temp_dir
        except Exception as e:
            print(f"Failed to create custom temp directory: {e}. Falling back to system default temp directory.")
            temp_dir = tempfile.gettempdir()  # Fallback to system default temp directory

        print("Using temporary directory:", temp_dir)

        # Save video to a temporary file in the specified directory
        with tempfile.NamedTemporaryFile(dir=temp_dir, delete=False, suffix=".mp4") as temp_video:
            temp_video.write(response.content)
            temp_video_path = temp_video.name
        
        print("Temporary video file saved at:", temp_video_path)

        # Read video using imageio from the saved file
        video_reader = imageio.get_reader(temp_video_path)

        # Extract metadata
        metadata = video_reader.get_meta_data()
        print("Metadata:", metadata)

        # Get FPS from metadata (default to 30 if missing)
        fps = int(metadata.get("fps", 30))
        print("FPS:", fps)

        # Calculate total frames and duration manually
        try:
            total_frames = video_reader.count_frames()  # Get total frames in the video
            duration = int(total_frames / fps)  # Calculate duration using total frames and FPS
        except Exception as e:
            print(f"Error calculating total frames or duration: {e}")
            return {"error": "Unable to calculate video duration or total frames"}

        print("Total frames:", total_frames)
        print("Duration:", duration)
        
        if duration <= 0 or fps <= 0:
            video_reader.close()
            return {"error": "Invalid video metadata (duration or FPS missing or zero)"}

        extracted_frames = []

        # Extract frames at intervals
        for sec in range(0, int(duration), interval):
            for _ in range(num_frames):
                random_frame = random.randint(sec * fps, min((sec + interval) * fps - 1, total_frames - 1))
                frame = video_reader.get_data(random_frame)
                
                if frame is not None:
                    # Convert frame to base64
                    buffer = io.BytesIO()
                    imageio.imwrite(buffer, frame, format="jpg")
                    buffer.seek(0)
                    frame_base64 = base64.b64encode(buffer.read()).decode("utf-8")
                    extracted_frames.append({
                        "frame": f"data:image/jpeg;base64,{frame_base64}",
                        "frame_number": random_frame
                    })

        video_reader.close()

        # Remove temporary video file
        os.remove(temp_video_path)
        print("Temporary file deleted:", temp_video_path)
        # print("Extracted frames:", extracted_frames)

        return extracted_frames if extracted_frames else {"error": "No frames extracted"}

    except Exception as e:
        return {"error": str(e)}

def calculate_average_confidence(frames):
    """
    Analyzes the extracted frames using DeepFace and calculates the average confidence percentage.
    """
    try:
        total_confidence = 0  # To store the sum of confidence scores
        total_frames_analyzed = 0  # To count the total number of frames analyzed

        # Define a custom temporary directory
        custom_temp_dir = "C:\\Temp"  # Change this to a valid directory on your system
        temp_dir = None

        # Try to use the custom temporary directory
        try:
            if not os.path.exists(custom_temp_dir):
                os.makedirs(custom_temp_dir)  # Create the directory if it doesn't exist
            temp_dir = custom_temp_dir
        except Exception as e:
            print(f"Failed to create custom temp directory: {e}. Falling back to system default temp directory.")
            temp_dir = tempfile.gettempdir()  # Fallback to system default temp directory

        print("Using temporary directory:", temp_dir)

        # Analyze each frame
        for frame_data in frames:
            try:
                frame_base64 = frame_data["frame"].split(",")[1]  # Extract base64 data
                frame_bytes = base64.b64decode(frame_base64)  # Decode base64 to bytes

                # Save the frame as a temporary image file for DeepFace analysis
                with tempfile.NamedTemporaryFile(dir=temp_dir, delete=False, suffix=".jpg") as temp_image:
                    temp_image.write(frame_bytes)
                    temp_image_path = temp_image.name

                # Perform emotional analysis using DeepFace
                try:
                    analysis = DeepFace.analyze(img_path=temp_image_path, actions=["emotion"])
                    emotion = analysis[0]["dominant_emotion"]  # Get the dominant emotion
                    confidence = analysis[0]["emotion"][emotion]  # Get the confidence score for the dominant emotion
                    print(f"Frame analyzed: {temp_image_path}")
                    print(f"Dominant Emotion: {emotion}, Confidence: {confidence}%")
                    total_confidence += confidence  # Add to the total confidence
                    total_frames_analyzed += 1  # Increment the total frames analyzed
                except Exception as e:
                    print(f"Error analyzing emotion for frame {temp_image_path}: {e}")
                    confidence = 0  # If no face is detected, confidence is 0

                # Remove the temporary image file
                os.remove(temp_image_path)
                print("Temporary image file deleted:", temp_image_path)

            except Exception as e:
                print(f"Error processing frame: {e}")

        # Calculate the average confidence percentage
        average_confidence_percentage = (total_confidence / total_frames_analyzed) if total_frames_analyzed > 0 else 0
        print("Total confidence:", total_confidence)
        print("Total frames analyzed:", total_frames_analyzed)
        print("Average confidence percentage:", average_confidence_percentage)

        return average_confidence_percentage

    except Exception as e:
        print(f"Error in calculate_average_confidence: {e}")
        return {"error": str(e)}

@app.post("/process-video")
async def process_video(data: dict = Body(...)):
    try:
        video_url = data.get("video_url")
        if not video_url:
            return {"error": "Missing video_url"}

        # Step 1: Extract frames from the video
        frames = extract_frames(video_url, num_frames=2, interval=5)
        if "error" in frames:
            return frames  # Return error if frame extraction fails

        # Step 2: Calculate the average confidence percentage from the extracted frames
        average_confidence_percentage = calculate_average_confidence(frames)
        if isinstance(average_confidence_percentage, dict) and "error" in average_confidence_percentage:
            return average_confidence_percentage  # Return error if confidence calculation fails

        # Convert numpy.float32 to native Python float
        average_confidence_percentage = float(average_confidence_percentage)

        return {
            "frames": frames,
            "average_confidence_percentage": average_confidence_percentage
            
        }

    except Exception as e:
        print(f"Error in /process-video: {str(e)}")
        return {"error": "Internal server error", "details": str(e)}