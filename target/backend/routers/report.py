from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from services.supabase_client import supabase
from utils.auth import get_current_user_id
from services.gemini_service import ask_gemini

router = APIRouter(prefix="/report", tags=["Report"])


@router.get("/")
async def generate_report(user_id: str = Depends(get_current_user_id)):
    try:
        # Fetch basic data
        tx = supabase.table("transactions").select("txn_date, amount, type, category").eq("user_id", user_id).order("txn_date", desc=True).limit(100).execute().data or []
        # Simple AI summary
        context_lines = [f"{t['txn_date']} | {t['type']} | {t.get('category','')} | {t['amount']}" for t in tx[:50]]
        context = "\n".join(context_lines)
        summary = ask_gemini("Write a monthly financial summary in 5 bullet points.", context=context)

        # Build PDF
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 50
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "Monthly Financial Report")
        y -= 30
        p.setFont("Helvetica", 10)
        for line in summary.split("\n"):
            if not line.strip():
                continue
            p.drawString(50, y, line[:110])
            y -= 14
            if y < 60:
                p.showPage()
                y = height - 50
                p.setFont("Helvetica", 10)

        p.showPage()
        p.save()
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=report.pdf"})
    except Exception as e:
        print(f"Report generation error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate report")


