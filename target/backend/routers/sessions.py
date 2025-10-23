from fastapi import APIRouter, Depends, HTTPException, status
from services.supabase_client import supabase
from utils.auth import get_current_user_id

router = APIRouter(prefix="/sessions", tags=["Chat Sessions"])


@router.get("/")
async def list_sessions(user_id: str = Depends(get_current_user_id)):
    try:
        res = supabase.table("chat_sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"status": "success", "sessions": res.data or []}
    except Exception as e:
        print(f"Error listing sessions: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch sessions")


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_session(body: dict = {}, user_id: str = Depends(get_current_user_id)):
    payload = {"user_id": user_id, "session_name": body.get("session_name")}
    try:
        res = supabase.table("chat_sessions").insert(payload).execute()
        created = (res.data or [None])[0]
        return {"status": "success", "session": created}
    except Exception as e:
        print(f"Error creating session: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create session")


@router.put("/{session_id}")
async def rename_session(session_id: str, body: dict, user_id: str = Depends(get_current_user_id)):
    try:
        check = supabase.table("chat_sessions").select("id").eq("id", session_id).eq("user_id", user_id).execute()
        if not check.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or access denied")
        res = supabase.table("chat_sessions").update({"session_name": body.get("session_name")}).eq("id", session_id).execute()
        updated = (res.data or [None])[0]
        return {"status": "success", "session": updated}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error renaming session: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update session")


@router.delete("/{session_id}")
async def delete_session(session_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        check = supabase.table("chat_sessions").select("id").eq("id", session_id).eq("user_id", user_id).execute()
        if not check.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or access denied")
        supabase.table("chat_sessions").delete().eq("id", session_id).execute()
        return {"status": "success", "message": "Session deleted"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting session: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete session")


