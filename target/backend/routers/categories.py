from fastapi import APIRouter, Depends, HTTPException, status, Query
from services.supabase_client import supabase
from utils.auth import get_current_user_id

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/")
async def list_categories(
    user_id: str = Depends(get_current_user_id)
):
    try:
        result = supabase.table("categories").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"status": "success", "categories": result.data or []}
    except Exception as e:
        print(f"Error listing categories: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch categories")


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_category(
    body: dict,
    user_id: str = Depends(get_current_user_id)
):
    name = body.get("name")
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="'name' is required")

    payload = {
        "user_id": user_id,
        "name": name,
        "color": body.get("color", "#4f46e5"),
        "icon": body.get("icon"),
        "budget_limit": body.get("budget_limit"),
    }
    try:
        result = supabase.table("categories").insert(payload).execute()
        created = (result.data or [None])[0]
        return {"status": "success", "category": created}
    except Exception as e:
        print(f"Error creating category: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create category")


@router.put("/{category_id}")
async def update_category(
    category_id: str,
    body: dict,
    user_id: str = Depends(get_current_user_id)
):
    allowed = {"name", "color", "icon", "budget_limit"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid fields to update")
    try:
        check = supabase.table("categories").select("id").eq("id", category_id).eq("user_id", user_id).execute()
        if not check.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found or access denied")
        result = supabase.table("categories").update(updates).eq("id", category_id).execute()
        updated = (result.data or [None])[0]
        return {"status": "success", "category": updated}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating category: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update category")


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    user_id: str = Depends(get_current_user_id)
):
    try:
        check = supabase.table("categories").select("id").eq("id", category_id).eq("user_id", user_id).execute()
        if not check.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found or access denied")
        supabase.table("categories").delete().eq("id", category_id).execute()
        return {"status": "success", "message": "Category deleted"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting category: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete category")


