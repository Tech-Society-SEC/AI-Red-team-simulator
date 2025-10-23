from fastapi import APIRouter, Depends, HTTPException, status
from services.supabase_client import supabase
from utils.auth import get_current_user_id
from datetime import date

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.get("/")
async def list_goals(user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.table("goals").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"status": "success", "goals": result.data or []}
    except Exception as e:
        print(f"Error listing goals: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch goals")


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_goal(body: dict, user_id: str = Depends(get_current_user_id)):
    required = ["title", "target_amount"]
    missing = [k for k in required if k not in body]
    if missing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Missing fields: {', '.join(missing)}")
    payload = {
        "user_id": user_id,
        "title": body["title"],
        "target_amount": body["target_amount"],
        "current_amount": body.get("current_amount", 0),
        "deadline": body.get("deadline"),
    }
    try:
        result = supabase.table("goals").insert(payload).execute()
        created = (result.data or [None])[0]
        return {"status": "success", "goal": created}
    except Exception as e:
        print(f"Error creating goal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create goal")


@router.put("/{goal_id}")
async def update_goal(goal_id: str, body: dict, user_id: str = Depends(get_current_user_id)):
    allowed = {"title", "target_amount", "current_amount", "deadline", "status"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid fields to update")
    try:
        check = supabase.table("goals").select("id").eq("id", goal_id).eq("user_id", user_id).execute()
        if not check.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found or access denied")
        result = supabase.table("goals").update(updates).eq("id", goal_id).execute()
        updated = (result.data or [None])[0]
        return {"status": "success", "goal": updated}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating goal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update goal")


@router.delete("/{goal_id}")
async def delete_goal(goal_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        check = supabase.table("goals").select("id").eq("id", goal_id).eq("user_id", user_id).execute()
        if not check.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found or access denied")
        supabase.table("goals").delete().eq("id", goal_id).execute()
        return {"status": "success", "message": "Goal deleted"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting goal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete goal")


@router.post("/check-deadlines")
async def check_deadlines(user_id: str = Depends(get_current_user_id)):
    """Mark goals completed/missed based on current date and progress."""
    today = date.today().isoformat()
    try:
        # Fetch active goals
        res = supabase.table("goals").select("id, target_amount, current_amount, deadline, status").eq("user_id", user_id).eq("status", "active").execute()
        goals = res.data or []
        updated = 0
        for g in goals:
            deadline = g.get("deadline")
            if not deadline:
                continue
            if g.get("current_amount", 0) >= g.get("target_amount", 0):
                supabase.table("goals").update({"status": "completed"}).eq("id", g["id"]).execute()
                updated += 1
            elif today > deadline:
                supabase.table("goals").update({"status": "missed"}).eq("id", g["id"]).execute()
                updated += 1
        return {"status": "success", "updated": updated}
    except Exception as e:
        print(f"Error checking deadlines: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to check goal deadlines")


