from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import transactions, chat, insights, auth, profile, categories, budgets, goals, sessions, analytics, report, ai_categorization

app = FastAPI(title="AI Finance Assistant API")

# ✅ Add this CORS section
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <-- for demo: allows everything
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(profile.router)
app.include_router(categories.router)
app.include_router(budgets.router)
app.include_router(goals.router)
app.include_router(sessions.router)
app.include_router(analytics.router)
app.include_router(report.router)
app.include_router(ai_categorization.router)
app.include_router(transactions.router)
app.include_router(chat.router)
app.include_router(insights.router)

@app.get("/")
def home():
    return {"message": "AI Finance Assistant backend running"}
