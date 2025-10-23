from fastapi import APIRouter, Depends, HTTPException, status
from services.supabase_client import supabase
from utils.auth import get_current_user_id

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get("/")
async def list_budgets(user_id: str = Depends(get_current_user_id)):
    try:
        result = supabase.table("budgets").select("*").eq("user_id", user_id).order("year", desc=True).order("month", desc=True).execute()
        return {"status": "success", "budgets": result.data or []}
    except Exception as e:
        print(f"Error listing budgets: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch budgets")


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_budget(body: dict, user_id: str = Depends(get_current_user_id)):
    required = ["category_id", "month", "year", "limit_amount"]
    missing = [k for k in required if k not in body]
    if missing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Missing fields: {', '.join(missing)}")
    payload = {
        "user_id": user_id,
        "category_id": body["category_id"],
        "month": body["month"],
        "year": body["year"],
        "limit_amount": body["limit_amount"],
    }
    try:
        result = supabase.table("budgets").insert(payload).execute()
        created = (result.data or [None])[0]
        return {"status": "success", "budget": created}
    except Exception as e:
        print(f"Error creating budget: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create budget")


@router.put("/{budget_id}")
async def update_budget(budget_id: str, body: dict, user_id: str = Depends(get_current_user_id)):
    allowed = {"category_id", "month", "year", "limit_amount"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid fields to update")
    try:
        check = supabase.table("budgets").select("id").eq("id", budget_id).eq("user_id", user_id).execute()
        if not check.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found or access denied")
        result = supabase.table("budgets").update(updates).eq("id", budget_id).execute()
        updated = (result.data or [None])[0]
        return {"status": "success", "budget": updated}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating budget: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update budget")


@router.delete("/{budget_id}")
async def delete_budget(budget_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        check = supabase.table("budgets").select("id").eq("id", budget_id).eq("user_id", user_id).execute()
        if not check.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found or access denied")
        supabase.table("budgets").delete().eq("id", budget_id).execute()
        return {"status": "success", "message": "Budget deleted"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting budget: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete budget")


@router.post("/recompute", status_code=status.HTTP_200_OK)
async def recompute_spent(user_id: str = Depends(get_current_user_id)):
    """Recompute spent_amount per (user, category, month, year) from debit transactions."""
    try:
        # Fetch budgets for user
        budgets_res = supabase.table("budgets").select("id, category_id, month, year").eq("user_id", user_id).execute()
        budgets = budgets_res.data or []
        if not budgets:
            return {"status": "success", "updated": 0}

        updated_count = 0
        for b in budgets:
            # Sum debit transactions for this category and month/year
            # Note: category name is stored on transactions; we need to resolve by category_id -> name
            cat_res = supabase.table("categories").select("name").eq("id", b["category_id"]).eq("user_id", user_id).single().execute()
            category_name = (cat_res.data or {}).get("name")
            if not category_name:
                continue

            # Compute month boundaries as YYYY-MM-01 to YYYY-MM-31
            month_str = str(b["month"]).zfill(2)
            start_date = f"{b['year']}-{month_str}-01"
            end_date = f"{b['year']}-{month_str}-31"

            tx_res = supabase.table("transactions").select("amount").eq("user_id", user_id).eq("category", category_name).eq("type", "debit").gte("txn_date", start_date).lte("txn_date", end_date).execute()
            spent = sum([float(t.get("amount", 0)) for t in (tx_res.data or [])])

            supabase.table("budgets").update({"spent_amount": spent}).eq("id", b["id"]).execute()
            updated_count += 1

        return {"status": "success", "updated": updated_count}
    except Exception as e:
        print(f"Error recomputing budget spent: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to recompute budget spending")


