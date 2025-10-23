from fastapi import APIRouter, HTTPException, status, Depends
from services.supabase_client import supabase
from utils.auth import get_current_user_id
from datetime import datetime

router = APIRouter(prefix="/insights", tags=["Insights"])

@router.get("/")
def get_insights(user_id: str = Depends(get_current_user_id)):
    """
    Retrieves all insights for the authenticated user.
    """
    try:
        # Supabase synchronous call to fetch all insights for the user
        insights_result = supabase.table("insights")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()
            
        insights = insights_result.data

        return {
            "status": "success",
            "count": len(insights), 
            "insights": insights
        }

    except Exception as e:
        print(f"Supabase error fetching insights for user {user_id}: {e}")
        # Return a 500 status code if the database operation fails
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve insights from the database."
        )


@router.post("/")
def add_insight(body: dict, user_id: str = Depends(get_current_user_id)):
    """Store an AI-generated insight for the user."""
    payload = {
        "user_id": user_id,
        "type": body.get("type"),
        "summary": body.get("summary"),
        "data": body.get("data")
    }
    if payload["type"] not in ("spending_pattern", "goal_progress", "budget_alert"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid insight type")
    try:
        res = supabase.table("insights").insert(payload).execute()
        created = (res.data or [None])[0]
        return {"status": "success", "insight": created}
    except Exception as e:
        print(f"Error inserting insight: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to store insight")
