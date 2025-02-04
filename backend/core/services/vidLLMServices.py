import google.generativeai as genai
import json
import hashlib

def get_safe_doc_id(url):
    """Generate a safe document ID using hashing (since URLs may contain invalid characters)."""
    return hashlib.md5(url.encode()).hexdigest()  # Generates a short, unique ID



from core.services.gameServices import save_to_file
# Configure Gemini API
genai.configure(api_key="")# put your gemini api key here for testing for production use environment variables
model = genai.GenerativeModel("gemini-1.5-pro-002")


import vertexai
from vertexai.generative_models import GenerativeModel, Part

# Initialize Vertex AI with your Google Cloud Project
PROJECT_ID = "rewind-448923"  # Replace with your GCP project ID
vertexai.init(project=PROJECT_ID, location="us-central1")

# Initialize the model (Use "gemini-1.5-pro" for better results)
model = GenerativeModel("gemini-1.5-flash-002")  # or "gemini-1.5-pro"



import requests
from google.cloud import storage, firestore

# Your Google Cloud Storage bucket name
GCS_BUCKET_NAME = "mlb-highlights-private"

# Initialize Google Cloud Storage Client
storage_client = storage.Client()
bucket = storage_client.bucket(GCS_BUCKET_NAME)

db = firestore.Client()

COLLECTION_NAME = "gsmlb"
tempStore = {}
def addToVidStore(gsURL, mlbURL):

    doc_id = get_safe_doc_id(mlbURL)  # Convert mlbURL to a safe ID

    doc_ref = db.collection(COLLECTION_NAME).document(doc_id)
    doc_ref.set({"gsURL": gsURL})
    return gsURL


def getFromVidStore(mlbURL):
    doc_id = get_safe_doc_id(mlbURL)  # Convert mlbURL to a safe ID
    doc_ref = db.collection(COLLECTION_NAME).document(doc_id)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict().get("gsURL")
    return None
    
    


def download_and_upload_mlb_video(mlb_video_url, video_filename):
    """
    Downloads an MLB highlight video and uploads it to a private GCS bucket.
    """
    # Step 1: Download video from MLB

    if getFromVidStore(mlb_video_url) is not None:
        print(f"Video already exists in GCS: {mlb_video_url}")
        print(f"Returning GCS URL: {getFromVidStore(mlb_video_url)}")
        return getFromVidStore(mlb_video_url)

    response = requests.get(mlb_video_url, stream=True)
    if response.status_code == 200:
        print(f"Downloading: {mlb_video_url}")
        blob = bucket.blob(video_filename)
        
        # Step 2: Upload to GCS
        blob.upload_from_string(response.content, content_type="video/mp4")
       

        # Step 3: Make sure the file is PRIVATE (default setting)
        blob.acl.save_predefined("private")
        gcs_url = f"gs://{GCS_BUCKET_NAME}/{video_filename}"
        # Store the mapping in Firestore
        addToVidStore(gcs_url, mlb_video_url)

        # Step 4: Return the GCS URI
        return f"gs://{GCS_BUCKET_NAME}/{video_filename}"
    else:
        raise ValueError(f"Failed to download video. Status Code: {response.status_code}")




def generate_video_timestamps(mlbVidURL, narrationDescription, narrationLength):
    """
    Uses Gemini 1.5 to analyze a video from Google Cloud Storage (GCS)
    and generate timestamps with chapter summaries.
    """

    gcsURL = None
    try:
        video_filename = mlbVidURL.split("/")[-1]  # Example: "highlight.mp4"

        gcsURL = download_and_upload_mlb_video(mlbVidURL, video_filename)
    
    except Exception as e:
        print(f"Error downloading and uploading video: {e}")
        raise ValueError(f"Error downloading and uploading video: {e}")
    
    prompt = f"""
    Please analyze the mlb highlight provided in the link and also the narration text along with how long the narration audio is. 

    Based on these information, I would like you to return a json object that contains the relevant section of the video that matchest the content of the narration. The json object should contain contain the two variables - start and end which represent the start and end timestamps of the video in HH:MM:SS format.
    
    
    
    The chosen highlight section should be such that it is the most relevant and engaging section of the video that matches the narration and the length of the section should be equal or close to the length of the narration audio.The chosen length of the video should be less or equal to the actual length of the video.
    Make the video short and relevant as possible and close to the narration audio length.

    Narration Script : {narrationDescription}
    Narration Audio Length : {narrationLength}

    Give me the json directly with NO ```json or code``` blocks.

    Strictly follow the HH:MM:SS format for the timestamps.
    You must follow this structure and format for the json object. Any deviation from this format such as incorrect key name or value format will result in a failed submission. Also no ```json or code``` blocks should be used because the system will not be able to parse the response correctly.It needs it directly in the json format.
    The keys are start and end and the values are in HH:MM:SS format, and you must include both in every response.
    Example:

    {{
        "start": "00:00:20",
        "end": "00:00:35"
    }}

    
    """

    try:
        # Load video from Google Cloud Storage (GCS)
        video_file = Part.from_uri(uri=gcsURL, mime_type="video/mp4")

        # Send video and prompt to Gemini
        response = model.generate_content([video_file, prompt])
        # Print the structured JSON response
        return response.text  # The response will be in JSON format
    except Exception as e:
        print(f"Error generating video timestamps: {e}")
        print("^^From the video timestamp generation function")
        raise e


# Example Usage
# if __name__ == "__main__":
#     video_url = "https://mlb-cuts-diamond.mlb.com/FORGE/2021/2021-04/06/9989c990-899887ee-ada06591-csvm-diamondx64-asset_1280x720_59_4000K.mp4" # Replace with your actual GCS video URL
#     chapters = generate_video_timestamps(video_url)
#     print(chapters)


