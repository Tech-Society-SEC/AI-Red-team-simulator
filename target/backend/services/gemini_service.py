import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from fastapi import HTTPException, status

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise EnvironmentError("GEMINI_API_KEY environment variable not found.")

# Initialize the new client (sync version)
client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_INSTRUCTION_FINANCE = (
    "You are a friendly and helpful AI Financial Assistant. "
    "Always address the user by their name when provided in the context. "
    "Analyze user transaction data, identify spending patterns, "
    "offer budget advice, and answer finance-related questions. "
    "Be conversational and use the user's name to make responses more personal. "
    "Always respond in INR unless another currency is given. "
    "Provide actionable financial advice based on their specific data."
)

def ask_gemini(prompt: str, context: str = None, system_instruction: str = SYSTEM_INSTRUCTION_FINANCE) -> str:
    """
    Makes a synchronous Gemini API call using the new google-genai SDK syntax.
    """

    try:
        if context:
            prompt = f"Context:\n{context}\n\nUser Query: {prompt}"

        # Generate content using the correct format
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            ),
        )

        # Extract text safely
        return response.text or "No response from Gemini."

    except Exception as e:
        print(f"Gemini error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI error: {str(e)}"
        )
