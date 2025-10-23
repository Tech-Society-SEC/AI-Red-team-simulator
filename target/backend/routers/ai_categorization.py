from fastapi import APIRouter, Depends, HTTPException, status
from services.supabase_client import supabase
from services.gemini_service import ask_gemini
from utils.auth import get_current_user_id
import json

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.post("/categorize-transaction")
async def categorize_transaction(
    body: dict,
    user_id: str = Depends(get_current_user_id)
):
    """AI-powered transaction categorization"""
    try:
        description = body.get("description", "")
        merchant = body.get("merchant", "")
        amount = body.get("amount", 0)
        
        if not description and not merchant:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Description or merchant is required"
            )

        # Get user's existing categories
        categories_res = supabase.table("categories").select("name").eq("user_id", user_id).execute()
        existing_categories = [cat["name"] for cat in (categories_res.data or [])]
        
        # Create context for AI
        context = f"""
        Transaction details:
        - Description: {description}
        - Merchant: {merchant}
        - Amount: ₹{amount}
        
        Existing categories: {', '.join(existing_categories) if existing_categories else 'None'}
        
        Please suggest the most appropriate category for this transaction.
        Return only the category name, nothing else.
        """
        
        # Get AI suggestion
        suggested_category = ask_gemini(
            prompt="Categorize this transaction",
            context=context,
            system_instruction="You are a financial categorization expert. Analyze transaction details and suggest the most appropriate spending category. Return only the category name."
        ).strip()
        
        return {
            "status": "success",
            "suggested_category": suggested_category,
            "confidence": "high" if suggested_category in existing_categories else "medium"
        }
        
    except Exception as e:
        print(f"Error in AI categorization: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to categorize transaction"
        )


@router.post("/generate-insights")
async def generate_insights(
    body: dict,
    user_id: str = Depends(get_current_user_id)
):
    """Generate AI insights based on user's financial data"""
    try:
        insight_type = body.get("type", "spending_pattern")
        
        # Get relevant data based on insight type
        if insight_type == "spending_pattern":
            # Get recent transactions
            tx_res = supabase.table("transactions").select("*").eq("user_id", user_id).order("txn_date", desc=True).limit(50).execute()
            transactions = tx_res.data or []
            
            context = f"Recent transactions: {json.dumps(transactions[:10], default=str)}"
            prompt = "Analyze the spending patterns and provide insights about spending habits, trends, and recommendations."
            
        elif insight_type == "budget_alert":
            # Get budgets and spending
            budgets_res = supabase.table("budgets").select("*").eq("user_id", user_id).execute()
            budgets = budgets_res.data or []
            
            context = f"Budget data: {json.dumps(budgets, default=str)}"
            prompt = "Analyze budget performance and provide alerts about overspending or budget utilization."
            
        elif insight_type == "goal_progress":
            # Get goals
            goals_res = supabase.table("goals").select("*").eq("user_id", user_id).execute()
            goals = goals_res.data or []
            
            context = f"Goals data: {json.dumps(goals, default=str)}"
            prompt = "Analyze goal progress and provide motivational insights and recommendations."
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid insight type"
            )
        
        # Generate AI insight
        insight_summary = ask_gemini(
            prompt=prompt,
            context=context,
            system_instruction="You are a financial advisor. Provide personalized, actionable insights based on the user's financial data. Be encouraging and specific."
        )
        
        # Store the insight
        insight_data = {
            "user_id": user_id,
            "type": insight_type,
            "summary": insight_summary,
            "data": {"generated_at": "now()"}
        }
        
        result = supabase.table("insights").insert(insight_data).execute()
        created_insight = (result.data or [None])[0]
        
        return {
            "status": "success",
            "insight": created_insight
        }
        
    except Exception as e:
        print(f"Error generating insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate insights"
        )


@router.post("/budget-recommendations")
async def get_budget_recommendations(
    user_id: str = Depends(get_current_user_id)
):
    """Get AI-powered budget recommendations"""
    try:
        # Get user's spending data
        tx_res = supabase.table("transactions").select("*").eq("user_id", user_id).eq("type", "debit").execute()
        transactions = tx_res.data or []
        
        if not transactions:
            return {
                "status": "success",
                "recommendations": ["Start by adding some transactions to get personalized budget recommendations."]
            }
        
        # Analyze spending by category
        category_spending = {}
        for txn in transactions:
            category = txn.get("category", "Uncategorized")
            amount = float(txn.get("amount", 0))
            category_spending[category] = category_spending.get(category, 0) + amount
        
        context = f"Spending by category: {json.dumps(category_spending, indent=2)}"
        prompt = "Based on this spending data, provide specific budget recommendations for each category. Suggest realistic monthly limits."
        
        recommendations = ask_gemini(
            prompt=prompt,
            context=context,
            system_instruction="You are a financial planning expert. Provide specific, actionable budget recommendations based on spending patterns. Format as a list of recommendations."
        )
        
        return {
            "status": "success",
            "recommendations": recommendations.split('\n'),
            "category_spending": category_spending
        }
        
    except Exception as e:
        print(f"Error generating budget recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate budget recommendations"
        )


@router.post("/goal-predictions")
async def get_goal_predictions(
    user_id: str = Depends(get_current_user_id)
):
    """Get AI predictions for goal achievement"""
    try:
        # Get goals and recent savings
        goals_res = supabase.table("goals").select("*").eq("user_id", user_id).eq("status", "active").execute()
        goals = goals_res.data or []
        
        if not goals:
            return {
                "status": "success",
                "predictions": ["Create some savings goals to get predictions."]
            }
        
        # Get recent income transactions
        income_res = supabase.table("transactions").select("*").eq("user_id", user_id).eq("type", "credit").order("txn_date", desc=True).limit(20).execute()
        income_transactions = income_res.data or []
        
        context = f"""
        Active goals: {json.dumps(goals, default=str)}
        Recent income: {json.dumps(income_transactions[:5], default=str)}
        """
        
        prompt = "Analyze these goals and income patterns. Predict which goals will be achieved on time, which might be missed, and provide specific recommendations for goal achievement."
        
        predictions = ask_gemini(
            prompt=prompt,
            context=context,
            system_instruction="You are a financial planning expert. Analyze goal progress and income patterns to provide accurate predictions and actionable advice for goal achievement."
        )
        
        return {
            "status": "success",
            "predictions": predictions.split('\n'),
            "goals_analyzed": len(goals)
        }
        
    except Exception as e:
        print(f"Error generating goal predictions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate goal predictions"
        )
