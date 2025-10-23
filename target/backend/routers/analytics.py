from fastapi import APIRouter, Depends, HTTPException, status
from services.supabase_client import supabase
from utils.auth import get_current_user_id

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/")
async def get_analytics(user_id: str = Depends(get_current_user_id)):
    """Return aggregate analytics for dashboard widgets."""
    try:
        # Spending by category (debits)
        res_cat = supabase.rpc("execute", {
            "query": "select category, sum(amount) as total from transactions where user_id = :uid and type = 'debit' group by category",
            "params": {"uid": user_id}
        }).execute()
    except Exception:
        # Fallback: naive client aggregation if rpc not available
        try:
            tx = supabase.table("transactions").select("category, amount, type").eq("user_id", user_id).execute().data or []
            spend_by_cat = {}
            for t in tx:
                if t.get("type") == "debit":
                    key = t.get("category") or "Uncategorized"
                    spend_by_cat[key] = spend_by_cat.get(key, 0) + float(t.get("amount", 0))
        except Exception as e:
            print(f"Analytics error: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to compute analytics")

    # Income vs expense
    income = sum(float(t.get("amount", 0)) for t in (tx if 'tx' in locals() else []) if t.get("type") == "credit")
    expense = sum(float(t.get("amount", 0)) for t in (tx if 'tx' in locals() else []) if t.get("type") == "debit")

    return {
        "status": "success",
        "spending_by_category": spend_by_cat if 'spend_by_cat' in locals() else (res_cat.data or []),
        "income": income,
        "expense": expense
    }


