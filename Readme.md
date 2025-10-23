# Finance AI Assistant

## Setup

1. Create `.env` in `target/` with:

```
GEMINI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_service_role_or_anon_key
```

2. Install deps:

```
pip install -r target/requirements.txt
```

3. Run API:

```
uvicorn target.backend.main:app --reload
```

## Endpoints
- `GET /health`
- `POST /api/chat`
- `POST /api/sessions`
- `GET /api/sessions/{user_id}`
- `GET /api/history/{session_id}`

