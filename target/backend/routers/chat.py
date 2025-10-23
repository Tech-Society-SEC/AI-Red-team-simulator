from fastapi import APIRouter, Form, HTTPException, status, Depends
from services.gemini_service import ask_gemini
from services.supabase_client import supabase
from utils.auth import get_current_user_id
from typing import List, Dict
import json

router = APIRouter(prefix="/chat", tags=["Chat"])


# Helper function to serialize transaction list into a Gemini-readable string
def serialize_transactions_for_ai(transactions: List[Dict]) -> str:
    """Converts a list of transaction dictionaries into a compact CSV-like string."""
    if not transactions:
        return "No transaction data available."
    
    # Define columns relevant to AI analysis
    columns = ["txn_date", "amount", "type", "category", "merchant", "description"]
    
    # Create the header row
    csv_string = ",".join(columns) + "\n"
    
    # Create the data rows
    for txn in transactions:
        row = [str(txn.get(col, '')) for col in columns]
        csv_string += ",".join(row) + "\n"
        
    # We will keep the 50 transaction limit by relying on the SQL query.
    return "Transaction Data (CSV Format):\n" + csv_string


@router.post("")
@router.post("/")
async def chat(
    message: str = Form(...),
    session_id: str | None = Form(default=None),
    user_id: str = Depends(get_current_user_id)
):
    """
    Handles a chat query by fetching user transactions securely
    and passing them as context to the Gemini model.
    """
    try:
        # Fetch user profile for personalized responses
        profile_result = supabase.table("profiles")\
            .select("full_name, username")\
            .eq("id", user_id)\
            .single()\
            .execute()
        
        user_name = None
        if profile_result.data:
            user_name = profile_result.data.get("full_name") or profile_result.data.get("username")
        
        # Fetch the most recent 50 transactions for context
        transactions_result = supabase.table("transactions")\
            .select("txn_date, amount, type, category, merchant, description")\
            .eq("user_id", user_id)\
            .order("txn_date", desc=True)\
            .limit(50)\
            .execute()
            
        transactions = transactions_result.data
        
    except Exception as e:
        print(f"Supabase error during chat context fetch: {e}")
        # Proceed without transaction data if fetching fails, but warn
        transactions = []
        user_name = None
        
    # Serialize the complex Python list/dict structure into a string for the LLM
    context_string = serialize_transactions_for_ai(transactions)
    
    # Add user name to context for personalized responses
    if user_name:
        context_string = f"User's name: {user_name}\n\n{context_string}"
    
    # The call to the async function ask_gemini MUST be awaited
    try:
        reply = ask_gemini(
            prompt=message, 
            context=context_string
        )

        # Store messages and optionally create session if missing
        if not session_id:
            session_insert = supabase.table("chat_sessions").insert({"user_id": user_id, "session_name": None}).execute()
            session_id = (session_insert.data or [{}])[0].get("id")

        if session_id:
            # Save user message
            supabase.table("messages").insert({
                "session_id": session_id,
                "role": "user",
                "content": message
            }).execute()
            # Save assistant reply
            supabase.table("messages").insert({
                "session_id": session_id,
                "role": "assistant",
                "content": reply
            }).execute()

        return {"reply": reply, "session_id": session_id}

    except HTTPException as e:
        # Re-raise exceptions from the gemini_service (e.g., 500 status from API error)
        raise e
    except Exception as e:
        print(f"Error during Gemini call: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get a response from the AI assistant."
        )
