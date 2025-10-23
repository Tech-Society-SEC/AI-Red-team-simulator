from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.auth import get_current_user

router = APIRouter()
security = HTTPBearer()

@router.get("/me")
async def get_user_profile(current_user = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at
    }

@router.post("/verify")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify if token is valid"""
    try:
        user = await get_current_user(credentials)
        return {"valid": True, "user_id": user.id}
    except HTTPException:
        return {"valid": False}
