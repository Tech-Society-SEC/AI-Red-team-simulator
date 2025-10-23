from fastapi import APIRouter, Depends, HTTPException, status
from services.supabase_client import supabase
from utils.auth import get_current_user_id

router = APIRouter(prefix="/profile", tags=["Profile"])


def ensure_default_rows(user_id: str):
    """Ensure a profile and user_settings row exist for the user."""
    try:
        # Profiles
        profile_res = supabase.table("profiles").select("id").eq("id", user_id).execute()
        if not profile_res.data:
            supabase.table("profiles").insert({
                "id": user_id,
                "full_name": None,
                "avatar_url": None,
                "currency": "INR",
            }).execute()

        # User settings
        settings_res = supabase.table("user_settings").select("id").eq("user_id", user_id).execute()
        if not settings_res.data:
            supabase.table("user_settings").insert({
                "user_id": user_id,
                "theme": "light",
                "notifications_enabled": True,
                "preferred_view": "chart",
                "language": "en",
            }).execute()
    except Exception as e:
        # Non-fatal: we'll still try to serve, but callers may see empty data
        print(f"ensure_default_rows error: {e}")


@router.get("")
@router.get("/")
async def get_profile(user_id: str = Depends(get_current_user_id)):
    """Fetch current user's profile and settings."""
    ensure_default_rows(user_id)
    try:
        profile_q = supabase.table("profiles").select("id, full_name, avatar_url, currency").eq("id", user_id).single()
        profile = profile_q.execute().data

        settings_q = supabase.table("user_settings").select(
            "id, theme, notifications_enabled, preferred_view, language"
        ).eq("user_id", user_id).single()
        settings = settings_q.execute().data

        return {"profile": profile, "settings": settings}
    except Exception as e:
        print(f"Error fetching profile/settings: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch profile")


@router.put("")
@router.put("/")
async def update_profile(
    body: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Update profile fields and/or user settings.
    Accepts keys for profiles: full_name, avatar_url, currency
            keys for user_settings: theme, language, notifications_enabled, preferred_view
    """
    ensure_default_rows(user_id)
    profile_updates = {}
    settings_updates = {}

    for key in ["full_name", "avatar_url", "currency"]:
        if key in body:
            profile_updates[key] = body[key]

    for key in ["theme", "language", "notifications_enabled", "preferred_view"]:
        if key in body:
            settings_updates[key] = body[key]

    if not profile_updates and not settings_updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid fields to update")

    try:
        if profile_updates:
            supabase.table("profiles").update(profile_updates).eq("id", user_id).execute()

        if settings_updates:
            supabase.table("user_settings").update(settings_updates).eq("user_id", user_id).execute()

        # Return latest
        profile_q = supabase.table("profiles").select("id, full_name, avatar_url, currency").eq("id", user_id).single()
        profile = profile_q.execute().data

        settings_q = supabase.table("user_settings").select(
            "id, theme, notifications_enabled, preferred_view, language"
        ).eq("user_id", user_id).single()
        settings = settings_q.execute().data

        return {"profile": profile, "settings": settings}
    except Exception as e:
        print(f"Error updating profile/settings: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update profile")


