from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status, Query
from services.supabase_client import supabase
from utils.csv_parser import parse_transactions
from utils.auth import get_current_user_id
import datetime

router = APIRouter(prefix="/transactions", tags=["Transactions"])

# ---------------------------------------------

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_csv(
    file: UploadFile = File(...),
    # The user_id is retrieved securely via the Depends dependency
    user_id: str = Depends(get_current_user_id) 
):
    # 1. Input Validation: Check file type
    if file.content_type != 'text/csv':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid file type. Only CSV files are accepted."
        )

    # 2. Read file content safely
    try:
        content = await file.read()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to read file content."
        )

    # 3. Parse and Validate Transactions
    try:
        # Pass the file content AND the authenticated user_id to the parser.
        # The parser is now responsible for:
        # a) Mapping columns (e.g., 'date' -> 'txn_date').
        # b) Converting data types (Date and Amount).
        # c) Adding the 'user_id' to every record.
        transactions_to_insert = parse_transactions(content, user_id)
        for t in transactions_to_insert:
          if isinstance(t.get("txn_date"), (datetime.date, datetime.datetime)):
             t["txn_date"] = t["txn_date"].isoformat()
        
    except ValueError as e:
        # Catch specific validation errors from the parser
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"CSV Parsing Error: {e.args[0]}"
        )
    
    if not transactions_to_insert:
        return {"status": "warning", "message": "No valid transactions found in the CSV."}
    
    # 4. Check for duplicates before insertion
    try:
        # Get existing transactions for this user
        existing_result = supabase.table("transactions")\
            .select("amount, txn_date, description")\
            .eq("user_id", user_id)\
            .execute()
        
        existing_transactions = existing_result.data or []
        existing_keys = set()
        
        for txn in existing_transactions:
            key = f"{txn['amount']}-{txn['txn_date']}-{txn.get('description', '')}"
            existing_keys.add(key)
        
        # Filter out duplicates
        new_transactions = []
        duplicates_found = 0
        
        for txn in transactions_to_insert:
            key = f"{txn['amount']}-{txn['txn_date']}-{txn.get('description', '')}"
            if key not in existing_keys:
                new_transactions.append(txn)
            else:
                duplicates_found += 1
        
        if not new_transactions:
            return {
                "status": "warning", 
                "message": f"All {len(transactions_to_insert)} transactions were duplicates. No new data imported.",
                "count": 0,
                "duplicates": duplicates_found
            }
        
        # Insert only new transactions
        data, count = supabase.table("transactions").insert(new_transactions).execute()
        
        # We use count[1] to get the number of successfully inserted rows
        inserted_count = count[1] if isinstance(count, list) and len(count) > 1 else 0
        
        message = f"Successfully imported {inserted_count} transactions."
        if duplicates_found > 0:
            message += f" {duplicates_found} duplicate transactions were skipped."
        
        return {
            "status": "success", 
            "message": message,
            "count": inserted_count,
            "duplicates": duplicates_found
        }
        
    except Exception as e:
        # Catch database-level errors (e.g., unique constraints, RLS failure on insert)
        print(f"Supabase Insertion Error: {e}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to insert transactions into the database due to a server error."
        )

@router.get("/")
async def get_transactions(
    user_id: str = Depends(get_current_user_id),
    start_date: str | None = Query(default=None, description="YYYY-MM-DD inclusive"),
    end_date: str | None = Query(default=None, description="YYYY-MM-DD inclusive"),
    category: str | None = Query(default=None),
    type: str | None = Query(default=None, pattern="^(credit|debit)$"),
    merchant: str | None = Query(default=None),
    search: str | None = Query(default=None, description="Search in description"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200)
):
    """Get transactions for the authenticated user with filters and pagination"""
    try:
        q = supabase.table("transactions").select("*").eq("user_id", user_id)

        if start_date:
            q = q.gte("txn_date", start_date)
        if end_date:
            q = q.lte("txn_date", end_date)
        if category:
            q = q.eq("category", category)
        if type:
            q = q.eq("type", type)
        if merchant:
            q = q.eq("merchant", merchant)
        if search:
            q = q.ilike("description", f"%{search}%")

        # Pagination using range
        start = (page - 1) * page_size
        end = start + page_size - 1

        result = q.order("txn_date", desc=True).range(start, end).execute()

        return {
            "status": "success",
            "transactions": result.data,
            "count": len(result.data) if result.data else 0,
            "page": page,
            "page_size": page_size
        }
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch transactions"
        )

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_transaction(
    body: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Manually add a transaction for the authenticated user"""
    required_fields = ["txn_date", "amount", "type"]
    missing = [f for f in required_fields if f not in body]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required fields: {', '.join(missing)}"
        )

    if body.get("type") not in ("credit", "debit"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="type must be 'credit' or 'debit'")

    # Attach user_id
    payload = {
        "user_id": user_id,
        "txn_date": body.get("txn_date"),
        "description": body.get("description"),
        "category": body.get("category"),
        "merchant": body.get("merchant"),
        "type": body.get("type"),
        "amount": body.get("amount"),
    }

    try:
        result = supabase.table("transactions").insert(payload).execute()
        created = (result.data or [None])[0]
        return {"status": "success", "transaction": created}
    except Exception as e:
        print(f"Error creating transaction: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create transaction")

@router.put("/{transaction_id}")
async def update_transaction(
    transaction_id: str,
    body: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Update a specific transaction owned by the user"""
    allowed_fields = {"txn_date", "description", "category", "merchant", "type", "amount"}
    updates = {k: v for k, v in body.items() if k in allowed_fields}

    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid fields to update")

    if "type" in updates and updates["type"] not in ("credit", "debit"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="type must be 'credit' or 'debit'")

    try:
        # Ensure transaction belongs to the user
        check = supabase.table("transactions").select("id").eq("id", transaction_id).eq("user_id", user_id).execute()
        if not check.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found or access denied")

        result = supabase.table("transactions").update(updates).eq("id", transaction_id).execute()
        updated = (result.data or [None])[0]
        return {"status": "success", "transaction": updated}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating transaction: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update transaction")

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a specific transaction"""
    try:
        # First verify the transaction belongs to the user
        check_result = supabase.table("transactions")\
            .select("id")\
            .eq("id", transaction_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not check_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found or access denied"
            )
        
        # Delete the transaction
        result = supabase.table("transactions")\
            .delete()\
            .eq("id", transaction_id)\
            .execute()
        
        return {
            "status": "success",
            "message": "Transaction deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting transaction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete transaction"
        )
