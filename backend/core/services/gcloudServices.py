from google.cloud import storage
from google.cloud import firestore
from datetime import datetime

# Initialize Firestore client
db = firestore.Client()


def upload_audio_to_gcs(audio_path, bucket_name, file_name):
    """Uploads an audio file to Google Cloud Storage."""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    blob.upload_from_filename(audio_path)
    return blob.public_url




def getLatestComments(count, gameId):
    """
    Retrieves the latest 'count' comments for a given gameId from Firestore.
    """
    comments_ref = db.collection("games").document(gameId).collection("comments")
    
    # Fetch latest 'count' comments ordered by timestamp (descending order)
    comments = comments_ref.order_by("date", direction=firestore.Query.DESCENDING).limit(count).stream()

    return {
        "gameId": gameId,
        "comments": [
            {
                "date": c.get("date").isoformat(),
                "username": c.get("username"),
                "comment": c.get("comment")
            } for c in comments
        ]
    }

def addNewComment(comment, gameId, username):
    """
    Adds a new comment to Firestore under the gameId.
    """
    comments_ref = db.collection("games").document(gameId).collection("comments")
    
    new_comment = {
        "date": datetime.utcnow(),  # Firestore uses datetime format
        "username": username,
        "comment": comment
    }
    
    # Add comment (Firestore auto-generates a unique ID)
    comments_ref.add(new_comment)

    return {"message": "Comment added successfully!", "new_comment": new_comment}

def fetchPreviousMessages(sessionId):
    """
    Retrieves the previous conversation messages for a given sessionId from Firestore.
    The messages are returned as a list of dictionaries with keys "role" and "parts".
    """
    messages_ref = db.collection("sessions").document(sessionId).collection("messages")
    # Order messages by timestamp ascending (oldest first)
    messages = messages_ref.order_by("timestamp", direction=firestore.Query.ASCENDING).stream()
    result = []
    for msg in messages:
        data = msg.to_dict()
        result.append({
            "role": data.get("role"),
            "parts": data.get("parts")
        })
    return result

def addMessageToSession(sessionId, role, parts):
    """
    Adds a new message to the Firestore session history.
    """
    messages_ref = db.collection("sessions").document(sessionId).collection("messages")
    message = {
        "role": role,
        "parts": parts,
        "timestamp": datetime.utcnow()
    }
    messages_ref.add(message)
    return message

def updateSessionMessage(sessionId, message_id, new_data):
    """
    Updates a specific message in the session history in Firestore.
    new_data should be a dict containing the fields to update.
    """
    message_ref = db.collection("sessions").document(sessionId).collection("messages").document(message_id)
    message_ref.update(new_data)
    return new_data

def deleteSessionHistory(sessionId):
    """
    Deletes all messages in a given session from Firestore.
    """
    messages_ref = db.collection("sessions").document(sessionId).collection("messages")
    docs = messages_ref.stream()
    for doc in docs:
        doc.reference.delete()
    return {"message": "Session history deleted successfully."}
