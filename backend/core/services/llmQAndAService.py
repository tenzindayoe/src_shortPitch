import google.generativeai as genai
import json
from core.services.gcloudServices import fetchPreviousMessages, updateSessionMessage, deleteSessionHistory, addMessageToSession

genai.configure(api_key="")# put your gemini api key here for testing for production use environment variables
model = genai.GenerativeModel("gemini-1.5-flash")

def ask_gemini(prompt, previous_messages=None, dynamic_threshold=0.3):
    """
    Queries the Gemini model with an optional conversation history and determines if
    Google Search grounding is needed. Returns a JSON string with the answer and grounding sources.
    
    Args:
      prompt (str): The current query from the user.
      previous_messages (list of dict, optional): A list of previous messages, each a dict with keys
          "role" (e.g., "user" or "model") and "parts" (the text content). Defaults to None.
      dynamic_threshold (float): The dynamic retrieval threshold.
      
    Returns:
      str: A JSON string containing the answer and sources.
    """
    
    # If previous messages are provided, start a chat conversation; otherwise, use generate_content.
    if previous_messages:
        chat = model.start_chat(history=previous_messages)
        response = chat.send_message(
            prompt,
            tools={
                "google_search_retrieval": {
                    "dynamic_retrieval_config": {
                        "mode": "dynamic",  # Let the model decide when to use Google Search
                        "dynamic_threshold": dynamic_threshold  # Adjust threshold
                    }
                }
            }
        )
        result_data = response._result
    else:
        response = model.generate_content(
            contents=prompt,
            tools={
                "google_search_retrieval": {
                    "dynamic_retrieval_config": {
                        "mode": "dynamic",  # Let the model decide when to use Google Search
                        "dynamic_threshold": dynamic_threshold  # Adjust threshold
                    }
                }
            }
        )
        result_data = response._result
    
    # Check that we have at least one candidate.
    if not result_data.candidates:
        return json.dumps({"response": "No answer available.", "sources": []})
    
    # Extract the answer text from the first candidate.
    candidate = result_data.candidates[0]
    answer_text = candidate.content.parts[0].text

    # Extract grounding information (source links) if available.
    sources = []
    grounding_meta = candidate.grounding_metadata
    grounding_chunks = grounding_meta.grounding_chunks
    for chunk in grounding_chunks:
        web_info = chunk.web
        if web_info:
            sources.append({
                "title": web_info.title,
                "uri": web_info.uri
            })
    
    # Build the result dictionary.
    result = {
        "response": answer_text,
        "sources": sources
    }
    
    return json.dumps(result, indent=2)

def getGameInformationForQ_A(gameId):
    """
    Fetches the game information from Firestore for the given gameId.
    
    Args:
      gameId (str): The unique identifier for the game.
      
    Returns:
      dict: A dictionary containing the game information.
    """
    promt = " You are an MLB Games Expert LLM and you do not answer questions out of that. You only answer MLB Specific Questions and Facts. Your answers are short and precise with online sources such as MLB.com and the news whenever possible. If the user request is out of the topic of MLB, don't answer it and say 'I cannot help you with that. Please ask me an MLB related question' or something. You are provided with this information to answer questions later on. Data : "+  get_game_full_Info_qa(gameId)
    return promt


def qandAService(sessionId,gameId, query, dynamic_threshold=0.3):
    """
    Combines fetching previous messages from Firestore with asking Gemini.
    After getting the response, it updates the session history in Firestore with the new user query and model response.
    
    Args:
      sessionId (str): The unique identifier for the session.
      query (str): The current query from the user.
      dynamic_threshold (float): The dynamic retrieval threshold for Gemini.
      
    Returns:
      str: A JSON string containing the answer and grounding sources.
    """
    # Fetch previous conversation messages from Firestore.
    previous_messages = fetchPreviousMessages(sessionId)
    if len(previous_messages) == 0 : 
        gameInformation = getGameInformationForQ_A(gameId)
        addMessageToSession(sessionId, "user", gameInformation)
        addMessageToSession(sessionId, "model", "Okay, I have noted down the game information. Please ask your MLB questions.")
        previous_messages = fetchPreviousMessages(sessionId)

    
    
    query = " If this prompt below is not related to the MLB Game or MLB, ignore it and just say 'I cannot help you with that. Is there anything else you would like to know about .. game?' \n\n" + query
    # Call Gemini with the previous messages and current query.
    response_json = ask_gemini(query, previous_messages, dynamic_threshold)
    response_data = json.loads(response_json)
    
    # Update the Firestore session history with the new user query and model response.
    addMessageToSession(sessionId, "user", query)
    addMessageToSession(sessionId, "model", response_data.get("response", ""))
    
    return response_json
